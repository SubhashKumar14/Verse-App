/**
 * backend/models/UserHashtagInteraction.js
 *
 * Tracks per-user, per-hashtag engagement counts.
 * Used by the recommendation engine to build the user interest profile
 * and trigger the "3+ interactions" strong boost.
 *
 * Each document represents one user's relationship with one hashtag.
 */
import mongoose from 'mongoose'

const userHashtagInteractionSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Interaction must belong to a user'],
    },

    hashtag: {
      type:      String,
      required:  [true, 'Interaction must reference a hashtag'],
      trim:      true,
      lowercase: true,
    },

    // ─── Engagement counters ─────────────────────────────────────────────
    likes: {
      type:    Number,
      default: 0,
    },

    comments: {
      type:    Number,
      default: 0,
    },

    reposts: {
      type:    Number,
      default: 0,
    },

    bookmarks: {
      type:    Number,
      default: 0,
    },

    // ─── Computed interest score for this hashtag ─────────────────────────
    // Updated whenever any counter changes.
    // Formula: likes*0.05 + comments*0.08 + reposts*0.10 + bookmarks*0.03
    //          + strongBoost (0.15 if total interactions >= 3)
    score: {
      type:    Number,
      default: 0,
    },

    // ─── Last interaction timestamp ──────────────────────────────────────
    lastInteractedAt: {
      type:    Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

// ─── UNIQUE CONSTRAINT: One record per user per hashtag ─────────────────────
userHashtagInteractionSchema.index({ user: 1, hashtag: 1 }, { unique: true })

// ─── INDEX: Fetch a user's top interests sorted by score ────────────────────
userHashtagInteractionSchema.index({ user: 1, score: -1 })

// ─── INDEX: Recent interactions ─────────────────────────────────────────────
userHashtagInteractionSchema.index({ user: 1, lastInteractedAt: -1 })

// ─── INSTANCE METHOD: Recalculate score from counters ───────────────────────
userHashtagInteractionSchema.methods.recalculateScore = function () {
  const totalInteractions = this.likes + this.comments + this.reposts + this.bookmarks
  const baseScore =
    (this.likes * 0.05) +
    (this.comments * 0.08) +
    (this.reposts * 0.10) +
    (this.bookmarks * 0.03)

  // Strong boost if the user has interacted 3+ times with this hashtag
  const strongBoost = totalInteractions >= 3 ? 0.15 : 0

  this.score = parseFloat((baseScore + strongBoost).toFixed(4))
  return this.score
}

export const UserHashtagInteraction = mongoose.model('UserHashtagInteraction', userHashtagInteractionSchema)
