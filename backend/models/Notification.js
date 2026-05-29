/**
 * backend/models/Notification.js
 *
 * Mongoose Notification model.
 * Stores events like follow/like/comment, linking sender/recipient (and
 * optionally a post) and a read/unread flag.
 */
import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Notification must have a recipient'],
    },

    sender: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Notification must have a sender'],
    },

    type: {
      type:     String,
      enum:     ['like', 'comment', 'follow', 'repost'],
      required: [true, 'Notification must have a type'],
    },

    post: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'Post',
      default: null,
    },

    isRead: {
      type:    Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Index for fetching notifications for a recipient, sorted by recency
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 })

export const Notification = mongoose.model('Notification', notificationSchema)
