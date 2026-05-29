/**
 * backend/services/trendingService.js
 *
 * Live trending hashtag calculation.
 * Aggregates directly from Posts collection — no snapshot model needed
 * at ~1,500 posts scale.
 *
 * Trending score = (postVelocity × 0.30) + (engagementVelocity × 0.35) +
 *                  (uniqueUsers × 0.20) + (growthRate × 0.15)
 * With time decay: score × 1/(1 + hoursElapsed/6)
 */
import { Post } from '../models/Post.js'
import { Like } from '../models/Like.js'
import { Comment } from '../models/Comment.js'
import { Repost } from '../models/Repost.js'

/**
 * Calculate currently trending hashtags.
 *
 * @param {number} windowHours — lookback window (default 72h for demo data)
 * @param {number} limit — max trending tags to return
 * @returns {Array<{
 *   hashtag: string,
 *   postsCount: number,
 *   totalEngagement: number,
 *   uniqueAuthors: number,
 *   velocity: number,
 *   trendScore: number,
 *   samplePost: string
 * }>}
 */
export async function calculateTrendingHashtags(windowHours = 72, limit = 15) {
  const windowStart = new Date(Date.now() - windowHours * 3600000)

  // Step 1: Aggregate post counts and engagement per hashtag within the window
  const hashtagStats = await Post.aggregate([
    {
      $match: {
        isDeleted: false,
        createdAt: { $gte: windowStart },
        hashtags: { $exists: true, $ne: [] },
      },
    },
    { $unwind: '$hashtags' },
    {
      $addFields: {
        normalizedHashtag: { $toLower: '$hashtags' },
      },
    },
    {
      $group: {
        _id: '$normalizedHashtag',
        postsCount:    { $sum: 1 },
        totalLikes:    { $sum: { $ifNull: ['$likesCount', 0] } },
        totalComments: { $sum: { $ifNull: ['$commentsCount', 0] } },
        totalReposts:  { $sum: { $ifNull: ['$repostsCount', 0] } },
        totalBookmarks: { $sum: { $ifNull: ['$bookmarksCount', 0] } },
        uniqueAuthors: { $addToSet: '$author' },
        latestPostAt:  { $max: '$createdAt' },
        // Grab one sample post content for the summary
        samplePost:    { $first: '$content' },
      },
    },
    {
      $addFields: {
        uniqueAuthorsCount: { $size: '$uniqueAuthors' },
        totalEngagement: {
          $add: [
            '$totalLikes',
            { $multiply: ['$totalComments', 2] },
            { $multiply: ['$totalReposts', 1.5] },
            '$totalBookmarks',
          ],
        },
      },
    },
    // Only consider hashtags with at least 2 posts for trending
    { $match: { postsCount: { $gte: 2 } } },
    { $sort: { totalEngagement: -1 } },
    { $limit: limit * 2 }, // fetch extra, we'll re-rank
  ])

  // Step 2: Calculate velocity and trend score for each hashtag
  const now = Date.now()
  const scored = hashtagStats.map(stat => {
    const hoursAgo = (now - new Date(stat.latestPostAt).getTime()) / 3600000

    // Post velocity: posts per hour in the window
    const postVelocity = stat.postsCount / (windowHours || 1)

    // Engagement velocity: total engagement per hour
    const engagementVelocity = stat.totalEngagement / (windowHours || 1)

    // Unique users normalized (0-1 range, capped at 50 users)
    const uniqueUsersNorm = Math.min(stat.uniqueAuthorsCount / 50, 1)

    // Growth rate approximation: more recent = higher growth
    const growthRate = 1 / (1 + hoursAgo / 12)

    // Composite trend score
    const rawScore =
      (postVelocity * 0.30) +
      (engagementVelocity * 0.35) +
      (uniqueUsersNorm * 0.20) +
      (growthRate * 0.15)

    // Time decay — recent topics rank higher
    const timeDecay = 1 / (1 + hoursAgo / 6)
    const trendScore = rawScore * timeDecay

    return {
      hashtag:         stat._id,
      postsCount:      stat.postsCount,
      totalEngagement: Math.round(stat.totalEngagement),
      uniqueAuthors:   stat.uniqueAuthorsCount,
      velocity:        parseFloat(engagementVelocity.toFixed(3)),
      trendScore:      parseFloat(trendScore.toFixed(4)),
      samplePost:      stat.samplePost
        ? stat.samplePost.substring(0, 120) + (stat.samplePost.length > 120 ? '…' : '')
        : '',
    }
  })

  // Sort by trend score and return top N
  scored.sort((a, b) => b.trendScore - a.trendScore)
  return scored.slice(0, limit)
}

/**
 * Get just the trending hashtag names (for use in recommendation scoring).
 * Returns a Set of lowercase hashtag strings.
 */
export async function getTrendingHashtagSet(windowHours = 72, limit = 20) {
  const trending = await calculateTrendingHashtags(windowHours, limit)
  return new Set(trending.map(t => t.hashtag.toLowerCase().replace(/^#/, '')))
}

/**
 * Get trending categories (mapped from hashtags to post categories).
 * Used by the Explore feed to mix in trending content.
 */
export async function getTrendingCategories(windowHours = 72, limit = 10) {
  const windowStart = new Date(Date.now() - windowHours * 3600000)

  const result = await Post.aggregate([
    {
      $match: {
        isDeleted: false,
        createdAt: { $gte: windowStart },
      },
    },
    {
      $group: {
        _id: '$category',
        postsCount: { $sum: 1 },
        totalEngagement: {
          $sum: {
            $add: [
              { $ifNull: ['$likesCount', 0] },
              { $multiply: [{ $ifNull: ['$commentsCount', 0] }, 2] },
              { $multiply: [{ $ifNull: ['$repostsCount', 0] }, 1.5] },
            ],
          },
        },
      },
    },
    { $sort: { totalEngagement: -1 } },
    { $limit: limit },
  ])

  return result.map(r => r._id)
}
