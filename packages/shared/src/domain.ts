export interface GatewayRequest {
  id: string;
  method: string;
  path: string;
  headers?: Record<string, string>;
  ip?: string;
  timestamp: number;
}

export interface GatewayResponse {
  statusCode: number;
  body?: any;
  headers?: Record<string, string>;
  latencyMs: number;
}

export interface Metrics {
  endpoint: string;
  latency: number;
  status: number;
  timestamp: number;
}

export interface Analysis {
  endpoint: string;
  avgLatency: number;
  errorRate: number;
  healthScore: number;
  signals: {
    isSlow: boolean;
    isErrorProne: boolean;
    isHighTraffic: boolean;
  };
}

export interface Suggestion {
  endpoint: string;
  issue: string;
  suggestionText: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  source: "RULE" | "AI";
}

export type ActionType = "ENABLE_CACHE" | "FLAG_ENDPOINT" | "INCREASE_RATE_LIMIT" | "NONE";

export interface Decision {
  action: ActionType;
  target: string;
  metadata?: Record<string, any>;
  reason?: string;
}

export type ActionStatus = "EXECUTED" | "SKIPPED_COOLDOWN" | "BLOCKED_CIRCUIT";

export interface Action {
  decision: Decision;
  status: ActionStatus;
  timestamp: number;
}

export interface ProviderResponse {
  insightText: string;
  confidence: number;
  providerName: string;
  latencyMs: number;
}

export interface Configuration {
  cacheEnabled: boolean;
  cacheTtl: number;
  rateLimit: number;
  isFlagged: boolean;
}
