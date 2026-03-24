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

    // Array of user IDs who liked this post
    // likesCount = likes.length, isLiked = likes.includes(currentUserId)
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:  'User',
      },
    ],

    // soft delete flag — deleted posts are hidden from queries, not removed from DB
    isDeleted: {
      type:    Boolean,
      default: false,
    },

    commentsCount: {
      type:    Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
  }
)

// virtual: likesCount from the array length
postSchema.virtual('likesCount').get(function () {
  return this.likes.length
})

// indexes
postSchema.index({ createdAt: -1 })            // feed sorted newest first
postSchema.index({ author: 1, createdAt: -1 }) // profile page posts

export const Post = mongoose.model('Post', postSchema)