import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { Notification } from '../models/Notification.js'

export const notificationsApp = express.Router()

// GET / — Fetch notifications for the logged-in user
notificationsApp.get('/', protect, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'username profilePicture')
      .populate('post', 'content imageUrl')
      .sort({ createdAt: -1 })
      .limit(50)

    res.status(200).json({
      message: 'notifications fetched',
      payload: notifications
    })
  } catch (err) {
    next(err)
  }
})

// PATCH /read-all — Mark all notifications as read
notificationsApp.patch('/read-all', protect, async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    )

    res.status(200).json({
      message: 'all notifications marked as read'
    })
  } catch (err) {
    next(err)
  }
})

// PATCH /:id/read — Mark a specific notification as read
notificationsApp.patch('/:id/read', protect, async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { $set: { isRead: true } },
      { new: true }
    )

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    res.status(200).json({
      message: 'notification marked as read',
      payload: notification
    })
  } catch (err) {
    next(err)
  }
})
