import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { User } from '../models/User.js'

export const userApp = express.Router()

// search users — must be before /:id to avoid route collision
userApp.get('/search', protect, async (req, res, next) => {
  try {
    const query = req.query.q
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' })
    }
    // case-insensitive search on username or email, exclude current user
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email:    { $regex: query, $options: 'i' } },
      ],
      _id: { $ne: req.user._id },
    }).limit(20)
    res.status(200).json({ message: 'search results', payload: users })
  } catch (err) { next(err) }
})

// get user by id (protected)
userApp.get('/:id', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    const isFollowing = user.followers.includes(req.user._id)
    res.status(200).json({ message: 'user found', payload: user, isFollowing })
  } catch (err) { next(err) }
})

// update profile (protected — own profile only)
userApp.put('/:id', protect, async (req, res, next) => {
  try {
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed to edit another user's profile" })
    }
    const { bio, username } = req.body
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { bio, username },
      { new: true, runValidators: true }
    )
    res.status(200).json({ message: 'profile updated', payload: updatedUser })
  } catch (err) { next(err) }
})

// follow / unfollow toggle (protected)
userApp.post('/:id/follow', protect, async (req, res, next) => {
  try {
    const targetId    = req.params.id
    const currentId   = req.user._id.toString()
    if (targetId === currentId) {
      return res.status(400).json({ message: 'You cannot follow yourself' })
    }
    const [targetUser, currentUser] = await Promise.all([
      User.findById(targetId),
      User.findById(currentId),
    ])
    if (!targetUser) return res.status(404).json({ message: 'User not found' })

    const isFollowing = currentUser.following.includes(targetId)
    if (isFollowing) {
      currentUser.following.pull(targetId)
      targetUser.followers.pull(currentId)
    } else {
      currentUser.following.push(targetId)
      targetUser.followers.push(currentId)
    }
    await Promise.all([currentUser.save(), targetUser.save()])
    res.status(200).json({
      message:        'follow toggled',
      following:      !isFollowing,
      followersCount: targetUser.followers.length,
    })
  } catch (err) { next(err) }
})

// get following list (protected)
userApp.get('/:id/following', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'username profilePicture bio followers')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.status(200).json({ message: 'following list', payload: user.following })
  } catch (err) { next(err) }
})

// get followers list (protected)
userApp.get('/:id/followers', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username profilePicture bio followers')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.status(200).json({ message: 'followers list', payload: user.followers })
  } catch (err) { next(err) }
})