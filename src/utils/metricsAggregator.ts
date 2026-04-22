import { redis } from "@/lib/redis";
import { calculateHealth } from "./healthScore";

type MetricEntry = {
  latency: number;
  status: number;
  ts: number;
};

export const getAggregatedMetrics = async () => {
  if (!redis) return [];

  try {
    
    const keys = await redis.keys("metrics:*");

    const results = [];

    for (const key of keys) {
      
      if (key.includes(":count") || key.includes(":errors") || key.includes(":latency_sum")) {
        continue;
      }

      const endpoint = key.replace("metrics:", "");

      
      const entries = await redis.lrange(key, 0, -1);

      if (entries.length === 0) continue;

      
      const parsed: MetricEntry[] = entries.map((item) =>
        JSON.parse(item)
      );

      const totalRequests = parsed.length;

      const errors = parsed.filter((m) => m.status >= 400).length;

      const latencySum = parsed.reduce((sum, m) => sum + m.latency, 0);

      const avgLatency = latencySum / totalRequests;

      const errorRate =
        totalRequests > 0
          ? ((errors / totalRequests) * 100).toFixed(2) + "%"
          : "0%";

      const numericErrorRate =
        totalRequests > 0 ? (errors / totalRequests) * 100 : 0;

      const health = calculateHealth(
        Math.round(avgLatency),
        numericErrorRate
      );

      results.push({
        endpoint,
        totalRequests,
        errors,
        avgLatency: Math.round(avgLatency),
        errorRate,
        health: health.score,
        status: health.status,
      });
    }

    
    const slowEndpoints = results.filter((item) => item.avgLatency > 200);

    
    const topEndpoints = [...results].sort(
      (a, b) => b.totalRequests - a.totalRequests
    );

    
    const problematicEndpoints = results.filter((item) => {
      const rate = parseFloat(item.errorRate);
      return rate > 5;
    });

    return {
      all: results,
      slow: slowEndpoints,
      top: topEndpoints,
      problematic: problematicEndpoints,
    };
  } catch (err: unknown) {
    console.warn("Aggregation failed:", err);
    return [];
  }
};