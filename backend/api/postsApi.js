import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import upload from '../middleware/uploadMiddleware.js'
import { Post } from '../models/Post.js'
import { User } from '../models/User.js'
import { Comment } from '../models/Comment.js'

export const postApp = express.Router()

// get home feed (protected)
postApp.get('/', protect, async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 0
    const limit = parseInt(req.query.limit) || 10
    const currentUser = await User.findById(req.user._id)
    const followingIds = currentUser.following

    // show posts from followed users + own; fall back to all if following nobody
    const filter = followingIds.length > 0
      ? { author: { $in: [...followingIds, req.user._id] }, isDeleted: false }
      : { isDeleted: false }

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit)
      .populate('author', 'username profilePicture')

    const total = await Post.countDocuments(filter)
    res.status(200).json({
      message:     'feed fetched',
      payload:     posts,
      currentPage: page,
      totalPages:  Math.ceil(total / limit),
      hasMore:     page * limit + posts.length < total,
    })
  } catch (err) { next(err) }
})

// get all posts by a user (protected)
postApp.get('/user/:id', protect, async (req, res, next) => {
  try {
    const posts = await Post.find({ author: req.params.id, isDeleted: false })
      .sort({ createdAt: -1 })
      .populate('author', 'username profilePicture')
    res.status(200).json({ message: 'user posts fetched', payload: posts })
  } catch (err) { next(err) }
})

// get single post (protected)
postApp.get('/:id', protect, async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false })
      .populate('author', 'username profilePicture')
    if (!post) return res.status(404).json({ message: 'Post not found' })
    const isLiked = post.likes.includes(req.user._id)
    res.status(200).json({ message: 'post found', payload: post, isLiked })
  } catch (err) { next(err) }
})

// create post (protected + optional image upload)
postApp.post('/', protect, upload.single('image'), async (req, res, next) => {
  try {
    const { content } = req.body
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Post content is required' })
    }
    const post = await Post.create({ author: req.user._id, content: content.trim() })
    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: 1 } })
    const populatedPost = await post.populate('author', 'username profilePicture')
    res.status(201).json({ message: 'post created', payload: populatedPost })
  } catch (err) { next(err) }
})

// soft delete post (protected — owner only)
postApp.delete('/:id', protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post || post.isDeleted) return res.status(404).json({ message: 'Post not found' })
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' })
    }
    // soft delete — keep in DB, hidden from queries
    post.isDeleted = true
    await post.save()
    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: -1 } })
    res.status(200).json({ message: 'post deleted' })
  } catch (err) { next(err) }
})

// like / unlike toggle (protected)
postApp.post('/:id/like', protect, async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false })
    if (!post) return res.status(404).json({ message: 'Post not found' })
    const alreadyLiked = post.likes.includes(req.user._id)
    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString())
    } else {
      post.likes.push(req.user._id)
    }
    await post.save()
    res.status(200).json({
      message:    'like toggled',
      liked:      !alreadyLiked,
      likesCount: post.likes.length,
    })
  } catch (err) { next(err) }
})