import { NextResponse } from "next/server";
import { GatewayRequest } from "@/types/request.types";
import { redis } from "@/lib/redis";
import { generateCacheKey } from "@/utils/cacheKey";
import { isCacheEnabled } from "@/config/optimization.config";

export const cacheMiddleware = async (gatewayReq: GatewayRequest) => {
  const { request, context } = gatewayReq;

  // 🔹 Only cache GET requests
  if (request.method !== "GET") return null;

  try {
    const url = new URL(request.url);
    const endpoint = url.pathname;

    const shouldCache = await isCacheEnabled(endpoint);
    if (!shouldCache) return null;

    // 🔹 Ensure Redis is ready
    if (!redis || redis.status !== "ready") {
      return null;
    }

    const key = await generateCacheKey(request);
    const cachedData = await redis.get(key);

    if (cachedData) {
      return new NextResponse(cachedData, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-Cache": "HIT",
          "X-Cache-Key": key,
          "X-Request-Id": context.requestId,
        },
      });
    }

    return null;
  } catch {
   
    return null;
  }
};