/**
 * backend/api/postsApi.js
 *
 * Express router for post-centric features:
 * - Feeds (for-you / following / trending / explore) — powered by recommendation engine
 * - Search (hashtag search returns posts first, then hashtags, then users)
 * - Post CRUD + soft-delete/restore
 * - Engagement toggles (likes, bookmarks, reposts)
 * - Interest updates on every engagement action
 * - Optional image upload/delete via Cloudinary
 *
 * Mounted at `/api/posts` in backend/server.js.
 */
import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import upload from '../middleware/uploadMiddleware.js'
import {
  validateCreatePostBody,
  validateObjectIdParam,
  validatePaginationQuery,
  validateSearchQuery,
} from '../middleware/validationMiddleware.js'
import { Post } from '../models/Post.js'
import { User } from '../models/User.js'
import { Comment } from '../models/Comment.js'
import { Follow } from '../models/Follow.js'
import { Like } from '../models/Like.js'
import { Bookmark } from '../models/Bookmark.js'
import { Repost } from '../models/Repost.js'
import { Notification } from '../models/Notification.js'
import { deleteCloudinaryImage, uploadImage } from '../services/mediaService.js'
import { updateInterestsOnEngagement, removeInterestOnDisengagement, getAuthorAffinityMap } from '../services/interestService.js'
import { rankPostsForHome, rankPostsForExplore } from '../services/recommendationEngine.js'
import { getTrendingHashtagSet, calculateTrendingHashtags, getTrendingCategories } from '../services/trendingService.js'

export const postApp = express.Router()

// ─── HELPER: Attach isLiked / isBookmarked / isReposted flags to posts ──────
async function attachEngagementFlags(posts, userId) {
  const postIds = posts.map(p => p._id)
  const [userLikes, userBookmarks, userReposts] = await Promise.all([
    Like.find({ user: userId, post: { $in: postIds } }),
    Bookmark.find({ user: userId, post: { $in: postIds } }),
    Repost.find({ user: userId, post: { $in: postIds } }),
  ])
  const likedSet = new Set(userLikes.map(l => l.post.toString()))
  const bookmarkedSet = new Set(userBookmarks.map(b => b.post.toString()))
  const repostedSet = new Set(userReposts.map(r => r.post.toString()))

  return posts.map(post => {
    const pObj = post.toObject ? post.toObject() : { ...post }
    pObj.isLiked = likedSet.has(pObj._id.toString())
    pObj.isBookmarked = bookmarkedSet.has(pObj._id.toString())
    pObj.isReposted = repostedSet.has(pObj._id.toString())
    return pObj
  })
}

