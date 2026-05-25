import mongoose from 'mongoose'
import dns from 'dns'

export const connectDB = async () => {
  try {
    const isLocalFlag = process.argv.includes('--local')
    const isClusterFlag = process.argv.includes('--cluster') || process.argv.includes('--atlas')
    
    let dbUri
    let modeText = 'Cluster'

    if (isLocalFlag) {
      dbUri = process.env.MONGO_URI_LOCAL || 'mongodb://127.0.0.1:27017/verse-app'
      modeText = 'Local (CLI Flag)'
    } else if (isClusterFlag) {
      dbUri = process.env.MONGO_URI
      modeText = 'Cluster (CLI Flag)'
    } else if (process.env.MONGO_CONNECTION_MODE === 'local') {
      dbUri = process.env.MONGO_URI_LOCAL || 'mongodb://127.0.0.1:27017/verse-app'
      modeText = 'Local (Env Mode)'
    } else {
      // Default to MONGO_URI if present, fallback to local
      dbUri = process.env.MONGO_URI || process.env.MONGO_URI_LOCAL || 'mongodb://127.0.0.1:27017/verse-app'
      modeText = process.env.MONGO_URI ? 'Cluster (Default)' : 'Local (Fallback)'
    }

    console.log(`Attempting to connect to MongoDB in ${modeText} mode...`)

    // Set DNS servers to Google public DNS only for Atlas SRV connections to resolve SRV records.
    // This prevents local hostname resolution failures (like resolving 'localhost').
    if (dbUri.startsWith('mongodb+srv://') && !dbUri.includes('localhost') && !dbUri.includes('127.0.0.1')) {
      try {
        dns.setServers(['8.8.8.8'])
      } catch (dnsErr) {
        console.warn(`Failed to set DNS servers: ${dnsErr.message}`)
      }
    }

    const conn = await mongoose.connect(dbUri)
    console.log(`MongoDB connected (${modeText}): ${conn.connection.host}`)
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`)
    process.exit(1) // stop the server if DB fails to connect
  }
}