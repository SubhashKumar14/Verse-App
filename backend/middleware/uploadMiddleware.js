import multer from 'multer'

// store file in memory (as Buffer) — we then stream it to Cloudinary
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