// ─── 1. SEARCH ENDPOINT (MUST BE FIRST TO AVOID ROUTE COLLISION) ─────────────
postApp.get('/search', protect, validateSearchQuery({ paramName: 'q', maxLength: 100 }), async (req, res, next) => {
  try {
    const { q, type } = req.query
    if (!q || q.trim() === '') {
      return res.status(200).json({ message: 'empty query', payload: { posts: [], hashtags: [], users: [] } })
    }

    const searchTerm = q.trim()
    const isHashtagSearch = searchTerm.startsWith('#')

    // If explicit type=users, only search users
    if (type === 'users') {
      const users = await User.find({ $text: { $search: searchTerm } }).limit(20)
      return res.status(200).json({ message: 'users found', payload: { posts: [], hashtags: [], users } })
    }

    // ─── Posts search (prioritized) ───────────────────────────────────────
    let posts = []
    if (isHashtagSearch) {
      // Exact hashtag search + fuzzy (strip # for regex)
      const hashtagClean = searchTerm.replace(/^#/, '').toLowerCase()
      const escapedHashtag = hashtagClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

      posts = await Post.find({
        isDeleted: false,
        hashtags: { $regex: escapedHashtag, $options: 'i' },
      })
        .sort({ likesCount: -1, createdAt: -1 })
        .limit(30)
        .populate('author', 'username profilePicture')
    } else {
      // Full-text search across content, hashtags, and category
      posts = await Post.find({
        $text: { $search: searchTerm },
        isDeleted: false,
      })
        .sort({ score: { $meta: 'textScore' } })
        .limit(30)
        .populate('author', 'username profilePicture')
    }

    const postsWithFlags = await attachEngagementFlags(posts, req.user._id)

    // ─── Trending hashtags matching the query ─────────────────────────────
    const allTrending = await calculateTrendingHashtags(72, 30)
    const queryLower = searchTerm.replace(/^#/, '').toLowerCase()
    const matchingHashtags = allTrending.filter(t =>
      t.hashtag.toLowerCase().replace(/^#/, '').includes(queryLower)
    ).slice(0, 10)

    // ─── Users matching the query (secondary) ─────────────────────────────
    const escapedQuery = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const users = await User.find({
      $or: [
        { username: { $regex: escapedQuery, $options: 'i' } },
        { bio: { $regex: escapedQuery, $options: 'i' } },
      ],
      _id: { $ne: req.user._id },
    }).limit(10)

    // Check follow status for returned users
    const userIds = users.map(u => u._id)
    const activeFollows = await Follow.find({ follower: req.user._id, following: { $in: userIds } })
    const followedIds = new Set(activeFollows.map(f => f.following.toString()))
    const usersWithFollow = users.map(u => {
      const uObj = u.toObject ? u.toObject() : u
      return { ...uObj, isFollowing: followedIds.has(uObj._id.toString()) }
    })

    return res.status(200).json({
      message: 'search results',
      payload: {
        posts: postsWithFlags,
        hashtags: matchingHashtags,
        users: usersWithFollow,
      },
    })
  } catch (err) { next(err) }
})

// ─── 2. FEED ENDPOINTS ───────────────────────────────────────────────────────

// ─── GET For You Feed (Recommendation Engine) ────────────────────────────────
postApp.get('/for-you', protect, validatePaginationQuery({ maxLimit: 50 }), async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 0
    const limit = parseInt(req.query.limit) || 10

    // Step 1: Fetch user profile
    const currentUser = await User.findById(req.user._id)
    const interestMap = currentUser?.interestScores
      ? Object.fromEntries(currentUser.interestScores)
      : {}

    // Step 2: Fetch followed users
    const follows = await Follow.find({ follower: req.user._id })
    const followingIds = follows.map(f => f.following)

    // Step 3: Fetch trending hashtags & author affinity
    const [trendingHashtags, authorAffinityMap] = await Promise.all([
      getTrendingHashtagSet(72, 20),
      getAuthorAffinityMap(req.user._id),
    ])

    // Step 4: Candidate generation (~200 posts)
    // Pull from 3 sources: interest-matching, trending, and followed authors
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600000)
    const topInterests = Object.entries(interestMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([key]) => key)

    // Build OR conditions for candidate fetching
    const candidateConditions = [
      // Source A: Posts matching top interests (by category or hashtags)
      ...(topInterests.length > 0
        ? [{
            $or: [
              { category: { $in: topInterests } },
              { hashtags: { $in: topInterests.map(i => new RegExp(i, 'i')) } },
            ]
          }]
        : []),
      // Source B: Posts from followed authors
      ...(followingIds.length > 0
        ? [{ author: { $in: followingIds } }]
        : []),
      // Source C: Posts with trending hashtags
      ...(trendingHashtags.size > 0
        ? [{ hashtags: { $in: [...trendingHashtags].map(t => new RegExp(t, 'i')) } }]
        : []),
    ]

    // Fallback: if no conditions, get recent posts
    const matchFilter = {
      isDeleted: false,
      author: { $ne: req.user._id },
      createdAt: { $gte: sevenDaysAgo },
    }

    if (candidateConditions.length > 0) {
      matchFilter.$or = candidateConditions
    }

    const candidates = await Post.find(matchFilter)
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('author', 'username profilePicture')

    // If candidates are too few, backfill with recent posts
    let allCandidates = [...candidates]
    if (allCandidates.length < 50) {
      const backfill = await Post.find({
        isDeleted: false,
        author: { $ne: req.user._id },
        _id: { $nin: allCandidates.map(p => p._id) },
      })
        .sort({ createdAt: -1 })
        .limit(200 - allCandidates.length)
        .populate('author', 'username profilePicture')
      allCandidates = [...allCandidates, ...backfill]
    }

    // Step 5: Score and rank using recommendation engine
    const ranked = rankPostsForHome(allCandidates, interestMap, trendingHashtags, authorAffinityMap)

    // Step 6: Paginate
    const start = page * limit
    const paginatedPosts = ranked.slice(start, start + limit)

    // Step 7: Attach engagement flags
    const payload = await attachEngagementFlags(paginatedPosts, req.user._id)

    res.status(200).json({
      message:     'for-you feed fetched',
      payload,
      currentPage: page,
      totalPages:  Math.ceil(ranked.length / limit),
      hasMore:     start + paginatedPosts.length < ranked.length,
    })
  } catch (err) { next(err) }
})

