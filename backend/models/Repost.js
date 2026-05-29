/**
 * backend/models/Repost.js
 *
 * Mongoose Repost model.
 * Twitter-style repost: a user shares another user's post to their followers.
 * One repost per (user, post). Hooks keep Post.repostsCount in sync.
 */
import mongoose from 'mongoose'

const repostSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Repost must have a user'],
    },

    post: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Post',
      required: [true, 'Repost must reference a post'],
    },
  },
  {
    timestamps: true,
  }
)

// ─── UNIQUE CONSTRAINT: One repost per user per post ────────────────────────
repostSchema.index({ user: 1, post: 1 }, { unique: true })

// ─── INDEX: Get a user's reposts sorted by date ─────────────────────────────
repostSchema.index({ user: 1, createdAt: -1 })

// ─── MIDDLEWARE: Increment Post.repostsCount on save ────────────────────────
repostSchema.post('save', async function () {
  await mongoose.model('Post').findByIdAndUpdate(this.post, {
    $inc: { repostsCount: 1 },
  })
})

// ─── MIDDLEWARE: Decrement Post.repostsCount on delete ──────────────────────
repostSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await mongoose.model('Post').findByIdAndUpdate(doc.post, {
      $inc: { repostsCount: -1 },
    })
  }
})

export const Repost = mongoose.model('Repost', repostSchema)
