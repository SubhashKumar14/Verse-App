/**
 * backend/models/Post.js
 *
 * Mongoose Post model.
 * Supports text posts and optional image posts, plus soft-delete.
 * Tracks denormalized counters (likes/comments/bookmarks) for fast feeds.
 * Includes indexes to support feeds and basic text search.
 */
import mongoose from 'mongoose'

const postSchema = new mongoose.Schema(
  {
    author: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Post must have an author'],
    },

    content: {
      type:      String,
      required:  function() { return !this.imageUrl; }, // Content is required only if there is no image
      trim:      true,
      maxlength: [280, 'Post cannot exceed 280 characters'],
    },

    imageUrl: {
      type:    String,
      default: null,      // Cloudinary secure_url
    },

    imagePublicId: {
      type:    String,
      default: null,      // Cloudinary public_id — needed to delete the image
    },

    likesCount: {
      type:    Number,
      default: 0,
    },

    bookmarksCount: {
      type:    Number,
      default: 0,
    },

    commentsCount: {
      type:    Number,
      default: 0,
    },

    category: {
      type:     String,
      required: [true, 'Post must belong to a category'],
      trim:     true,
    },

    hashtags: [
      {
        type: String,
        trim: true,
      }
    ],

    embedding: {
      type:    [Number],
      default: [],
    },

    isDeleted: {
      type:    Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
  }
)

// Indexes
postSchema.index({ isDeleted: 1, author: 1, createdAt: -1 })
postSchema.index({ category: 1, isDeleted: 1 })
postSchema.index({ hashtags: 1, isDeleted: 1 })
postSchema.index({ createdAt: -1 })

// Text index for content, hashtags, and category search
postSchema.index({
  content:  'text',
  hashtags: 'text',
  category: 'text',
})

export const Post = mongoose.model('Post', postSchema)