export type OptimizationInput = {
  endpoint: string;
  issue: string;
  suggestion?: string;
  ruleSuggestion?: string;
  aiSuggestion?: string;
  priority?: "Low" | "Medium" | "High";
};

export type DecisionAction =
  | "ENABLE_CACHE"
  | "INCREASE_RATE_LIMIT"
  | "FLAG_ENDPOINT";

export type Decision = {
  action: DecisionAction;
  target: string;
  metadata?: {
    ttl?: number;
    increment?: number;
  };
};

export type AuditLog = {
  action: DecisionAction;
  endpoint: string;
  reason: string;
  time: string;
};

export type EndpointAnalysis = {
  endpoint: string;
  totalRequests: number;
  avgLatency: number;
  errorRate: number;
  healthScore: number;

  
  isSlow: boolean;
  isErrorProne: boolean;
  isHighTraffic: boolean;


  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

  signals: {
    slow: boolean;
    errorProne: boolean;
    highTraffic: boolean;
  };
};