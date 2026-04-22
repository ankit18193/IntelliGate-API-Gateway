import Redis from "ioredis";
import { env } from "@/config/env";

let redis: Redis | null = null;

try {
  redis = new Redis({
    host: env.redisHost,
    port: env.redisPort,

    lazyConnect: true,
    maxRetriesPerRequest: 1,

    retryStrategy: () => null, 
  });

  redis.connect().catch(() => {
    console.warn(" Redis not available, continuing without it");
  });

  redis.on("connect", () => {
    console.log("Redis Connected");
  });

  redis.on("error", () => {
    
  });

} catch (error) {
  console.warn("Redis initialization failed");
}

export { redis };