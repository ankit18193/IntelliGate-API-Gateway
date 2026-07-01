import { OptimizationInput, Decision } from "@/types/optimization.types";
import { EndpointAnalysis } from "@/types/optimization.types";
import { analyzeTrends } from "@/modules/optimization/trend.analyzer";

export const decideAction = (
  input: OptimizationInput
): Decision | null => {
  const { suggestion, endpoint } = input;

  if (!suggestion) return null;

  const normalized = suggestion.toLowerCase();

 
  if (
    /\berror\b/.test(normalized) ||
    /\berrors\b/.test(normalized) ||
    /\bunstable\b/.test(normalized)
  ) {
    return {
      action: "FLAG_ENDPOINT",
      target: endpoint,
    };
  }

  
  if (
    /\bcache\b/.test(normalized) ||
    /\bcaching\b/.test(normalized)
  ) {
    return {
      action: "ENABLE_CACHE",
      target: endpoint,
      metadata: { ttl: 60 },
    };
  }

 
  if (
    /\brate limit\b/.test(normalized) ||
    /\brate-limit\b/.test(normalized)
  ) {
    return {
      action: "INCREASE_RATE_LIMIT",
      target: endpoint,
      metadata: { increment: 20 },
    };
  }

  return null;
};



export const decideFromAnalysis = (
  analysis: EndpointAnalysis
): Decision | null => {
  const { endpoint, severity, signals } = analysis;

  
  if (severity === "CRITICAL") {
    return {
      action: "FLAG_ENDPOINT",
      target: endpoint,
    };
  }

  
  if (severity === "HIGH") {
    return {
      action: "ENABLE_CACHE",
      target: endpoint,
      metadata: { ttl: 60 },
    };
  }

  
  if (severity === "MEDIUM") {
    if (signals.highTraffic) {
      return {
        action: "INCREASE_RATE_LIMIT",
        target: endpoint,
        metadata: { increment: 20 },
      };
    }

    if (signals.slow) {
      return {
        action: "ENABLE_CACHE",
        target: endpoint,
        metadata: { ttl: 30 },
      };
    }
  }

 
  return null;
};

export const smartDecision = async (
  analysis: EndpointAnalysis
): Promise<Decision | null> => {
  const confidence =
    (analysis.signals.slow ? 1 : 0) +
    (analysis.signals.highTraffic ? 1 : 0) +
    (analysis.signals.errorProne ? 1 : 0);

  if (confidence < 1) {
    return null;  
  }

  
   const trend = await analyzeTrends(analysis.endpoint);

   
  if (!trend) return null;

  if (trend.errorTrend) {
    return {
      action: "FLAG_ENDPOINT",
      target: analysis.endpoint,
      reason: "Error rate trend is critical based on historical data.",  
    };
  }

  if (trend.slowTrend) {
    return {
      action: "ENABLE_CACHE",
      target: analysis.endpoint,
      metadata: { ttl: 60 },
      reason: "Endpoint is consistently slow based on historical trend.",  
    };
  }

  if (trend.trafficTrend) {
    return {
      action: "INCREASE_RATE_LIMIT",
      target: analysis.endpoint,
      metadata: { increment: 20 },
      reason: "High traffic detected repeatedly over multiple cycles.",   
    };
  }

  return null;
};