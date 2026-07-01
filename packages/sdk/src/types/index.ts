export interface ClientOptions {
  apiKey?: string;
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface RequestOptions {
  timeout?: number;
  maxRetries?: number;
  headers?: Record<string, string>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    timestamp: string;
  };
  error?: {
    message: string;
    code: number;
  };
}

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface Metrics {
  endpoint: string;
  latency: number;
  status: number;
  timestamp: number;
}

export type ActionType = "ENABLE_CACHE" | "FLAG_ENDPOINT" | "INCREASE_RATE_LIMIT" | "NONE";

export interface Decision {
  action: ActionType;
  target: string;
  metadata?: Record<string, any>;
  reason?: string;
}
