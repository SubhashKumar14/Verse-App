import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { User } from '../models/User.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '../.env') })

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGO_URI_LOCAL
    await mongoose.connect(mongoUri)
    const users = await User.find({}, 'username').limit(5)
    console.log('\n--- 5 Seeded Users (Password is: password123) ---')
    users.forEach(u => console.log(`- ${u.username}`))
    console.log('-------------------------------------------------\n')
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}
run()
