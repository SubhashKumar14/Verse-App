import mongoose from 'mongoose'

const likeSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Like must belong to a post"],
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Like must have a user"],
    },
  },
  {
    timestamps: true,
  }
);

// ─── UNIQUE CONSTRAINT: One like per user per post ─────────────────────────
// Trying to insert a duplicate will throw a MongoDB error (code 11000)
likeSchema.index({ post: 1, user: 1 }, { unique: true });

// ─── MIDDLEWARE: When a like is saved, increment post.likesCount ───────────
likeSchema.post("save", async function () {
  await mongoose.model("Post").findByIdAndUpdate(this.post, {
    $inc: { likesCount: 1 },
  });
});

// ─── MIDDLEWARE: When a like is deleted, decrement post.likesCount ─────────
likeSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await mongoose.model("Post").findByIdAndUpdate(doc.post, {
      $inc: { likesCount: -1 },
    });
  }
});

export const Like = mongoose.model('Like', likeSchema)