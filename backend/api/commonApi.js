import express from 'express'
import jwt from 'jsonwebtoken'
import { protect } from '../middleware/authMiddleware.js'
import { registerUser, loginUser, getAuthUser } from '../services/authService.js'

export const commonApp = express.Router()

const getCookieOptions = (token) => {
  const decoded = jwt.decode(token)
  const secure = process.env.NODE_ENV === 'production'
  const sameSite = secure ? 'none' : 'lax'
  const options = {
    httpOnly: true,
    secure,
    sameSite,
    path: '/',
  }

  if (decoded?.exp) {
    options.expires = new Date(decoded.exp * 1000)
  }

  return options
}

// register
commonApp.post('/register', async (req, res, next) => {
  try {
    const { user, token } = await registerUser(req.body)
    res.cookie('token', token, getCookieOptions(token))
    res.status(201).json({ message: 'user registered', payload: user })
  } catch (err) { next(err) }
})

// login
commonApp.post('/login', async (req, res, next) => {
  try {
    const { user, token } = await loginUser(req.body)
    res.cookie('token', token, getCookieOptions(token))
    res.status(200).json({ message: 'login success', payload: user })
  } catch (err) { next(err) }
})

// logout
commonApp.post('/logout', (req, res) => {
  const secure = process.env.NODE_ENV === 'production'
  res.clearCookie('token', {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    path: '/',
  })
  res.status(200).json({ message: 'logged out successfully' })
})

// get authenticated user (protected)
commonApp.get('/user', protect, async (req, res, next) => {
  try {
    const user = await getAuthUser(req.user._id)
    res.status(200).json({ message: 'authenticated user', payload: user })
  } catch (err) { next(err) }
})