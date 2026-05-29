/**
 * backend/api/messagesApi.js
 *
 * Express router for direct messaging (DM) flows.
 * Handles:
 * - Sending messages
 * - Listing conversations with latest message & unread count aggregations
 * - Fetching unread message count badge
 * - Loading message history for a user
 *
 * Mounted at `/api/messages` in backend/server.js.
 */
import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import upload from '../middleware/uploadMiddleware.js'
import { validateObjectIdParam } from '../middleware/validationMiddleware.js'
import { Message } from '../models/Message.js'
import { User } from '../models/User.js'
import { uploadImage, deleteCloudinaryImage } from '../services/mediaService.js'

export const messagesApp = express.Router()

// 1. Send a message (protected + optional image)
messagesApp.post('/', protect, upload.single('image'), async (req, res, next) => {
  let uploadedImage = null
  try {
    const { recipientId, text } = req.body

    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required' })
    }

    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot send messages to yourself' })
    }

    // Check recipient exists
    const recipient = await User.findById(recipientId)
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient user not found' })
    }

    let imageUrl = ''
    let imagePublicId = ''

    if (req.file) {
      uploadedImage = await uploadImage(req.file)
      imageUrl = uploadedImage.secure_url
      imagePublicId = uploadedImage.public_id
    }

    const messageText = text ? text.trim() : ''

    if (!messageText && !imageUrl) {
      return res.status(400).json({ message: 'Message text or image is required' })
    }

    if (messageText.length > 1000) {
      return res.status(400).json({ message: 'Message cannot exceed 1000 characters' })
    }

    const message = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      text: messageText,
      imageUrl,
      imagePublicId,
    })

    // Populate sender details for immediate display
    const populated = await Message.findById(message._id)
      .populate('sender', 'username profilePicture')
      .populate('recipient', 'username profilePicture')

    res.status(201).json({ message: 'message sent', payload: populated })
  } catch (err) {
    if (uploadedImage?.public_id) {
      try {
        await deleteCloudinaryImage(uploadedImage.public_id)
      } catch {
        // fail silently
      }
    }
    next(err)
  }
})

// 2. Fetch conversations list (protected)
messagesApp.get('/conversations', protect, async (req, res, next) => {
  try {
    const userId = req.user._id

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { recipient: userId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: [ "$sender", userId ] },
              "$recipient",
              "$sender"
            ]
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: [ "$recipient", userId ] },
                    { $eq: [ "$isRead", false ] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 0,
          otherUser: {
            _id: '$user._id',
            username: '$user.username',
            profilePicture: '$user.profilePicture',
            bio: '$user.bio'
          },
          lastMessage: {
            _id: '$lastMessage._id',
            sender: '$lastMessage.sender',
            recipient: '$lastMessage.recipient',
            text: '$lastMessage.text',
            imageUrl: '$lastMessage.imageUrl',
            isRead: '$lastMessage.isRead',
            createdAt: '$lastMessage.createdAt'
          },
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ])

    res.status(200).json({ message: 'conversations list', payload: conversations })
  } catch (err) {
    next(err)
  }
})

// 3. Fetch total unread count (protected)
messagesApp.get('/unread-count', protect, async (req, res, next) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user._id,
      isRead: false
    })

    res.status(200).json({ message: 'unread message count', count })
  } catch (err) {
    next(err)
  }
})

// 4. Fetch message history with a user + mark as read (protected)
messagesApp.get('/:userId', protect, validateObjectIdParam('userId'), async (req, res, next) => {
  try {
    const targetUserId = req.params.userId
    const userId = req.user._id

    // Fetch messages exchange between the two users
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: targetUserId },
        { sender: targetUserId, recipient: userId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'username profilePicture')
    .populate('recipient', 'username profilePicture')

    // Mark messages received from target user as read
    await Message.updateMany(
      { sender: targetUserId, recipient: userId, isRead: false },
      { $set: { isRead: true } }
    )

    res.status(200).json({ message: 'messages list', payload: messages })
  } catch (err) {
    next(err)
  }
})
