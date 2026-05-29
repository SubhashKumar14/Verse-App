/**
 * backend/middleware/validationMiddleware.js
 *
 * Lightweight request validation + normalization helpers.
 * Keeps route handlers focused on business logic while enforcing
 * capstone-grade input rules (IDs, auth payloads, pagination, etc.).
 */
import mongoose from 'mongoose'

const emailRegex = /^\S+@\S+\.\S+$/
const usernameRegex = /^[a-zA-Z0-9_]+$/

const badRequest = (res, message, errors) => {
  return res.status(400).json({
    message,
    ...(errors ? { errors } : {}),
  })
}

export const validateObjectIdParam = (paramName = 'id') => (req, res, next) => {
  const value = req.params?.[paramName]
  if (!value || !mongoose.Types.ObjectId.isValid(value)) {
    return badRequest(res, 'Invalid ID format')
  }
  next()
}

export const validatePaginationQuery = ({ maxLimit = 50 } = {}) => (req, res, next) => {
  const { page, limit } = req.query || {}
  const errors = []

  if (typeof page !== 'undefined') {
    const pageNum = Number(page)
    if (!Number.isInteger(pageNum) || pageNum < 0) {
      errors.push({ field: 'page', message: 'page must be an integer >= 0' })
    }
  }

  if (typeof limit !== 'undefined') {
    const limitNum = Number(limit)
    if (!Number.isInteger(limitNum) || limitNum < 1) {
      errors.push({ field: 'limit', message: 'limit must be an integer >= 1' })
    } else if (limitNum > maxLimit) {
      errors.push({ field: 'limit', message: `limit must be <= ${maxLimit}` })
    }
  }

  if (errors.length) {
    return badRequest(res, 'Validation failed', errors)
  }

  next()
}

export const validateRegisterBody = (req, res, next) => {
  const body = req.body || {}
  const errors = []

  const username = typeof body.username === 'string' ? body.username.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!username) {
    errors.push({ field: 'username', message: 'Username is required' })
  } else {
    if (username.length < 3 || username.length > 30) {
      errors.push({ field: 'username', message: 'Username must be 3-30 characters' })
    }
    if (!usernameRegex.test(username)) {
      errors.push({ field: 'username', message: 'Username can only contain letters, numbers and underscores' })
    }
  }

  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' })
  } else if (!emailRegex.test(email)) {
    errors.push({ field: 'email', message: 'Please provide a valid email' })
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' })
  } else if (password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' })
  } else if (password.length > 128) {
    errors.push({ field: 'password', message: 'Password is too long' })
  }

  if (errors.length) {
    return badRequest(res, 'Validation failed', errors)
  }

  req.body.username = username
  req.body.email = email
  req.body.password = password
  next()
}

export const validateLoginBody = (req, res, next) => {
  const body = req.body || {}
  const errors = []

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' })
  } else if (!emailRegex.test(email)) {
    errors.push({ field: 'email', message: 'Please provide a valid email' })
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' })
  }

  if (errors.length) {
    return badRequest(res, 'Validation failed', errors)
  }

  req.body.email = email
  req.body.password = password
  next()
}

export const validateOnboardingInterestsBody = (req, res, next) => {
  const interests = req.body?.interests

  if (!Array.isArray(interests)) {
    return badRequest(res, 'Interests array is required')
  }

  const normalized = interests
    .filter((x) => typeof x === 'string')
    .map((x) => x.toLowerCase().trim())
    .filter(Boolean)

  const unique = [...new Set(normalized)]

  if (unique.length < 3) {
    return badRequest(res, 'Please select at least 3 interests')
  }

  if (unique.some((x) => x.length > 40)) {
    return badRequest(res, 'Interest value is too long')
  }

  req.body.interests = unique
  next()
}

export const validateProfileUpdateBody = (req, res, next) => {
  const body = req.body || {}
  const errors = []

  if (typeof body.username !== 'undefined') {
    if (typeof body.username !== 'string') {
      errors.push({ field: 'username', message: 'username must be a string' })
    } else {
      const username = body.username.trim()
      if (!username) {
        errors.push({ field: 'username', message: 'Username cannot be empty' })
      } else {
        if (username.length < 3 || username.length > 30) {
          errors.push({ field: 'username', message: 'Username must be 3-30 characters' })
        }
        if (!usernameRegex.test(username)) {
          errors.push({ field: 'username', message: 'Username can only contain letters, numbers and underscores' })
        }
      }
      body.username = username
    }
  }

  if (typeof body.bio !== 'undefined') {
    if (typeof body.bio !== 'string') {
      errors.push({ field: 'bio', message: 'bio must be a string' })
    } else {
      const bio = body.bio.trim()
      if (bio.length > 160) {
        errors.push({ field: 'bio', message: 'Bio cannot exceed 160 characters' })
      }
      body.bio = bio
    }
  }

  if (errors.length) {
    return badRequest(res, 'Validation failed', errors)
  }

  req.body = body
  next()
}

export const validateCreatePostBody = (req, res, next) => {
  const body = req.body || {}
  const errors = []

  const rawContent = typeof body.content === 'string' ? body.content : ''
  const content = rawContent.trim()

  const hasFile = Boolean(req.file)
  const hasText = content.length > 0

  if (!hasText && !hasFile) {
    return badRequest(res, 'Post content or image is required')
  }

  if (hasText && content.length > 280) {
    errors.push({ field: 'content', message: 'Post cannot exceed 280 characters' })
  }

  if (typeof body.category !== 'undefined') {
    if (typeof body.category !== 'string') {
      errors.push({ field: 'category', message: 'category must be a string' })
    } else {
      const category = body.category.trim().toLowerCase()
      if (category && category.length > 40) {
        errors.push({ field: 'category', message: 'category is too long' })
      }
      body.category = category
    }
  }

  if (errors.length) {
    return badRequest(res, 'Validation failed', errors)
  }

  req.body.content = content
  if (typeof body.category !== 'undefined') {
    req.body.category = body.category
  }

  next()
}

export const validateCreateCommentBody = (req, res, next) => {
  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : ''

  if (!text) {
    return badRequest(res, 'Comment text is required')
  }

  if (text.length > 280) {
    return badRequest(res, 'Comment cannot exceed 280 characters')
  }

  req.body.text = text
  next()
}

export const validateSearchQuery = ({ paramName = 'q', maxLength = 100 } = {}) => (req, res, next) => {
  const value = req.query?.[paramName]
  if (typeof value === 'undefined' || value === null) return next()

  if (typeof value !== 'string') {
    return badRequest(res, 'Validation failed', [{ field: paramName, message: `${paramName} must be a string` }])
  }

  const trimmed = value.trim()
  if (trimmed.length > maxLength) {
    return badRequest(res, 'Validation failed', [{ field: paramName, message: `${paramName} must be <= ${maxLength} characters` }])
  }

  req.query[paramName] = trimmed
  next()
}
