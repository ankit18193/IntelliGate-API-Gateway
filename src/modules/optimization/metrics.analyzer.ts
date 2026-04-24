import { OptimizationInput } from "@/types/optimization.types";
import { runOptimization } from "@/models/optimization/optimizer.controller";
import { Metrics } from "@/models/metrics.model";
import { EndpointAnalysis } from "@/types/optimization.types";

const lastRun: Record<string, number> = {};

export const analyzeAndOptimize = (metrics: Metrics): void => {
  const { endpoint, latency, status } = metrics;

  const now = Date.now();

  
  if (lastRun[endpoint] && now - lastRun[endpoint] < 30000) {
    return;
  }

  let input: OptimizationInput | null = null;

 
  if (latency > 50) {
    input = {
      endpoint,
      issue: "High latency",
      ruleSuggestion: "Enable caching",
      aiSuggestion: "Use Redis caching",
      priority: "High",
    };
  }

  
  if (status >= 500) {
    input = {
      endpoint,
      issue: "High error rate",
      ruleSuggestion: "Flag endpoint",
      aiSuggestion: "Mark endpoint unstable",
      priority: "High",
    };
  }

  if (input) {
    console.log("Auto Optimization Triggered:", input);
    runOptimization(input);
    lastRun[endpoint] = now;
  }
};

export const analyzeMetricsBatch = (
  metricsList: Metrics[]
): EndpointAnalysis[] => {
  if (!metricsList.length) return [];

   
  const globalAvgLatency = metricsList.reduce((sum, m) => sum + m.latency, 0) / metricsList.length;
  const globalErrorRate = (metricsList.filter((m) => m.status >= 500).length / metricsList.length) * 100;
  
  const grouped: Record<string, Metrics[]> = {};

  for (const m of metricsList) {
    if (!grouped[m.endpoint]) {
      grouped[m.endpoint] = [];
    }
    grouped[m.endpoint].push(m);
  }

  const totalEndpoints = Object.keys(grouped).length;
  const avgRequestsPerEndpoint = metricsList.length / totalEndpoints;

  return Object.entries(grouped).map(([endpoint, list]) => {
    const totalRequests = list.length;
    const avgLatency = list.reduce((sum, m) => sum + m.latency, 0) / totalRequests;
    const errors = list.filter((m) => m.status >= 500).length;
    const errorRate = (errors / totalRequests) * 100;

    const healthScore = Math.max(0, 100 - avgLatency * 0.2 - errorRate * 2);

     
    const isSlow = avgLatency > Math.max(300, globalAvgLatency * 1.2);
     
    const isErrorProne = errorRate > Math.max(5, globalErrorRate * 1.5);
     
    const isHighTraffic = totalRequests > Math.max(50, avgRequestsPerEndpoint * 1.5);

    const signals = { slow: isSlow, errorProne: isErrorProne, highTraffic: isHighTraffic };

    let severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
    if (isErrorProne && isHighTraffic) {
      severity = "CRITICAL";
    } else if (isSlow && isHighTraffic) {
      severity = "HIGH";
    } else if (isErrorProne || isSlow) {
      severity = "MEDIUM";
    }

    return {
      endpoint,
      totalRequests,
      avgLatency: Math.round(avgLatency),
      errorRate: Math.round(errorRate),
      healthScore: Math.round(healthScore),
      isSlow,
      isErrorProne,
      isHighTraffic,
      severity,
      signals,
    };
  });
};
