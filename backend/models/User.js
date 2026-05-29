/**
 * backend/models/User.js
 *
 * Mongoose User model.
 * Stores identity/profile fields, counts (followers/following/posts),
 * onboarding interest scores, and privacy settings.
 * Includes:
 * - password hashing pre-save hook
 * - `matchPassword` instance method
 * - text index for username/bio search
 */
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    username: {
      type:      String,
      required:  [true, 'Username is required'],
      unique:    true,
      trim:      true,
      minlength: [3,  'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match:     [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'],
    },

    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },

    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select:    false,   // never returned in queries unless .select('+password')
    },

    bio: {
      type:      String,
      default:   '',
      maxlength: [160, 'Bio cannot exceed 160 characters'],
      trim:      true,
    },

    profilePicture: {
      type:    String,
      default: '',        // Cloudinary secure_url stored here
    },

    profilePicturePublicId: {
      type:    String,
      default: '',
    },

    coverPhoto: {
      type:    String,
      default: '',
    },

    postsCount: {
      type:    Number,
      default: 0,
    },

    followersCount: {
      type:    Number,
      default: 0,
    },

    followingCount: {
      type:    Number,
      default: 0,
    },

    interestScores: {
      type:    Map,
      of:      Number,
      default: {},
    },

    // ─── Immutable onboarding selections (used by Explore to show unseen categories)
    onboardingInterests: {
      type:    [String],
      default: [],
    },

    privacy: {
      type:    String,
      enum:    ['public', 'private', 'followers_only'],
      default: 'public',
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
  }
)

// Index for text-based profile search
userSchema.index({ username: 'text', bio: 'text' })

// pre-save hook: hash password before storing
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 10)
})

// instance method: compare entered password with stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// indexes are automatically created by Mongoose because of unique: true in the schema definition

export const User = mongoose.model('User', userSchema)