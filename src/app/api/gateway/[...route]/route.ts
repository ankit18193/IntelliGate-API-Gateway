import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { logger } from "@/lib/logger";
import { redis } from "@/lib/redis";
import { randomUUID } from "crypto";

import { GatewayRequest } from "@/types/request.types";
import { loggerMiddleware } from "@/middlewares/logger.middleware";
import { errorMiddleware } from "@/middlewares/error.middleware";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { rateLimitMiddleware } from "@/middlewares/rateLimit.middleware";
import { cacheMiddleware } from "@/middlewares/cache.middleware";

import { isCacheEnabled, getTTL } from "@/config/optimization.config";
import { generateCacheKey } from "@/utils/cacheKey";

import { collectMetrics } from "@/utils/metricsCollector";
import { storeMetrics } from "@/utils/metricsStore";
import { metricsQueue } from "@/queues/metrics.queue";
import { successResponse } from "@/utils/apiResponse";
import { retry } from "@/utils/retry";
import { getFallbackResponse } from "@/utils/fallback";
import {
  checkCircuit,
  recordFailure,
  recordSuccess,
} from "@/utils/circuitBreaker";
import {
  recordRequest,
  recordFailureEvent,
  shouldBlockEndpoint,
} from "@/utils/failureTracker";

const publicRoutes = [
  "/api/gateway/public",
  "/api/docs"
];

/**
 * @swagger
 * /api/gateway/public:
 *   get:
 *     summary: Public endpoint
 *     description: Returns a public response from IntelliGate
 *     tags:
 *       - Gateway
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - success
 *                 - data
 *                 - meta
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   required:
 *                     - message
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Public route ✅
 *                 meta:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       example: 2026-04-21T18:59:59.823Z
 *
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Too many requests
 *                     code:
 *                       type: number
 *                       example: 429
 *
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Internal Server Error
 *                     code:
 *                       type: number
 *                       example: 500
 */

/**
 * @swagger
 * /api/gateway/private:
 *   get:
 *     summary: Private endpoint
 *     description: Requires JWT authentication
 *     tags:
 *       - Gateway
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success (Authenticated)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - success
 *                 - data
 *                 - meta
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   required:
 *                     - message
 *                     - user
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Private route 🔐
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: 123
 *                         email:
 *                           type: string
 *                           example: test@example.com
 *                 meta:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       example: 2026-04-21T18:59:59.823Z
 *
 *       401:
 *         description: Unauthorized (missing token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Authorization header missing
 *                     code:
 *                       type: number
 *                       example: 401
 *
 *       403:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Invalid or expired token
 *                     code:
 *                       type: number
 *                       example: 403
 */

export async function GET(req: NextRequest) {
  const gatewayReq: GatewayRequest = {
    request: req,
    context: {
      requestId: randomUUID(),
      startTime: Date.now(),
    },
  };

  const endpoint = req.nextUrl.pathname;
  recordRequest(endpoint);

  const isTestEnv = process.env.NODE_ENV === "test";

  try {
    if (!isTestEnv) {
      await rateLimitMiddleware(gatewayReq);
    }

    if (!isTestEnv) {
      if (!checkCircuit(endpoint)) {
        logger.warn({
          event: "circuit_block",
          endpoint,
          message: "Circuit open - blocking request",
          timestamp: new Date().toISOString(),
        });

        return NextResponse.json(
          getFallbackResponse(endpoint, gatewayReq.context.requestId),
          { status: 503 },
        );
      }

      if (shouldBlockEndpoint(endpoint)) {
        logger.warn({
          event: "failure_block",
          endpoint,
          message: "Failure threshold exceeded",
          timestamp: new Date().toISOString(),
        });

        return NextResponse.json(
          getFallbackResponse(endpoint, gatewayReq.context.requestId),
          { status: 503 },
        );
      }
    }

    
    const cachedResponse = await cacheMiddleware(gatewayReq);

    if (cachedResponse) {
      const metrics = collectMetrics(
        req,
        cachedResponse,
        gatewayReq.context.startTime,
      );

      await retry(() => storeMetrics(metrics));
      await retry(() => metricsQueue.add("auto-optimize", { metrics }));

       
      recordSuccess(endpoint);

      logger.info({
        requestId: gatewayReq.context.requestId,
        event: "cache_hit",
        endpoint,
        latency: metrics.latency,
        timestamp: new Date().toISOString(),
      });

      return cachedResponse;
    }

     
    logger.info({
      requestId: gatewayReq.context.requestId,
      event: "cache_miss",
      endpoint,
      timestamp: new Date().toISOString(),
    });

    await loggerMiddleware(gatewayReq);

    if (!publicRoutes.includes(endpoint)) {
      await authMiddleware(gatewayReq);
    }

    console.log("Before DB");
    await retry(() => connectDB());
    console.log("After DB");

    let response: NextResponse;

    if (endpoint === "/api/gateway/public") {
      response = NextResponse.json(
        successResponse({ message: "Public route" }),
      );
    } else if (endpoint === "/api/gateway/private") {
      response = NextResponse.json(
        successResponse({
          message: "Private route",
          user: gatewayReq.context.user,
        }),
      );
    } else {
      response = NextResponse.json(
        { error: "Route not found" },
        { status: 404 },
      );
    }

    
    recordSuccess(endpoint);

    const backgroundResponse = response.clone();

     
    void (async () => {
      try {
        const metrics = collectMetrics(
          req,
          backgroundResponse,
          gatewayReq.context.startTime,
        );

        await retry(() => storeMetrics(metrics));
        await retry(() => metricsQueue.add("auto-optimize", { metrics }));

        logger.info({
          requestId: gatewayReq.context.requestId,
          event: "request_out",
          endpoint,
          status: response.status,
          latency: metrics.latency,
          timestamp: new Date().toISOString(),
        });

         
        const shouldCache = await isCacheEnabled(endpoint);
        const redisClient = redis;

        if (shouldCache && redisClient && req.method === "GET") {
          try {
            const key = await generateCacheKey(req);
            const body = await backgroundResponse.text();
            const ttl = await getTTL(endpoint);

            await retry(() => redisClient.set(key, body, "EX", ttl));
          } catch {
            logger.error({
              event: "error",
              endpoint,
              message: "Cache write failed",
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch {
        recordFailure(endpoint);
        recordFailureEvent(endpoint);

        logger.error({
          event: "error",
          endpoint,
          message: "Background task failed",
          timestamp: new Date().toISOString(),
        });
      }
    })();

    return response;
  } catch (err: unknown) {
    recordFailure(endpoint);
    recordFailureEvent(endpoint);

    
    if (typeof err === "object" && err !== null && "statusCode" in err) {
      const error = err as { message: string; statusCode: number };

      return NextResponse.json(
        {
          success: false,
          error: {
            message: error.message,
            code: error.statusCode,
          },
        },
        { status: error.statusCode },
      );
    }

    if (typeof err === "object" && err !== null && "status" in err) {
      const error = err as { message?: string; status: number };

      return NextResponse.json(
        {
          success: false,
          error: {
            message: error.message || "Request failed",
            code: error.status,
          },
        },
        { status: error.status },
      );
    }

     
    return NextResponse.json(
      getFallbackResponse(endpoint, gatewayReq.context.requestId),
      { status: 503 },
    );
  }
}
