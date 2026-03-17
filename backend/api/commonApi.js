import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { registerUser, loginUser, getAuthUser } from '../services/authService.js'

export const commonApp = express.Router()

// register
commonApp.post('/register', async (req, res, next) => {
  try {
    const { user, token } = await registerUser(req.body)
    res.status(201).json({ message: 'user registered', payload: user, token })
  } catch (err) { next(err) }
})

// login
commonApp.post('/login', async (req, res, next) => {
  try {
    const { user, token } = await loginUser(req.body)
    res.status(200).json({ message: 'login success', payload: user, token })
  } catch (err) { next(err) }
})

// logout
commonApp.post('/logout', (req, res) => {
  res.status(200).json({ message: 'logged out successfully' })
})

// get authenticated user (protected)
commonApp.get('/user', protect, async (req, res, next) => {
  try {
    const user = await getAuthUser(req.user._id)
    res.status(200).json({ message: 'authenticated user', payload: user })
  } catch (err) { next(err) }
})