import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectDB } from './config/db.js'
import { errorHandler } from './middleware/errorHandler.js'
import { userApp }    from './api/usersApi.js'
import { postApp }    from './api/postsApi.js'
import { commentApp } from './api/commentsApi.js'
import { commonApp }  from './api/commonApi.js'
import { notificationsApp } from './api/notificationsApi.js'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()

// ─── Connect to MongoDB ───────────────────────────────────────────────────
connectDB()

// ─── Middleware ───────────────────────────────────────────────────────────
// Allow multiple origins via comma-separated CORS_ORIGIN env var.
const rawOrigins = process.env.CORS_ORIGIN || 'http://localhost:5173'
const allowedOrigins = rawOrigins.split(',').map(s => s.trim())

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (e.g., curl, server-side)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('CORS origin not allowed'), false)
  },
  credentials: true,
}))
app.use(cookieParser())
app.use(express.json())                        // parse JSON request bodies
app.use(express.urlencoded({ extended: true })) // parse form data

// ─── Routes ──────────────────────────────────────────────────────────────
app.use('/api/users',    userApp)
app.use('/api/posts',    postApp)
app.use('/api/comments', commentApp)
app.use('/api/common',   commonApp)   // auth: register, login, logout, me
app.use('/api/notifications', notificationsApp)

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