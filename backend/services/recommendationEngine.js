/**
 * backend/services/recommendationEngine.js
 *
 * Pure scoring & ranking module for the recommendation system.
 * No DB calls — takes pre-fetched data and returns scored/ranked posts.
 *
 * Scoring formula:
 *   finalScore =
 *     (interestScore × 0.40) +
 *     (engagementScore × 0.20) +
 *     (recencyScore × 0.15) +
 *     (trendScore × 0.10) +
 *     (authorAffinityScore × 0.05) +
 *     (noveltyScore × 0.10)
 *
 * Then apply: freshnessDecay + diversityPenalty
 */

// ─── SCORING WEIGHTS ────────────────────────────────────────────────────────
const WEIGHTS = {
  interest:       0.40,
  engagement:     0.20,
  recency:        0.15,
  trend:          0.10,
  authorAffinity: 0.05,
  novelty:        0.10,
}

// ─── INDIVIDUAL SCORE CALCULATORS ───────────────────────────────────────────

/**
 * Interest Score: How well do the post's hashtags/category match the user's interests?
 * Uses dot-product style overlap between post tags and user interest vector.
 *
 * @param {Object} post — { hashtags: string[], category: string }
 * @param {Object} userInterests — { hashtag: score } map
 * @returns {number} 0–1
 */
export function calculateInterestScore(post, userInterests) {
  if (!userInterests || Object.keys(userInterests).length === 0) return 0

  const postTags = getPostTags(post)
  if (postTags.length === 0) return 0

  let totalScore = 0
  let maxPossible = 0

  for (const tag of postTags) {
    const interest = userInterests[tag] || 0
    totalScore += interest
    maxPossible += 1
  }

  // Also check category match
  if (post.category) {
    const catScore = userInterests[post.category.toLowerCase()] || 0
    totalScore += catScore
    maxPossible += 1
  }

  // Normalize to 0–1
  return maxPossible > 0 ? Math.min(totalScore / maxPossible, 1) : 0
}

/**
 * Engagement Score: How popular is this post? Normalized against max engagement.
 *
 * @param {Object} post — { likesCount, commentsCount, repostsCount, bookmarksCount }
 * @param {number} maxEngagement — the max engagement across candidate pool
 * @returns {number} 0–1
 */
export function calculateEngagementScore(post, maxEngagement) {
  const raw =
    (post.likesCount || 0) * 1 +
    (post.commentsCount || 0) * 3 +
    (post.repostsCount || 0) * 2 +
    (post.bookmarksCount || 0) * 1.5

  if (maxEngagement <= 0) return 0
  return Math.min(raw / maxEngagement, 1)
}

/**
 * Recency Score: How fresh is this post?
 * Exponential decay: newer posts score higher.
 *
 * @param {Date|string} createdAt
 * @returns {number} 0–1
 */
export function calculateRecencyScore(createdAt) {
  const hoursElapsed = (Date.now() - new Date(createdAt).getTime()) / 3600000
  return 1 / (1 + hoursElapsed / 24)
}

/**
 * Trend Score: How many of the post's hashtags are currently trending?
 *
 * @param {Object} post
 * @param {Set<string>} trendingHashtags — set of lowercase trending tag names
 * @returns {number} 0–1
 */
export function calculateTrendScore(post, trendingHashtags) {
  if (!trendingHashtags || trendingHashtags.size === 0) return 0

  const postTags = getPostTags(post)
  if (postTags.length === 0) return 0

  let trendingCount = 0
  for (const tag of postTags) {
    if (trendingHashtags.has(tag)) trendingCount++
  }

  return trendingCount / postTags.length
}

/**
 * Author Affinity Score: How often has the user interacted with this author?
 * Normalized: caps at 20 interactions for full score.
 *
 * @param {string} authorId
 * @param {Object} authorAffinityMap — { authorId: interactionCount }
 * @returns {number} 0–1
 */
export function calculateAuthorAffinityScore(authorId, authorAffinityMap) {
  if (!authorId || !authorAffinityMap) return 0
  const count = authorAffinityMap[authorId.toString()] || 0
  return Math.min(count / 20, 1)
}

/**
 * Novelty Score: Are these hashtags new/unseen to the user?
 * Higher score means the user hasn't interacted with these tags much.
 *
 * @param {Object} post
 * @param {Object} userInterests — { hashtag: score }
 * @returns {number} 0–1
 */
export function calculateNoveltyScore(post, userInterests) {
  if (!userInterests || Object.keys(userInterests).length === 0) return 1

  const postTags = getPostTags(post)
  if (postTags.length === 0) return 0.5

  let unseenCount = 0
  for (const tag of postTags) {
    if (!userInterests[tag] || userInterests[tag] < 0.1) {
      unseenCount++
    }
  }

  return unseenCount / postTags.length
}

// ─── MODIFIERS ──────────────────────────────────────────────────────────────

/**
 * Freshness decay: exponential decay for older posts.
 * Posts older than 7 days are strongly penalized.
 *
 * @param {Date|string} createdAt
 * @returns {number} 0.1–1.0
 */
export function freshnessDecay(createdAt) {
  const daysOld = (Date.now() - new Date(createdAt).getTime()) / 86400000
  return Math.max(0.1, Math.exp(-0.1 * daysOld))
}

/**
 * Apply diversity penalty to avoid showing too many posts from the same hashtag/category.
 * Reduces score for posts with hashtags already heavily represented.
 *
 * @param {Array} rankedPosts — already scored posts in order
 * @param {number} maxPerCategory — max posts before penalty kicks in (default 3)
 * @returns {Array} re-scored posts
 */
