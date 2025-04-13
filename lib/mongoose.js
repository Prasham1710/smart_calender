import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/calendar"

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    console.log("Connecting to MongoDB at:", MONGODB_URI ? MONGODB_URI.substring(0, MONGODB_URI.indexOf('@') + 1) + '******' : 'undefined')
    
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("Successfully connected to MongoDB")
        return mongoose
      })
      .catch((error) => {
        console.error("MongoDB connection error:", error)
        throw error
      })
  }

  try {
    cached.conn = await cached.promise
    return cached.conn
  } catch (error) {
    console.error("Failed to establish MongoDB connection:", error)
    throw error
  }
}
