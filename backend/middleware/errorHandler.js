// ─────────────────────────────────────────────────────────────────────────
//  Global error handler middleware
//  Must be registered LAST in server.js — after all routes.
//  Usage: app.use(errorHandler)
// ─────────────────────────────────────────────────────────────────────────

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500
  let message    = err.message    || 'Internal server error'

  // Mongoose: invalid ObjectId format
  if (err.name === 'CastError') {
    statusCode = 404
    message    = 'Resource not found'
  }

  // Mongoose: duplicate key (unique field violated)
  if (err.code === 11000) {
    statusCode = 409
    const field = Object.keys(err.keyValue)[0]
    message    = `${field} already exists`
  }

  // Mongoose: validation error
  if (err.name === 'ValidationError') {
    statusCode = 400
    message    = Object.values(err.errors).map((e) => e.message).join(', ')
  }

  // JWT: invalid token
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message    = 'Invalid token — please log in again'
  }

  // JWT: expired token
  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message    = 'Token expired — please log in again'
  }

  // Multer: file too large
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400
    message    = 'Image file is too large — max 5MB allowed'
  }

  res.status(statusCode).json({
    success: false,
    message,
    // only expose stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}