/**
 * backend/middleware/errorHandler.js
 *
 * Global Express error handler middleware.
 * Must be registered LAST in backend/server.js — after all routes.
 *
 * Normalizes common error shapes (Mongoose/JWT/Multer/etc.) to a consistent
 * JSON response so the frontend can display helpful messages.
 */

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err)

  let statusCode = Number(err.statusCode || err.status) || 500
  let message = err.message || 'Internal Server Error'
  let errors

  // CORS
  if (err.message === 'Not allowed by CORS') {
    statusCode = 403
  }

  // Body parser: invalid JSON
  if (err.type === 'entity.parse.failed') {
    statusCode = 400
    message = 'Invalid JSON payload'
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = 'Validation failed'
    errors = err.errors
  }

  // Strict schema error (unknown fields when strict:"throw")
  if (err.name === 'StrictModeError') {
    statusCode = 400
    message = err.message
  }

  // Invalid ObjectId
  if (err.name === 'CastError') {
    statusCode = 400
    message = 'Invalid ID format'
  }

  // Duplicate key
  if (err.code === 11000) {
    statusCode = 409
    message = 'Duplicate field value'
    errors = err.keyValue
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token — please log in again'
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired — please log in again'
  }

  // Multer: file too large
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400
    message = 'Image file is too large — max 5MB allowed'
  }

  // Custom application/service errors with explicit status
  if (!Number.isNaN(Number(err.status)) && Number(err.status) >= 400) {
    statusCode = Number(err.status)
  }

  if (!Number.isNaN(Number(err.statusCode)) && Number(err.statusCode) >= 400) {
    statusCode = Number(err.statusCode)
  }

  res.status(statusCode).json({
    message,
    ...(errors ? { errors } : {}),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}