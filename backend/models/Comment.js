import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema(
  {
    post: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Post',
      required: [true, 'Comment must belong to a post'],
    },

    author: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Comment must have an author'],
    },

    text: {
      type:      String,
      required:  [true, 'Comment text is required'],
      trim:      true,
      maxlength: [280, 'Comment cannot exceed 280 characters'],
    },
    // soft delete flag — deleted comments are hidden, not removed from DB
    isDeleted: {
      type:    Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// index: fetch all comments for a post, oldest first
commentSchema.index({ post: 1, createdAt: 1 })

export const Comment = mongoose.model('Comment', commentSchema)