import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { Comment } from '../models/Comment.js'
import { Post } from '../models/Post.js'

export const commentApp = express.Router()

// get all active comments for a post (protected)
commentApp.get('/:postId', protect, async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.postId, isDeleted: false })
      .sort({ createdAt: 1 })   // oldest first — thread order
      .populate('author', 'username profilePicture')
    res.status(200).json({ message: 'comments fetched', payload: comments })
  } catch (err) { next(err) }
})

// add comment to a post (protected)
commentApp.post('/:postId', protect, async (req, res, next) => {
  try {
    const { text } = req.body
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text is required' })
    }
    const post = await Post.findOne({ _id: req.params.postId, isDeleted: false })
    if (!post) return res.status(404).json({ message: 'Post not found' })

    const comment = await Comment.create({
      post:   req.params.postId,
      author: req.user._id,
      text:   text.trim(),
    })
    // increment commentsCount on the post
    post.commentsCount = (post.commentsCount || 0) + 1
    await post.save()

    const populated = await comment.populate('author', 'username profilePicture')
    res.status(201).json({ message: 'comment added', payload: populated })
  } catch (err) { next(err) }
})

// soft delete comment (protected — author only)
commentApp.patch('/:id', protect, async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment || comment.isDeleted) {
      return res.status(404).json({ message: 'Comment not found' })
    }
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' })
    }
    // soft delete — keep in DB, hidden from queries
    comment.isDeleted = true
    await comment.save()
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } })
    res.status(200).json({ message: 'comment deleted' })
  } catch (err) { next(err) }
})

// get archived comments (protected — author only)
commentApp.get('/archives/user', protect, async (req, res, next) => {
  try {
    const archivedComments = await Comment.find({ author: req.user._id, isDeleted: true })
      .sort({ updatedAt: -1 })
      .populate('post', 'content')
      .populate('author', 'username profilePicture')
    res.status(200).json({ message: 'archived comments fetched', payload: archivedComments })
  } catch (err) { next(err) }
})

// restore soft deleted comment (protected — author only)
commentApp.patch('/:id/restore', protect, async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment || !comment.isDeleted) {
      return res.status(404).json({ message: 'Archived comment not found' })
    }
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to restore this comment' })
    }
    // restore — unhide from queries
    comment.isDeleted = false
    await comment.save()
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: 1 } })
    res.status(200).json({ message: 'comment restored', payload: comment })
  } catch (err) { next(err) }
})
