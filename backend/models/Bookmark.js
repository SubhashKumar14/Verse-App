import mongoose from 'mongoose'

const bookmarkSchema = new mongoose.Schema(
  {
    post: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Post',
      required: [true, 'Bookmark must belong to a post'],
    },

    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Bookmark must have a user'],
    },
  },
  {
    timestamps: true,
  }
)

// Compound index to guarantee uniqueness of bookmark
bookmarkSchema.index({ post: 1, user: 1 }, { unique: true })

// Index for getting user's bookmarks sorted by date
bookmarkSchema.index({ user: 1, createdAt: -1 })

// Middleware to increment bookmarksCount on Post when bookmark is created
bookmarkSchema.post('save', async function () {
  await mongoose.model('Post').findByIdAndUpdate(this.post, {
    $inc: { bookmarksCount: 1 },
  })
})

// Middleware to decrement bookmarksCount on Post when bookmark is deleted
bookmarkSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await mongoose.model('Post').findByIdAndUpdate(doc.post, {
      $inc: { bookmarksCount: -1 },
    })
  }
})

export const Bookmark = mongoose.model('Bookmark', bookmarkSchema)
