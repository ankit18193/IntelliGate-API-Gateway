import mongoose from "mongoose";


export type Metrics = {
  endpoint: string;
  method: string;
  status: number;
  latency: number;
  timestamp: string;
  userId?: string | null;
};

const MetricsSchema = new mongoose.Schema({
  endpoint: { type: String, required: true },
  method: { type: String, required: true },
  status: { type: Number, required: true },
  latency: { type: Number, required: true },
  timestamp: { type: String, required: true },
  userId: { type: String, default: null },
});

// 🔥 Important for Next.js (avoid overwrite)
export const MetricsModel =
  mongoose.models.Metrics || mongoose.model("Metrics", MetricsSchema);