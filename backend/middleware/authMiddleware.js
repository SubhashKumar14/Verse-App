import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'

// ─────────────────────────────────────────────────────────────────────────
//  protect middleware
//  Attaches req.user to every protected request.
//  Usage: route.get('/me', protect, handler)
// ─────────────────────────────────────────────────────────────────────────
export const protect = async (req, res, next) => {
  let token

  // token must be in the Authorization header as: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized — no token provided' })
  }

  try {
    // verify the token with our secret — throws if expired or tampered
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // attach the full user object to req so route handlers can use it
    req.user = await User.findById(decoded.id)

    if (!req.user) {
      return res.status(401).json({ message: 'User belonging to this token no longer exists' })
    }

    next() // token is valid — pass to the handler
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired — please login again' })
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token — please login again' })
    }
    return next(err)
  }
}