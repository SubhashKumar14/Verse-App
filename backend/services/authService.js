import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'

// ─── generate JWT ────────────────────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

// ─────────────────────────────────────────────
//  Register a new user
// ─────────────────────────────────────────────
export const registerUser = async ({ username, email, password }) => {
  if (!username || !email || !password) {
    const err = new Error('All fields are required')
    err.statusCode = 400
    throw err
  }

  if (await User.findOne({ email })) {
    const err = new Error('Email already registered')
    err.statusCode = 409
    throw err
  }

  if (await User.findOne({ username })) {
    const err = new Error('Username already taken')
    err.statusCode = 409
    throw err
  }

  // password is hashed by the pre-save hook in User.js
  const user = await User.create({ username, email, password })
  const token = generateToken(user._id)
  user.password = undefined
  return { user, token }
}

// ─────────────────────────────────────────────
//  Authenticate user and return token
// ─────────────────────────────────────────────
export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    const err = new Error('Email and password are required')
    err.statusCode = 400
    throw err
  }

  // select('+password') because password field has select:false in schema
  const user = await User.findOne({ email }).select('+password')

  if (!user || !(await user.matchPassword(password))) {
    const err = new Error('Invalid email or password')
    err.statusCode = 401
    throw err
  }

  const token = generateToken(user._id)
  user.password = undefined
  return { user, token }
}

// ─────────────────────────────────────────────
//  Get the authenticated user by ID
// ─────────────────────────────────────────────
export const getAuthUser = async (userId) => {
  const user = await User.findById(userId)
  if (!user) {
    const err = new Error('User not found')
    err.statusCode = 404
    throw err
  }
  return user
}
