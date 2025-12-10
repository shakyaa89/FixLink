import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to DB: ${conn.connection.name}`);
  } catch {
    console.log("Failed to connect to DB");
  }
};

export default connectDB;