// ─── GET Following Feed (Strict — only followed accounts) ────────────────────
postApp.get('/following', protect, validatePaginationQuery({ maxLimit: 50 }), async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 0
    const limit = parseInt(req.query.limit) || 10

    const follows = await Follow.find({ follower: req.user._id })
    const followingIds = follows.map(f => f.following)

    // Strict: only followed accounts. If following no one, return empty.
    if (followingIds.length === 0) {
      return res.status(200).json({
        message:     'following feed fetched',
        payload:     [],
        currentPage: page,
        totalPages:  0,
        hasMore:     false,
      })
    }

    const filter = { author: { $in: followingIds }, isDeleted: false }

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit)
      .populate('author', 'username profilePicture')

    const payload = await attachEngagementFlags(posts, req.user._id)

    const total = await Post.countDocuments(filter)
    res.status(200).json({
      message:     'following feed fetched',
      payload,
      currentPage: page,
      totalPages:  Math.ceil(total / limit),
      hasMore:     page * limit + posts.length < total,
    })
  } catch (err) { next(err) }
})

// ─── GET Trending Feed (Hot hashtags with velocity) ──────────────────────────
postApp.get('/trending', protect, validatePaginationQuery({ maxLimit: 50 }), async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 0
    const limit = parseInt(req.query.limit) || 10

    // Get trending hashtags
    const trendingTopics = await calculateTrendingHashtags(72, 20)

    // Get trending posts (high engagement + recency)
    const pipeline = [
      { $match: { isDeleted: false } },
      {
        $addFields: {
          hoursElapsed: {
            $divide: [{ $subtract: [new Date(), '$createdAt'] }, 3600000],
          },
        },
      },
      {
        $addFields: {
          engagementScore: {
            $add: [
              { $multiply: [{ $ifNull: ['$likesCount', 0] }, 3] },
              { $multiply: [{ $ifNull: ['$commentsCount', 0] }, 5] },
              { $multiply: [{ $ifNull: ['$repostsCount', 0] }, 4] },
              { $multiply: [{ $ifNull: ['$bookmarksCount', 0] }, 2] },
            ],
          },
        },
      },
      {
        $addFields: {
          score: {
            $add: [
              '$engagementScore',
              {
                $divide: [
                  200,
                  { $pow: [{ $add: ['$hoursElapsed', 2] }, 1.2] },
                ],
              },
            ],
          },
        },
      },
      { $sort: { score: -1 } },
      { $skip: page * limit },
      { $limit: limit },
    ]

    const posts = await Post.aggregate(pipeline)
    const populated = await Post.populate(posts, { path: 'author', select: 'username profilePicture' })

    const payload = await attachEngagementFlags(populated, req.user._id)

    const total = await Post.countDocuments({ isDeleted: false })
    res.status(200).json({
      message:        'trending feed fetched',
      payload,
      trendingTopics, // Include trending hashtag metadata for the frontend
      currentPage:    page,
      totalPages:     Math.ceil(total / limit),
      hasMore:        page * limit + posts.length < total,
    })
  } catch (err) { next(err) }
})

