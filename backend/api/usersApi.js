/**
 * backend/api/usersApi.js
 *
 * Express router for user/profile flows:
 * - User search (must be before `/:id`)
 * - Onboarding: storing interest scores
 * - Profile read + update (including optional avatar upload)
 * - Follow/unfollow toggles and follower/following lists
 * - Emits follow notifications
 *
 * Mounted at `/api/users` in backend/server.js.
 */
import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import upload from '../middleware/uploadMiddleware.js'
import {
  validateObjectIdParam,
  validateOnboardingInterestsBody,
  validateProfileUpdateBody,
  validateSearchQuery,
} from '../middleware/validationMiddleware.js'
import { User } from '../models/User.js'
import { Follow } from '../models/Follow.js'
import { Notification } from '../models/Notification.js'
import { deleteCloudinaryImage, uploadImage } from '../services/mediaService.js'

export const userApp = express.Router()

// search users — must be before /:id to avoid route collision
userApp.get('/search', protect, validateSearchQuery({ paramName: 'q', maxLength: 100 }), async (req, res, next) => {
  try {
    const query = req.query.q
    let users = []

    if (!query) {
      // If no query, return some users as recommendations
      users = await User.find({ _id: { $ne: req.user._id } }).limit(5)
    } else {
      // Escape user input so it behaves like a literal search string (and
      // avoids regex injection/perf issues).
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

      // case-insensitive search on username or email, exclude current user
      users = await User.find({
        $or: [
          { username: { $regex: escapedQuery, $options: 'i' } },
          { email:    { $regex: escapedQuery, $options: 'i' } },
        ],
        _id: { $ne: req.user._id },
      }).limit(20)
    }

    // Map to include isFollowing field
    const userIds = users.map(u => u._id)
    const activeFollows = await Follow.find({ follower: req.user._id, following: { $in: userIds } })
    const followedIds = new Set(activeFollows.map(f => f.following.toString()))

    const payload = users.map(u => {
      const uObj = u.toObject ? u.toObject() : u
      return {
        ...uObj,
        isFollowing: followedIds.has(uObj._id.toString())
      }
    })

    res.status(200).json({ message: 'search results', payload })
  } catch (err) { next(err) }
})

// onboarding interests (protected)
userApp.post('/onboarding-interests', protect, validateOnboardingInterestsBody, async (req, res, next) => {
  try {
    const { interests } = req.body

    const interestScores = {}
    interests.forEach(interest => {
      const category = interest.toLowerCase().trim()
      if (category) {
        interestScores[category] = 1.0
      }
    })

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { interestScores },
      { new: true }
    )

    res.status(200).json({ message: 'onboarding interests saved', payload: updatedUser })
  } catch (err) { next(err) }
})

// get user by id (protected)
userApp.get('/:id', protect, validateObjectIdParam('id'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    const followRecord = await Follow.findOne({ follower: req.user._id, following: req.params.id })
    const isFollowing = !!followRecord
    res.status(200).json({ message: 'user found', payload: user, isFollowing })
  } catch (err) { next(err) }
})

// update profile (protected — own profile only)
userApp.put(
  '/:id',
  protect,
  validateObjectIdParam('id'),
  upload.single('profilePicture'),
  validateProfileUpdateBody,
  async (req, res, next) => {
  let uploadedProfilePicture = null

  try {
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed to edit another user's profile" })
    }
    const { bio, username } = req.body
    const updatedFields = {}

    if (typeof username !== 'undefined') {
      updatedFields.username = username.trim()
    }

    if (typeof bio !== 'undefined') {
      updatedFields.bio = bio.trim()
    }

    if (req.file) {
      uploadedProfilePicture = await uploadImage(req.file)
      updatedFields.profilePicture = uploadedProfilePicture.secure_url
      updatedFields.profilePicturePublicId = uploadedProfilePicture.public_id
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true, runValidators: true }
    )

    if (req.file && req.user.profilePicturePublicId && req.user.profilePicturePublicId !== uploadedProfilePicture?.public_id) {
      try {
        await deleteCloudinaryImage(req.user.profilePicturePublicId)
      } catch {
        // Best-effort cleanup, keep the profile update successful.
      }
    }

    res.status(200).json({ message: 'profile updated', payload: updatedUser })
  } catch (err) {
    if (uploadedProfilePicture?.public_id) {
      try {
        await deleteCloudinaryImage(uploadedProfilePicture.public_id)
      } catch {
        // Ignore cleanup failures.
      }
    }
    next(err)
  }
})

// follow / unfollow toggle (protected)
userApp.post('/:id/follow', protect, validateObjectIdParam('id'), async (req, res, next) => {
  try {
    const targetId    = req.params.id
    const currentId   = req.user._id.toString()
    if (targetId === currentId) {
      return res.status(400).json({ message: 'You cannot follow yourself' })
    }
    const targetUser = await User.findById(targetId)
    if (!targetUser) return res.status(404).json({ message: 'User not found' })

    const existingFollow = await Follow.findOne({ follower: currentId, following: targetId })
    let isFollowing = false

    if (existingFollow) {
      await Follow.findOneAndDelete({ _id: existingFollow._id })
      isFollowing = false
    } else {
      await Follow.create({ follower: currentId, following: targetId })
      isFollowing = true

      // Create notification
      await Notification.create({
        recipient: targetId,
        sender:    currentId,
        type:      'follow'
      })
    }

    // Refetch target user to get updated counts
    const updatedTarget = await User.findById(targetId)

    res.status(200).json({
      message:        'follow toggled',
      following:      isFollowing,
      followersCount: updatedTarget.followersCount,
    })
  } catch (err) { next(err) }
})

// get following list (protected)
userApp.get('/:id/following', protect, validateObjectIdParam('id'), async (req, res, next) => {
  try {
    const follows = await Follow.find({ follower: req.params.id })
      .populate('following', 'username profilePicture bio followersCount followingCount')
    const followingList = follows.map(f => f.following).filter(Boolean)
    
    // Check which of these the logged in user is following
    const followingIds = followingList.map(u => u._id)
    const activeFollows = await Follow.find({ follower: req.user._id, following: { $in: followingIds } })
    const followedIds = new Set(activeFollows.map(f => f.following.toString()))

    const payload = followingList.map(u => {
      const uObj = u.toObject ? u.toObject() : u
      return {
        ...uObj,
        isFollowing: followedIds.has(uObj._id.toString())
      }
    })

    res.status(200).json({ message: 'following list', payload })
  } catch (err) { next(err) }
})

// get followers list (protected)
userApp.get('/:id/followers', protect, validateObjectIdParam('id'), async (req, res, next) => {
  try {
    const follows = await Follow.find({ following: req.params.id })
      .populate('follower', 'username profilePicture bio followersCount followingCount')
    const followersList = follows.map(f => f.follower).filter(Boolean)

    // Check which of these the logged in user is following
    const followerIds = followersList.map(u => u._id)
    const activeFollows = await Follow.find({ follower: req.user._id, following: { $in: followerIds } })
    const followedIds = new Set(activeFollows.map(f => f.following.toString()))

    const payload = followersList.map(u => {
      const uObj = u.toObject ? u.toObject() : u
      return {
        ...uObj,
        isFollowing: followedIds.has(uObj._id.toString())
      }
    })

    res.status(200).json({ message: 'followers list', payload })
  } catch (err) { next(err) }
})