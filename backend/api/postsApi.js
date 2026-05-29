/**
 * backend/api/postsApi.js
 *
 * Express router for post-centric features:
 * - Feeds (for-you / following / trending)
 * - Search (kept FIRST to avoid collisions with `/:id` routes)
 * - Post CRUD + soft-delete/restore
 * - Engagement toggles (likes, bookmarks)
 * - Comment counts + notification side-effects
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
import { Notification } from '../models/Notification.js'
import { deleteCloudinaryImage, uploadImage } from '../services/mediaService.js'

export const postApp = express.Router()

// ─── 1. SEARCH ENDPOINT (MUST BE FIRST TO AVOID ROUTE COLLISION) ─────────────
postApp.get('/search', protect, validateSearchQuery({ paramName: 'q', maxLength: 100 }), async (req, res, next) => {
  try {
    const { q, type } = req.query
    if (!q || q.trim() === '') {
      return res.status(200).json({ message: 'empty query', payload: [] })
    }

    const searchTerm = q.trim()

    if (type === 'users') {
      const users = await User.find({ $text: { $search: searchTerm } }).limit(20)
      return res.status(200).json({ message: 'users found', payload: users })
    } else {
      // Search posts
      const posts = await Post.find({
        $text: { $search: searchTerm },
        isDeleted: false
      })
      .sort({ score: { $meta: "textScore" } })
      .limit(20)
      .populate('author', 'username profilePicture')

      const postIds = posts.map(p => p._id)
      const [userLikes, userBookmarks] = await Promise.all([
        Like.find({ user: req.user._id, post: { $in: postIds } }),
        Bookmark.find({ user: req.user._id, post: { $in: postIds } })
      ])
      const likedSet = new Set(userLikes.map(l => l.post.toString()))
      const bookmarkedSet = new Set(userBookmarks.map(b => b.post.toString()))

      const payload = posts.map(post => {
        const pObj = post.toObject()
        pObj.isLiked = likedSet.has(post._id.toString())
        pObj.isBookmarked = bookmarkedSet.has(post._id.toString())
        return pObj
      })

      return res.status(200).json({ message: 'posts found', payload })
    }
  } catch (err) { next(err) }
})

// ─── 2. FEED ENDPOINTS ───────────────────────────────────────────────────────

// GET For You Feed (Personalized Recommendation Engine)
postApp.get('/for-you', protect, validatePaginationQuery({ maxLimit: 50 }), async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 0
    const limit = parseInt(req.query.limit) || 10

    // Fetch user preferences
    const currentUser = await User.findById(req.user._id)
    const interestMap = currentUser?.interestScores ? Object.fromEntries(currentUser.interestScores) : {}

    // Find followed users
    const follows = await Follow.find({ follower: req.user._id })
    const followingIds = follows.map(f => f.following)

    // Build dynamic interest weight case statements
    const branches = Object.keys(interestMap).map(cat => ({
      case: { $eq: ["$category", cat] },
      then: interestMap[cat]
    }))

    const categoryScoreExpr = branches.length > 0
      ? { $switch: { branches, default: 0.0 } }
      : 0.0

    // Recommendation Aggregation Pipeline
    const pipeline = [
      { $match: { isDeleted: false, author: { $ne: req.user._id } } },
      {
        $addFields: {
          hoursElapsed: {
            $divide: [ { $subtract: [ new Date(), "$createdAt" ] }, 3600000 ]
          },
          isFollowing: { $in: [ "$author", followingIds ] },
          categoryScore: categoryScoreExpr
        }
      },
      {
        $addFields: {
          networkBoost: { $cond: [ "$isFollowing", 50, 0 ] },
          interestBoost: { $multiply: [ "$categoryScore", 50 ] },
          engagementScore: {
            $add: [
              { $multiply: [ { $ifNull: [ "$likesCount", 0 ] }, 3 ] },
              { $multiply: [ { $ifNull: [ "$commentsCount", 0 ] }, 5 ] },
              { $multiply: [ { $ifNull: [ "$bookmarksCount", 0 ] }, 4 ] }
            ]
          }
        }
      },
      {
        $addFields: {
          score: {
            $multiply: [
              { $add: [ "$networkBoost", "$interestBoost", "$engagementScore", 1 ] },
              { $divide: [ 100, { $add: [ "$hoursElapsed", 1.5 ] } ] }
            ]
          }
        }
      },
      { $sort: { score: -1 } },
      { $skip: page * limit },
      { $limit: limit }
    ]

    const posts = await Post.aggregate(pipeline)
    const populated = await Post.populate(posts, { path: 'author', select: 'username profilePicture' })

    const postIds = populated.map(p => p._id)
    const [userLikes, userBookmarks] = await Promise.all([
      Like.find({ user: req.user._id, post: { $in: postIds } }),
      Bookmark.find({ user: req.user._id, post: { $in: postIds } })
    ])
    const likedSet = new Set(userLikes.map(l => l.post.toString()))
    const bookmarkedSet = new Set(userBookmarks.map(b => b.post.toString()))

    const payload = populated.map(post => {
      post.isLiked = likedSet.has(post._id.toString())
      post.isBookmarked = bookmarkedSet.has(post._id.toString())
      return post
    })

    const total = await Post.countDocuments({ isDeleted: false, author: { $ne: req.user._id } })

    res.status(200).json({
      message:     'for-you feed fetched',
      payload,
      currentPage: page,
      totalPages:  Math.ceil(total / limit),
      hasMore:     page * limit + posts.length < total,
    })
  } catch (err) { next(err) }
})

// GET Following Feed (Chronological Network Feed)
postApp.get('/following', protect, validatePaginationQuery({ maxLimit: 50 }), async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 0
    const limit = parseInt(req.query.limit) || 10

    const follows = await Follow.find({ follower: req.user._id })
    const followingIds = follows.map(f => f.following)

    // Filter posts from followed accounts + own posts. Default to all if following no one.
    const filter = followingIds.length > 0
      ? { author: { $in: [...followingIds, req.user._id] }, isDeleted: false }
      : { isDeleted: false }

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit)
      .populate('author', 'username profilePicture')

    const postIds = posts.map(p => p._id)
    const [userLikes, userBookmarks] = await Promise.all([
      Like.find({ user: req.user._id, post: { $in: postIds } }),
      Bookmark.find({ user: req.user._id, post: { $in: postIds } })
    ])
    const likedSet = new Set(userLikes.map(l => l.post.toString()))
    const bookmarkedSet = new Set(userBookmarks.map(b => b.post.toString()))

    const payload = posts.map(post => {
      const pObj = post.toObject()
      pObj.isLiked = likedSet.has(post._id.toString())
      pObj.isBookmarked = bookmarkedSet.has(post._id.toString())
      return pObj
    })

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

// GET Trending Feed (Time-Decayed Popularity ranking)
postApp.get('/trending', protect, validatePaginationQuery({ maxLimit: 50 }), async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 0
    const limit = parseInt(req.query.limit) || 10

    const pipeline = [
      { $match: { isDeleted: false } },
      {
        $addFields: {
          hoursElapsed: {
            $divide: [ { $subtract: [ new Date(), "$createdAt" ] }, 3600000 ]
          }
        }
      },
      {
        $addFields: {
          engagementScore: {
            $add: [
              { $multiply: [ { $ifNull: [ "$likesCount", 0 ] }, 3 ] },
              { $multiply: [ { $ifNull: [ "$commentsCount", 0 ] }, 5 ] },
              { $multiply: [ { $ifNull: [ "$bookmarksCount", 0 ] }, 4 ] }
            ]
          }
        }
      },
      {
        $addFields: {
          score: {
            $add: [
              "$engagementScore",
              {
                $divide: [
                  200,
                  { $pow: [ { $add: [ "$hoursElapsed", 2 ] }, 1.2 ] }
                ]
              }
            ]
          }
        }
      },
      { $sort: { score: -1 } },
      { $skip: page * limit },
      { $limit: limit }
    ]

    const posts = await Post.aggregate(pipeline)
    const populated = await Post.populate(posts, { path: 'author', select: 'username profilePicture' })

    const postIds = populated.map(p => p._id)
    const [userLikes, userBookmarks] = await Promise.all([
      Like.find({ user: req.user._id, post: { $in: postIds } }),
      Bookmark.find({ user: req.user._id, post: { $in: postIds } })
    ])
    const likedSet = new Set(userLikes.map(l => l.post.toString()))
    const bookmarkedSet = new Set(userBookmarks.map(b => b.post.toString()))

    const payload = populated.map(post => {
      post.isLiked = likedSet.has(post._id.toString())
      post.isBookmarked = bookmarkedSet.has(post._id.toString())
      return post
    })

    const total = await Post.countDocuments({ isDeleted: false })
    res.status(200).json({
      message:     'trending feed fetched',
      payload,
      currentPage: page,
      totalPages:  Math.ceil(total / limit),
      hasMore:     page * limit + posts.length < total,
    })
  } catch (err) { next(err) }
})

// GET Explore Feed (Discovery Engine)
postApp.get('/explore', protect, validatePaginationQuery({ maxLimit: 50 }), async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 0
    const limit = parseInt(req.query.limit) || 10

    const follows = await Follow.find({ follower: req.user._id })
    const followingIds = follows.map(f => f.following)

    // Pull posts from users current user does NOT follow, excluding their own posts
    const filter = {
      author: { $nin: [...followingIds, req.user._id] },
      isDeleted: false
    }

    const posts = await Post.find(filter)
      .sort({ likesCount: -1, createdAt: -1 })
      .skip(page * limit)
      .limit(limit)
      .populate('author', 'username profilePicture')

    const postIds = posts.map(p => p._id)
    const [userLikes, userBookmarks] = await Promise.all([
      Like.find({ user: req.user._id, post: { $in: postIds } }),
      Bookmark.find({ user: req.user._id, post: { $in: postIds } })
    ])
    const likedSet = new Set(userLikes.map(l => l.post.toString()))
    const bookmarkedSet = new Set(userBookmarks.map(b => b.post.toString()))

    const payload = posts.map(post => {
      const pObj = post.toObject()
      pObj.isLiked = likedSet.has(post._id.toString())
      pObj.isBookmarked = bookmarkedSet.has(post._id.toString())
      return pObj
    })

    const total = await Post.countDocuments(filter)
    res.status(200).json({
      message:     'explore feed fetched',
      payload,
      currentPage: page,
      totalPages:  Math.ceil(total / limit),
      hasMore:     page * limit + posts.length < total,
    })
  } catch (err) { next(err) }
})

// GET Trending Tags (Extracted from Post contents)
postApp.get('/trending-tags', protect, async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600000)
    const result = await Post.aggregate([
      { $match: { isDeleted: false, createdAt: { $gte: sevenDaysAgo } } },
      { $unwind: "$hashtags" },
      { $group: { _id: "$hashtags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])
    const tags = result.map(r => r._id)
    res.status(200).json({ message: 'trending tags fetched', payload: tags })
  } catch (err) { next(err) }
})

// GET User Suggestions / Follow recommendations (Dot Product interest matching)
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

    const postIds = posts.map(p => p._id)
    const [userLikes, userBookmarks] = await Promise.all([
      Like.find({ user: req.user._id, post: { $in: postIds } }),
      Bookmark.find({ user: req.user._id, post: { $in: postIds } })
    ])
    const likedSet = new Set(userLikes.map(l => l.post.toString()))
    const bookmarkedSet = new Set(userBookmarks.map(b => b.post.toString()))

    const payload = posts.map(post => {
      const pObj = post.toObject()
      pObj.isLiked = likedSet.has(post._id.toString())
      pObj.isBookmarked = bookmarkedSet.has(post._id.toString())
      return pObj
    })

    res.status(200).json({ message: 'user posts fetched', payload })
  } catch (err) { next(err) }
})

// Get single post
postApp.get('/:id', protect, validateObjectIdParam('id'), async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false })
      .populate('author', 'username profilePicture')
    if (!post) return res.status(404).json({ message: 'Post not found' })

    const [likeRecord, bookmarkRecord] = await Promise.all([
      Like.findOne({ post: post._id, user: req.user._id }),
      Bookmark.findOne({ post: post._id, user: req.user._id })
    ])

    res.status(200).json({
      message: 'post found',
      payload: post,
      isLiked: !!likeRecord,
      isBookmarked: !!bookmarkRecord
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
      commentsCount: 0
    })

    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: 1 } })
    const populatedPost = await post.populate('author', 'username profilePicture')

    const pObj = populatedPost.toObject()
    pObj.isLiked = false
    pObj.isBookmarked = false

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

// Like / Unlike Toggle
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
    } else {
      await Like.create({ post: postId, user: userId })
      liked = true

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

// Bookmark / Unbookmark Toggle
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
    } else {
      await Bookmark.create({ post: postId, user: userId })
      bookmarked = true
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
