import mongoose from "mongoose";

// Connect to MongoDB (Atlas or local) using the MONGO_URI env var.
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not set. Copy .env.example to .env and fill it in.");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1);
  }
};

export default connectDB;
