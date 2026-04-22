import { GatewayRequest } from "@/types/request.types";
import { logger } from "@/lib/logger";

export const loggerMiddleware = async (gatewayReq: GatewayRequest) => {
  const { request, context } = gatewayReq;

  
  if (!context.requestId) {
    context.requestId = crypto.randomUUID();
  }

  
  if (!context.startTime) {
    context.startTime = Date.now();
  }

  const method = request.method;
  const endpoint = new URL(request.url).pathname;

  
  logger.info({
    requestId: context.requestId,
    event: "request_in",
    endpoint,
    method,
    timestamp: new Date().toISOString(),
  });
};