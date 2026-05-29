/**
 * backend/services/interestService.js
 *
 * Real-time user interest management.
 * Updates per-hashtag interaction counts and user interest scores
 * whenever a user engages with a post (like, comment, repost, bookmark).
 *
 * Also provides author affinity mapping for the recommendation engine.
 */
import { UserHashtagInteraction } from '../models/UserHashtagInteraction.js'
import { User } from '../models/User.js'
import { Like } from '../models/Like.js'
import { Comment } from '../models/Comment.js'
import { Repost } from '../models/Repost.js'
import { Post } from '../models/Post.js'

// ─── Weight increments per action ───────────────────────────────────────────
const ACTION_WEIGHTS = {
  like:     0.05,
  comment:  0.08,
  repost:   0.10,
  bookmark: 0.03,
}

// ─── Strong boost threshold (interactions >= this trigger extra weight) ──────
const STRONG_BOOST_THRESHOLD = 3
const STRONG_BOOST_VALUE = 0.15

/**
 * Update the user's interest profile after an engagement action.
 *
 * For each hashtag on the post:
 *   1. Upsert UserHashtagInteraction (increment the action counter)
 *   2. Recalculate the per-hashtag score
 *   3. Rebuild the user's interestScores Map from all interactions
 *
 * @param {string} userId
 * @param {Object} post — must have .hashtags[] and .category
 * @param {'like'|'comment'|'repost'|'bookmark'} action
 */
export async function updateInterestsOnEngagement(userId, post, action) {
  if (!userId || !post) return

  // Collect all relevant hashtags (post's hashtags + category as fallback)
  const hashtags = post.hashtags?.length > 0
    ? post.hashtags.map(h => h.toLowerCase().replace(/^#/, ''))
    : []

  // Always include the category as a hashtag for interest tracking
  if (post.category) {
    const cat = post.category.toLowerCase()
    if (!hashtags.includes(cat)) {
      hashtags.push(cat)
    }
  }

  if (hashtags.length === 0) return

  // Determine the counter field to increment
  const counterField = {
    like:     'likes',
    comment:  'comments',
    repost:   'reposts',
    bookmark: 'bookmarks',
  }[action]

  if (!counterField) return

  // Upsert each hashtag interaction and recalculate scores
  const bulkOps = hashtags.map(hashtag => ({
    updateOne: {
      filter: { user: userId, hashtag },
      update: {
        $inc: { [counterField]: 1 },
        $set: { lastInteractedAt: new Date() },
        $setOnInsert: { user: userId, hashtag },
      },
      upsert: true,
    },
  }))

  await UserHashtagInteraction.bulkWrite(bulkOps)

  // Recalculate scores for the affected hashtags
  const interactions = await UserHashtagInteraction.find({
    user: userId,
    hashtag: { $in: hashtags },
  })

  for (const interaction of interactions) {
    interaction.recalculateScore()
    await interaction.save()
  }

  // Rebuild user's interestScores Map from all interactions
  await rebuildUserInterestScores(userId)
}

/**
 * Undo interest update when an engagement is removed (unlike, un-repost, un-bookmark).
 *
 * @param {string} userId
 * @param {Object} post
 * @param {'like'|'comment'|'repost'|'bookmark'} action
 */
export async function removeInterestOnDisengagement(userId, post, action) {
  if (!userId || !post) return

  const hashtags = post.hashtags?.length > 0
    ? post.hashtags.map(h => h.toLowerCase().replace(/^#/, ''))
    : []

  if (post.category) {
    const cat = post.category.toLowerCase()
    if (!hashtags.includes(cat)) hashtags.push(cat)
  }

  if (hashtags.length === 0) return

  const counterField = {
    like:     'likes',
    comment:  'comments',
    repost:   'reposts',
    bookmark: 'bookmarks',
  }[action]

  if (!counterField) return

  // Decrement counters (floor at 0)
  for (const hashtag of hashtags) {
    const interaction = await UserHashtagInteraction.findOne({ user: userId, hashtag })
    if (interaction) {
      interaction[counterField] = Math.max(0, interaction[counterField] - 1)
      interaction.recalculateScore()
      await interaction.save()
    }
  }

  await rebuildUserInterestScores(userId)
}

/**
 * Rebuild the user's interestScores Map from all UserHashtagInteraction records.
 * Merges per-hashtag scores into per-category scores (since hashtags map to categories).
 */
async function rebuildUserInterestScores(userId) {
  const interactions = await UserHashtagInteraction.find({ user: userId })

  const interestScores = {}
  for (const interaction of interactions) {
    const key = interaction.hashtag
    // Merge: take the max score if a category appears multiple times
    if (!interestScores[key] || interaction.score > interestScores[key]) {
      interestScores[key] = interaction.score
    }
  }

  // Also preserve existing onboarding scores (minimum 1.0 for selected interests)
  const user = await User.findById(userId)
  if (user?.onboardingInterests) {
    for (const interest of user.onboardingInterests) {
      const key = interest.toLowerCase()
      if (!interestScores[key]) {
        interestScores[key] = 1.0 // onboarding default
      }
    }
  }

  await User.findByIdAndUpdate(userId, { interestScores })
}

/**
 * Build an author affinity map for a user.
 * Returns: { authorId: interactionCount }
 *
 * Counts how many times the user has liked, commented on, or reposted
 * posts by each author.
 */
export async function getAuthorAffinityMap(userId) {
  const [likes, comments, reposts] = await Promise.all([
    Like.find({ user: userId }).select('post').lean(),
    Comment.find({ author: userId, isDeleted: false }).select('post').lean(),
    Repost.find({ user: userId }).select('post').lean(),
  ])

  // Collect all unique post IDs
  const postIds = [
    ...likes.map(l => l.post),
    ...comments.map(c => c.post),
    ...reposts.map(r => r.post),
  ]

  if (postIds.length === 0) return {}

  // Fetch authors for these posts
  const posts = await Post.find({ _id: { $in: postIds } }).select('author').lean()

  const affinityMap = {}
  for (const post of posts) {
    if (post && post.author) {
      const authorId = post.author.toString()
      affinityMap[authorId] = (affinityMap[authorId] || 0) + 1
    }
  }

  return affinityMap
}

/**
 * Get a user's top hashtag interests (sorted by score descending).
 *
 * @param {string} userId
 * @param {number} limit
 * @returns {Array<{hashtag: string, score: number}>}
 */
export async function getUserTopInterests(userId, limit = 20) {
  return UserHashtagInteraction.find({ user: userId })
    .sort({ score: -1 })
    .limit(limit)
    .select('hashtag score likes comments reposts bookmarks')
    .lean()
}
