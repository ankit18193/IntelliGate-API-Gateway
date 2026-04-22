import { redis } from "@/lib/redis";
import { RequestMetrics } from "./metricsCollector";


const MAX_WINDOW_SIZE = 100;

export const storeMetrics = async (
  metrics: RequestMetrics
): Promise<void> => {
  if (!redis) return;

  const key = `metrics:${metrics.endpoint}`;

  try {
    
    const entry = JSON.stringify({
      latency: metrics.latency,
      status: metrics.status,
      ts: Date.now(),
    });

    
    await redis.lpush(key, entry);

    
    await redis.ltrim(key, 0, MAX_WINDOW_SIZE - 1);

  } catch (err: unknown) {
    console.warn("Metrics store failed:", err);
  }
};