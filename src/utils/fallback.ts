type FallbackMeta = {
  fallback: true;
  timestamp: string;
  endpoint: string;
  requestId?: string;
  source: "static" | "cache";
};

type SuccessFallback = {
  success: true;
  data: {
    message: string;
    cached?: boolean;
    payload?: unknown;
  };
  meta: FallbackMeta;
};

type ErrorFallback = {
  success: false;
  error: {
    message: string;
    code: number;
  };
  meta: FallbackMeta;
};

type FallbackResponse = SuccessFallback | ErrorFallback;


export const getFallbackResponse = (
  endpoint: string,
  requestId?: string,
  cachedData?: unknown
): FallbackResponse => {
  const baseMeta: FallbackMeta = {
    fallback: true,
    timestamp: new Date().toISOString(),
    endpoint,
    requestId,
    source: cachedData ? "cache" : "static",
  };

  
  if (cachedData !== undefined) {
    return {
      success: true,
      data: {
        message: "Served from fallback cache ⚠️",
        cached: true,
        payload: cachedData,
      },
      meta: baseMeta,
    };
  }

  
  if (endpoint === "/api/gateway/public") {
    return {
      success: true,
      data: {
        message: "Public service temporarily degraded ⚠️",
      },
      meta: baseMeta,
    };
  }

  
  if (endpoint === "/api/gateway/private") {
    return {
      success: false,
      error: {
        message: "Private service unavailable. Please retry later.",
        code: 503,
      },
      meta: baseMeta,
    };
  }

 
  return {
    success: false,
    error: {
      message: "Service temporarily unavailable",
      code: 503,
    },
    meta: baseMeta,
  };
};