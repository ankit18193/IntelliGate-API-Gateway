import { redis } from "@/lib/redis";
import { generateCacheKey } from "./cacheKey";
import { getTTL } from "./cacheTTL";



export const storeInCache = async (
  request: Request,
  response: Response
) => {
  if (!redis) return;

  if (request.method !== "GET") return;

  if (response.status !== 200) return;

  try {
    const key = await generateCacheKey(request);

    const cloned = response.clone(); 
    const data = await cloned.text();

    const url = new URL(request.url);
    const ttl = getTTL(url.pathname);

    await redis.set(key, data, "EX", ttl);

    console.log(`💾 Cached → ${key} (TTL: ${ttl}s)`);
  } catch (err) {
    console.warn("Cache write failed:", err);
  }
};