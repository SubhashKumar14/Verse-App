import mongoose from 'mongoose'

const followSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Follower is required"],
      // "follower" is the person WHO clicked Follow
    },

    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Following is required"],
      // "following" is the person BEING followed
    },
  },
  {
    timestamps: true,
  }
);

// ─── UNIQUE CONSTRAINT: A user can only follow another user once ───────────
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// ─── INDEX: "Who is this user following?" — used in feed algorithm ─────────
followSchema.index({ follower: 1 });

// ─── INDEX: "Who follows this user?" — used on profile followers list ──────
followSchema.index({ following: 1 });

// ─── MIDDLEWARE: Update follower/following counts when a follow is created ─
followSchema.post("save", async function () {
  const User = mongoose.model("User");
  // follower's followingCount goes up
  await User.findByIdAndUpdate(this.follower, { $inc: { followingCount: 1 } });
  // following's followersCount goes up
  await User.findByIdAndUpdate(this.following, { $inc: { followersCount: 1 } });
});

// ─── MIDDLEWARE: Update counts when a follow is removed ───────────────────
followSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    const User = mongoose.model("User");
    await User.findByIdAndUpdate(doc.follower,  { $inc: { followingCount: -1 } });
    await User.findByIdAndUpdate(doc.following, { $inc: { followersCount: -1 } });
  }
});

export const Follow = mongoose.model('Follow', followSchema)