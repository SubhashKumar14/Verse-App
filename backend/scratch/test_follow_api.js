/**
 * backend/scratch/test_follow_api.js
 *
 * Scratch/debug script used to validate the follow/follower query logic.
 * Connects to MongoDB, picks a sample user, reproduces the follower list shape
 * the API returns (including `isFollowing`), and logs a sample payload.
 */
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import dns from 'dns'
import { fileURLToPath } from 'url'
import { Follow } from '../models/Follow.js'
import { User } from '../models/User.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

async function main() {
  const dbUri = process.env.MONGO_URI
  console.log('Connecting to', dbUri)
  if (dbUri.startsWith('mongodb+srv://')) {
    try {
      dns.setServers(['8.8.8.8'])
    } catch (dnsErr) {
      console.warn('dns setServers error:', dnsErr)
    }
  }
  await mongoose.connect(dbUri)
  console.log('Connected!')

  // Find a user who has following or followers
  const user = await User.findOne({ followersCount: { $gt: 0 } })
  if (!user) {
    console.log('No user with followers found!')
    await mongoose.disconnect()
    return
  }

  console.log(`User: ${user.username} (${user._id}) has followersCount: ${user.followersCount}, followingCount: ${user.followingCount}`)

  // Find followers using Follow.find (exact replica of backend API logic)
  const follows = await Follow.find({ following: user._id })
    .populate('follower', 'username profilePicture bio followersCount followingCount')
  
  const followersList = follows.map(f => f.follower).filter(Boolean)
  const followerIds = followersList.map(u => u._id)
  
  // We use a mock req.user._id (e.g. the user themselves, or another random user)
  const mockCurrentUserId = user._id
  const activeFollows = await Follow.find({ follower: mockCurrentUserId, following: { $in: followerIds } })
  const followedIds = new Set(activeFollows.map(f => f.following.toString()))

  const payload = followersList.map(u => {
    const uObj = u.toObject ? u.toObject() : u
    return {
      ...uObj,
      isFollowing: followedIds.has(uObj._id.toString())
    }
  })

  console.log('Sample payload item:', payload[0])
  console.log('Payload item keys:', payload[0] ? Object.keys(payload[0]) : 'None')
  console.log('Payload item _id type:', payload[0] ? typeof payload[0]._id : 'None')
  console.log('Payload item username:', payload[0]?.username)

  await mongoose.disconnect()
}

main().catch(console.error)
