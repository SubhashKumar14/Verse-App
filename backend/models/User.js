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

    coverPhoto: {
      type:    String,
      default: '',
    },

    // store ObjectId arrays for follow relationships
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:  'User',
      },
    ],

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:  'User',
      },
    ],

    postsCount: {
      type:    Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
  }
)

// virtuals: computed on the fly, not stored in DB
userSchema.virtual('followersCount').get(function () {
  return this.followers?.length || 0
})

userSchema.virtual('followingCount').get(function () {
  return this.following?.length || 0
})

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