/**
 * backend/models/Message.js
 *
 * Mongoose Message model.
 * Stores direct messages between users.
 */
import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Message must have a sender'],
    },

    recipient: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Message must have a recipient'],
    },

    text: {
      type:      String,
      default:   '',
      trim:      true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },

    imageUrl: {
      type:    String,
      default: '',
    },

    imagePublicId: {
      type:    String,
      default: '',
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

// Index for performance
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 })
messageSchema.index({ recipient: 1, isRead: 1 })

export const Message = mongoose.model('Message', messageSchema)
