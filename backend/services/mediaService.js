/**
 * backend/services/mediaService.js
 *
 * Cloudinary helpers used by API routes.
 * Uploads images from an in-memory Multer buffer and deletes by public_id.
 * Throws a 500-style error if Cloudinary credentials are missing.
 */
import { Readable } from 'stream'
import { cloudinary } from '../config/cloudinary.js'

const hasCloudinaryCredentials = () => Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
)

const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

const getCloudinaryFolder = () => process.env.CLOUDINARY_FOLDER || 'verse-app'

const uploadBuffer = (buffer, options) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
    if (error) {
      reject(error)
      return
    }

    resolve(result)
  })

  Readable.from(buffer).pipe(stream)
})

const ensureCloudinaryReady = () => {
  if (!hasCloudinaryCredentials()) {
    const error = new Error('Cloudinary is not configured')
    error.statusCode = 500
    throw error
  }

  configureCloudinary()
}

export const uploadImage = async (file, folder = getCloudinaryFolder()) => {
  if (!file) return null

  ensureCloudinaryReady()

  return uploadBuffer(file.buffer, {
    folder,
    resource_type: 'image',
  })
}

export const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return null

  ensureCloudinaryReady()

  return cloudinary.uploader.destroy(publicId)
}
