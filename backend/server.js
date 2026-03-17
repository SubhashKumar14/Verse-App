import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db.js'
import { errorHandler } from './middleware/errorHandler.js'
import { userApp }    from './api/usersApi.js'
import { postApp }    from './api/postsApi.js'
import { commentApp } from './api/commentsApi.js'
import { commonApp }  from './api/commonApi.js'
import dotenv from 'dotenv'
dotenv.config()

const app = express()

// ─── Connect to MongoDB ───────────────────────────────────────────────────
connectDB()

// ─── Middleware ───────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())                        // parse JSON request bodies
app.use(express.urlencoded({ extended: true })) // parse form data

// ─── Routes ──────────────────────────────────────────────────────────────
app.use('/api/users',    userApp)
app.use('/api/posts',    postApp)
app.use('/api/comments', commentApp)
app.use('/api/common',   commonApp)   // auth: register, login, logout, me

// ─── Health check ─────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: 'Threadly API is running' }))

// ─── 404 handler ──────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` })
})

// ─── Global error handler (must be last) ─────────────────────────────────
app.use(errorHandler)

// ─── Start server ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))