// ─── GET Explore Feed (Discovery Engine) ─────────────────────────────────────
postApp.get('/explore', protect, validatePaginationQuery({ maxLimit: 50 }), async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 0
    const limit = parseInt(req.query.limit) || 10

    // Fetch user's onboarding interests
    const currentUser = await User.findById(req.user._id)
    const onboardingInterests = currentUser?.onboardingInterests || []
    const onboardingSet = new Set(onboardingInterests.map(i => i.toLowerCase()))

    // Get trending categories for the 30% trending mix
    const trendingCategories = await getTrendingCategories(72, 10)
    const trendingHashtags = await getTrendingHashtagSet(72, 20)

    // Candidate generation for Explore:
    // 70% from categories NOT in onboarding + 30% from trending categories
    const unseenCategories = []
    const allCategories = await Post.distinct('category', { isDeleted: false })
    for (const cat of allCategories) {
      if (!onboardingSet.has(cat.toLowerCase())) {
        unseenCategories.push(cat)
      }
    }

    // Fetch unseen category posts (70% of pool)
    const unseenPosts = await Post.find({
      isDeleted: false,
      author: { $ne: req.user._id },
      ...(unseenCategories.length > 0 ? { category: { $in: unseenCategories } } : {}),
    })
      .sort({ likesCount: -1, createdAt: -1 })
      .limit(140)
      .populate('author', 'username profilePicture')

    // Fetch trending category posts (30% of pool)
    const trendingPosts = await Post.find({
      isDeleted: false,
      author: { $ne: req.user._id },
      category: { $in: trendingCategories },
      _id: { $nin: unseenPosts.map(p => p._id) },
    })
      .sort({ likesCount: -1, createdAt: -1 })
      .limit(60)
      .populate('author', 'username profilePicture')

    const allCandidates = [...unseenPosts, ...trendingPosts]

    // Score and rank using explore ranking
    const ranked = rankPostsForExplore(allCandidates, onboardingInterests, trendingHashtags)

    // Paginate
    const start = page * limit
    const paginatedPosts = ranked.slice(start, start + limit)

    const payload = await attachEngagementFlags(paginatedPosts, req.user._id)

    res.status(200).json({
      message:     'explore feed fetched',
      payload,
      currentPage: page,
      totalPages:  Math.ceil(ranked.length / limit),
      hasMore:     start + paginatedPosts.length < ranked.length,
    })
  } catch (err) { next(err) }
})

// ─── GET Trending Tags ───────────────────────────────────────────────────────
postApp.get('/trending-tags', protect, async (req, res, next) => {
  try {
    const trending = await calculateTrendingHashtags(72, 15)
    res.status(200).json({ message: 'trending tags fetched', payload: trending })
  } catch (err) { next(err) }
})

// ─── GET User Suggestions / Follow recommendations (Dot Product interest matching)
postApp.get('/recommended-users', protect, async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user._id)
    const follows = await Follow.find({ follower: req.user._id })
    const followingIds = follows.map(f => f.following.toString())

    const excludeIds = [...followingIds, req.user._id.toString()]

    // Grab a pool of candidate users
    const candidates = await User.find({ _id: { $nin: excludeIds } }).limit(100)

    const candidateIds = candidates.map(c => c._id)
    const candidateFollows = await Follow.find({ follower: { $in: candidateIds } })

    const candidateFollowMap = {}
    candidateFollows.forEach(f => {
      const fid = f.follower.toString()
      if (!candidateFollowMap[fid]) candidateFollowMap[fid] = []
      candidateFollowMap[fid].push(f.following.toString())
    })

    const userInterestScores = currentUser?.interestScores ? Object.fromEntries(currentUser.interestScores) : {}

    const rankedCandidates = candidates.map(candidate => {
      const candInterestScores = candidate.interestScores ? Object.fromEntries(candidate.interestScores) : {}

      // Calculate Dot Product of interests
      let dotProduct = 0
      Object.keys(userInterestScores).forEach(cat => {
        if (candInterestScores[cat]) {
          dotProduct += userInterestScores[cat] * candInterestScores[cat]
        }
      })

      // Calculate Mutual Follows count
      const candFollowing = candidateFollowMap[candidate._id.toString()] || []
      const mutuals = candFollowing.filter(id => followingIds.includes(id))
      const mutualCount = mutuals.length

      const score = (dotProduct * 100) + (mutualCount * 10)

      return {
        user: candidate,
        score
      }
    })

    rankedCandidates.sort((a, b) => b.score - a.score)
    const payload = rankedCandidates.slice(0, 5).map(rc => rc.user)

    res.status(200).json({ message: 'recommended users fetched', payload })
  } catch (err) { next(err) }
})

// ─── 3. BASIC CRUDS & POST MANAGEMENT ────────────────────────────────────────

