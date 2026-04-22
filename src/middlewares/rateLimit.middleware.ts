import { GatewayRequest } from "@/types/request.types";
import { redis } from "@/lib/redis";
import { AppError } from "@/utils/AppError";
import { getRateLimit, isFlagged } from "@/config/optimization.config";

const WINDOW_SIZE = 60; 

export const rateLimitMiddleware = async (
  gatewayReq: GatewayRequest
): Promise<void> => {
  const { request, context } = gatewayReq;

  const endpoint = new URL(request.url).pathname;

  
  if (await isFlagged(endpoint)) {
    throw new AppError("Endpoint temporarily unstable", 503);
  }

  const userId = context.user?.id;

  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  const identifier = userId || ip;

  const key = `rate_limit:${endpoint}:${identifier}`;

 
  const MAX_REQUESTS = await getRateLimit(endpoint);

  
  if (!redis) return;

  try {
    const current = await redis.incr(key);

    console.log(`Rate count (${endpoint}):`, current);

    if (current === 1) {
      await redis.expire(key, WINDOW_SIZE);
    }

    if (current > MAX_REQUESTS) {
      throw new AppError("Too many requests", 429);
    }
  } catch (err: unknown) {
    if (err instanceof AppError) {
      throw err;
    }

    console.warn("Rate limiter failed:", err);
  }
};