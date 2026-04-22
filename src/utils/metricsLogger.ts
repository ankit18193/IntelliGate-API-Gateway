import { MetricsModel } from "@/models/metrics.model";
import { RequestMetrics } from "./metricsCollector";

export const logMetricsToDB = async (
  metrics: RequestMetrics,
  userId?: string
) => {
  try {
    await MetricsModel.create({
      ...metrics,
      userId: userId || null,
    });

    console.log("Metrics saved to MongoDB");
  } catch (err) {
    console.warn("MongoDB logging failed:", err);
  }
};