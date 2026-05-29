/**
 * backend/check.js
 *
 * Tiny one-off debug script to inspect MongoDB data during development.
 * Connects to the local DB and prints posts that have an imageUrl.
 *
 * Note: This file uses CommonJS (`require`) even though the backend is ESM.
 * It's meant as a standalone dev helper.
 */
const mongoose = require('mongoose');

async function check() {
  await mongoose.connect('mongodb://localhost:27017/verse-app');
  const posts = await mongoose.connection.db.collection('posts').find({ imageUrl: { $ne: null } }).toArray();
  console.log('Posts with images:', posts);
  console.log('Total posts:', await mongoose.connection.db.collection('posts').countDocuments());
  process.exit(0);
}

check();
