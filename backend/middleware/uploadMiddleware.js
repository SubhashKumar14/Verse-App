/**
 * backend/middleware/uploadMiddleware.js
 *
 * Multer configuration used by routes that accept image uploads.
 * Uses in-memory storage so `mediaService` can upload the buffer to Cloudinary.
 */
import multer from 'multer'

// Keep uploads in memory so Cloudinary can consume the buffer directly.
const storage = multer.memoryStorage()

// file filter — only allow image types
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (allowed.includes(file.mimetype)) {
    cb(null, true)  // accept
  } else {
    cb(new Error('Only JPEG, PNG, GIF and WebP images are allowed'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
})

export default upload