// Get posts by a user
postApp.get('/user/:id', protect, validateObjectIdParam('id'), async (req, res, next) => {
  try {
    const posts = await Post.find({ author: req.params.id, isDeleted: false })
      .sort({ createdAt: -1 })
      .populate('author', 'username profilePicture')

    const payload = await attachEngagementFlags(posts, req.user._id)

    res.status(200).json({ message: 'user posts fetched', payload })
  } catch (err) { next(err) }
})

// Get single post
postApp.get('/:id', protect, validateObjectIdParam('id'), async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false })
      .populate('author', 'username profilePicture')
    if (!post) return res.status(404).json({ message: 'Post not found' })

    const [likeRecord, bookmarkRecord, repostRecord] = await Promise.all([
      Like.findOne({ post: post._id, user: req.user._id }),
      Bookmark.findOne({ post: post._id, user: req.user._id }),
      Repost.findOne({ post: post._id, user: req.user._id }),
    ])

    res.status(200).json({
      message: 'post found',
      payload: post,
      isLiked: !!likeRecord,
      isBookmarked: !!bookmarkRecord,
      isReposted: !!repostRecord,
    })
  } catch (err) { next(err) }
})

// Create post (protected + optional image upload)
postApp.post('/', protect, upload.single('image'), validateCreatePostBody, async (req, res, next) => {
  let uploadedImage = null

  try {
    const { content, category } = req.body
    if ((!content || content.trim() === '') && !req.file) {
      return res.status(400).json({ message: 'Post content or image is required' })
    }

    const postCategory = category ? category.trim().toLowerCase() : 'lifestyle'

    let imageUrl = null
    let imagePublicId = null

    if (req.file) {
      uploadedImage = await uploadImage(req.file)
      // Suffix URL with quality and format optimizations for Cloudinary delivery
      imageUrl = uploadedImage.secure_url
      imagePublicId = uploadedImage.public_id
    }

    // Extract hashtags from content
    const tags = content ? (content.match(/#[a-zA-Z0-9_]+/g) || []) : []

    const post = await Post.create({
      author: req.user._id,
      content: content ? content.trim() : '',
      imageUrl,
      imagePublicId,
      category: postCategory,
      hashtags: tags,
      likesCount: 0,
      bookmarksCount: 0,
      commentsCount: 0,
      repostsCount: 0,
    })

    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: 1 } })
    const populatedPost = await post.populate('author', 'username profilePicture')

    const pObj = populatedPost.toObject()
    pObj.isLiked = false
    pObj.isBookmarked = false
    pObj.isReposted = false

    res.status(201).json({ message: 'post created', payload: pObj })
  } catch (err) {
    if (uploadedImage?.public_id) {
      try {
        await deleteCloudinaryImage(uploadedImage.public_id)
      } catch {
        // Ignore cleanup failures
      }
    }
    next(err)
  }
})

// Soft delete post
postApp.patch('/:id', protect, validateObjectIdParam('id'), async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post || post.isDeleted) return res.status(404).json({ message: 'Post not found' })
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' })
    }

    post.isDeleted = true
    await post.save()
    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: -1 } })
    res.status(200).json({ message: 'post deleted' })
  } catch (err) { next(err) }
})

// ─── Like / Unlike Toggle (+ interest update) ───────────────────────────────
postApp.post('/:id/like', protect, validateObjectIdParam('id'), async (req, res, next) => {
  try {
    const postId = req.params.id
    const userId = req.user._id
    const post = await Post.findOne({ _id: postId, isDeleted: false })
    if (!post) return res.status(404).json({ message: 'Post not found' })

    const existingLike = await Like.findOne({ post: postId, user: userId })
    let liked = false

    if (existingLike) {
      await Like.findOneAndDelete({ _id: existingLike._id })
      liked = false

      // Remove interest signal
      await removeInterestOnDisengagement(userId, post, 'like')
    } else {
      await Like.create({ post: postId, user: userId })
      liked = true

      // Update interest profile
      await updateInterestsOnEngagement(userId, post, 'like')

      // Create notification
      if (post.author.toString() !== userId.toString()) {
        await Notification.create({
          recipient: post.author,
          sender:    userId,
          type:      'like',
          post:      postId
        })
      }
    }

    const updatedPost = await Post.findById(postId)
    res.status(200).json({
      message:    'like toggled',
      liked,
      likesCount: updatedPost.likesCount
    })
  } catch (err) { next(err) }
})

