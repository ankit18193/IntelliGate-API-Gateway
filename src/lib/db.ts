import mongoose from "mongoose";
import { env } from "@/config/env";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log(" MongoDB Connected");
  } catch (error) {
    console.error(" MongoDB Error:", error);
    process.exit(1);
  }
};