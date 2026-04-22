import { OptimizationInput, Decision } from "@/types/optimization.types";
import { EndpointAnalysis } from "@/types/optimization.types";

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