// ─── Repost / Unrepost Toggle (+ interest update) ───────────────────────────
postApp.post('/:id/repost', protect, validateObjectIdParam('id'), async (req, res, next) => {
  try {
    const postId = req.params.id
    const userId = req.user._id
    const post = await Post.findOne({ _id: postId, isDeleted: false })
    if (!post) return res.status(404).json({ message: 'Post not found' })

    const existingRepost = await Repost.findOne({ post: postId, user: userId })
    let reposted = false

    if (existingRepost) {
      await Repost.findOneAndDelete({ _id: existingRepost._id })
      reposted = false

      await removeInterestOnDisengagement(userId, post, 'repost')
    } else {
      await Repost.create({ post: postId, user: userId })
      reposted = true

      await updateInterestsOnEngagement(userId, post, 'repost')

      // Create notification
      if (post.author.toString() !== userId.toString()) {
        await Notification.create({
          recipient: post.author,
          sender:    userId,
          type:      'repost',
          post:      postId
        })
      }
    }

    const updatedPost = await Post.findById(postId)
    res.status(200).json({
      message:      'repost toggled',
      reposted,
      repostsCount: updatedPost.repostsCount,
    })
  } catch (err) { next(err) }
})

// ─── Bookmark / Unbookmark Toggle (+ interest update) ────────────────────────
postApp.post('/:id/bookmark', protect, validateObjectIdParam('id'), async (req, res, next) => {
  try {
    const postId = req.params.id
    const userId = req.user._id
    const post = await Post.findOne({ _id: postId, isDeleted: false })
    if (!post) return res.status(404).json({ message: 'Post not found' })

    const existingBookmark = await Bookmark.findOne({ post: postId, user: userId })
    let bookmarked = false

    if (existingBookmark) {
      await Bookmark.findOneAndDelete({ _id: existingBookmark._id })
      bookmarked = false

      await removeInterestOnDisengagement(userId, post, 'bookmark')
    } else {
      await Bookmark.create({ post: postId, user: userId })
      bookmarked = true

      await updateInterestsOnEngagement(userId, post, 'bookmark')
    }

    const updatedPost = await Post.findById(postId)
    res.status(200).json({
      message:        'bookmark toggled',
      bookmarked,
      bookmarksCount: updatedPost.bookmarksCount
    })
  } catch (err) { next(err) }
})

// Get user archives
postApp.get('/archives/user', protect, async (req, res, next) => {
  try {
    const archivedPosts = await Post.find({ author: req.user._id, isDeleted: true })
      .sort({ updatedAt: -1 })
      .populate('author', 'username profilePicture')
    res.status(200).json({ message: 'archived posts fetched', payload: archivedPosts })
  } catch (err) { next(err) }
})

// Restore archived post
postApp.patch('/:id/restore', protect, validateObjectIdParam('id'), async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post || !post.isDeleted) return res.status(404).json({ message: 'Archived post not found' })
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to restore this post' })
    }

    post.isDeleted = false
    await post.save()
    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: 1 } })
    res.status(200).json({ message: 'post restored', payload: post })
  } catch (err) { next(err) }
})

// Permanent delete post (protected — own post only)
postApp.delete('/:id', protect, validateObjectIdParam('id'), async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' })
    }

    // Delete image from Cloudinary if it exists
    if (post.imagePublicId) {
      try {
        await deleteCloudinaryImage(post.imagePublicId)
      } catch (cloudinaryErr) {
        console.warn(`Failed to delete Cloudinary image: ${cloudinaryErr.message}`)
      }
    }

    if (!post.isDeleted) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: -1 } })
    }

    // Clean up related database documents
    await Promise.all([
      Comment.deleteMany({ post: post._id }),
      Like.deleteMany({ post: post._id }),
      Bookmark.deleteMany({ post: post._id })
    ])

    await Post.findByIdAndDelete(post._id)
    res.status(200).json({ message: 'post permanently deleted' })
  } catch (err) { next(err) }
})

// Home Feed (kept for backward compatibility, mapped to for-you)
postApp.get('/', protect, async (req, res, next) => {
  try {
    req.url = '/for-you'
    postApp.handle(req, res, next)
  } catch (err) { next(err) }
})
