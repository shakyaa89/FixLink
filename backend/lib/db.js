// Database connection setup for MongoDB
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Connect to MongoDB using env URI.
    const conn = await mongoose.connect(process.env.MONGO_URI);
    // Log database name on successful connect.
    console.log(`Connected to DB: ${conn.connection.name}`);
  } catch {
    // Keep process alive and report failure.
    console.log("Failed to connect to DB");
  }
};

export default connectDB;
