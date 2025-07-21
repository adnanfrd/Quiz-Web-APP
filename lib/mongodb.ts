import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined!") // Add this log
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

async function dbConnect() {
  const opts = {
    bufferCommands: false,
  }
  try {
    console.log("Attempting to connect to MongoDB...")
    const conn = await mongoose.connect(MONGODB_URI, opts)
    console.log("MongoDB connected successfully!")
    return conn
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw error
  }
}

export default dbConnect