export function applyDiversityPenalty(rankedPosts, maxPerCategory = 3) {
  const categoryCount = {}

  return rankedPosts.map(item => {
    const cat = item.category || 'unknown'
    categoryCount[cat] = (categoryCount[cat] || 0) + 1

    if (categoryCount[cat] > maxPerCategory) {
      const penalty = 1 - (0.15 * (categoryCount[cat] - maxPerCategory))
      item._score *= Math.max(0.3, penalty)
    }

    return item
  })
}

// ─── MAIN RANKING FUNCTIONS ─────────────────────────────────────────────────

/**
 * Rank posts for the Home (For You) feed.
 *
 * @param {Array} candidatePosts — pre-fetched candidate pool (~200 posts)
 * @param {Object} userInterests — { hashtag: score }
 * @param {Set<string>} trendingHashtags
 * @param {Object} authorAffinityMap — { authorId: count }
 * @returns {Array} posts sorted by final score (descending), with _score attached
 */
export function rankPostsForHome(candidatePosts, userInterests, trendingHashtags, authorAffinityMap) {
  if (!candidatePosts || candidatePosts.length === 0) return []

  // Calculate max engagement across pool for normalization
  const maxEngagement = Math.max(
    1,
    ...candidatePosts.map(p =>
      (p.likesCount || 0) * 1 +
      (p.commentsCount || 0) * 3 +
      (p.repostsCount || 0) * 2 +
      (p.bookmarksCount || 0) * 1.5
    )
  )

  // Score each post
  const scored = candidatePosts.map(post => {
    const interestScore       = calculateInterestScore(post, userInterests)
    const engagementScore     = calculateEngagementScore(post, maxEngagement)
    const recencyScore        = calculateRecencyScore(post.createdAt)
    const trendScore          = calculateTrendScore(post, trendingHashtags)
    const authorAffinity      = calculateAuthorAffinityScore(post.author?._id || post.author, authorAffinityMap)
    const noveltyScore        = calculateNoveltyScore(post, userInterests)
    const decay               = freshnessDecay(post.createdAt)

    const rawScore =
      (interestScore * WEIGHTS.interest) +
      (engagementScore * WEIGHTS.engagement) +
      (recencyScore * WEIGHTS.recency) +
      (trendScore * WEIGHTS.trend) +
      (authorAffinity * WEIGHTS.authorAffinity) +
      (noveltyScore * WEIGHTS.novelty)

    const finalScore = rawScore * decay

    // Attach score and debug breakdown to the post object
    const postObj = post.toObject ? post.toObject() : { ...post }
    postObj._score = parseFloat(finalScore.toFixed(6))
    postObj._scoreBreakdown = {
      interest:       parseFloat(interestScore.toFixed(4)),
      engagement:     parseFloat(engagementScore.toFixed(4)),
      recency:        parseFloat(recencyScore.toFixed(4)),
      trend:          parseFloat(trendScore.toFixed(4)),
      authorAffinity: parseFloat(authorAffinity.toFixed(4)),
      novelty:        parseFloat(noveltyScore.toFixed(4)),
      decay:          parseFloat(decay.toFixed(4)),
    }

    return postObj
  })

  // Sort by score descending
  scored.sort((a, b) => b._score - a._score)

  // Apply diversity penalty and re-sort
  const diversified = applyDiversityPenalty(scored)
  diversified.sort((a, b) => b._score - a._score)

  return diversified
}

/**
 * Rank posts for the Explore feed.
 * 70% unseen categories + 30% trending categories.
 *
 * @param {Array} candidatePosts
 * @param {Array<string>} onboardingInterests — user's original onboarding selections
 * @param {Set<string>} trendingHashtags
 * @returns {Array} scored and sorted posts
 */
export function rankPostsForExplore(candidatePosts, onboardingInterests, trendingHashtags) {
  if (!candidatePosts || candidatePosts.length === 0) return []

  const onboardingSet = new Set((onboardingInterests || []).map(i => i.toLowerCase()))

  const maxEngagement = Math.max(
    1,
    ...candidatePosts.map(p =>
      (p.likesCount || 0) * 1 +
      (p.commentsCount || 0) * 3 +
      (p.repostsCount || 0) * 2 +
      (p.bookmarksCount || 0) * 1.5
    )
  )

  const scored = candidatePosts.map(post => {
    const postTags = getPostTags(post)
    const postCat = (post.category || '').toLowerCase()

    // Discovery score: how far is this from the user's known interests?
    const isUnseenCategory = !onboardingSet.has(postCat)
    const discoveryScore = isUnseenCategory ? 0.8 : 0.2

    const engagementScore = calculateEngagementScore(post, maxEngagement)
    const trendScore = calculateTrendScore(post, trendingHashtags)
    const recencyScore = 1 / (1 + ((Date.now() - new Date(post.createdAt).getTime()) / 3600000) / 48)

    const rawScore =
      (discoveryScore * 0.35) +
      (engagementScore * 0.30) +
      (trendScore * 0.20) +
      (recencyScore * 0.15)

    const postObj = post.toObject ? post.toObject() : { ...post }
    postObj._score = parseFloat(rawScore.toFixed(6))

    return postObj
  })

  scored.sort((a, b) => b._score - a._score)

  const diversified = applyDiversityPenalty(scored, 4)
  diversified.sort((a, b) => b._score - a._score)

  return diversified
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

/**
 * Extract normalized tags from a post (lowercase, no # prefix).
 */
function getPostTags(post) {
  const tags = (post.hashtags || []).map(h => h.toLowerCase().replace(/^#/, ''))
  return [...new Set(tags)]
}
