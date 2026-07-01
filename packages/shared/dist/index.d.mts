interface GatewayRequest {
    id: string;
    method: string;
    path: string;
    headers?: Record<string, string>;
    ip?: string;
    timestamp: number;
}
interface GatewayResponse {
    statusCode: number;
    body?: any;
    headers?: Record<string, string>;
    latencyMs: number;
}
interface Metrics {
    endpoint: string;
    latency: number;
    status: number;
    timestamp: number;
}
interface Analysis {
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
interface Suggestion {
    endpoint: string;
    issue: string;
    suggestionText: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    source: "RULE" | "AI";
}
type ActionType = "ENABLE_CACHE" | "FLAG_ENDPOINT" | "INCREASE_RATE_LIMIT" | "NONE";
interface Decision {
    action: ActionType;
    target: string;
    metadata?: Record<string, any>;
    reason?: string;
}
type ActionStatus = "EXECUTED" | "SKIPPED_COOLDOWN" | "BLOCKED_CIRCUIT";
interface Action {
    decision: Decision;
    status: ActionStatus;
    timestamp: number;
}
interface ProviderResponse {
    insightText: string;
    confidence: number;
    providerName: string;
    latencyMs: number;
}
interface Configuration {
    cacheEnabled: boolean;
    cacheTtl: number;
    rateLimit: number;
    isFlagged: boolean;
}

interface ILogger {
    info(msg: string, meta?: Record<string, any>): void;
    warn(msg: string, meta?: Record<string, any>): void;
    error(msg: string, error?: Error | unknown): void;
    debug(msg: string, meta?: Record<string, any>): void;
}
interface IMetricsStore {
    save(metrics: Metrics[]): Promise<void>;
    getRecent(endpoint: string, limit: number): Promise<Metrics[]>;
}
interface IConfigStore {
    getConfig(endpoint: string): Promise<Configuration>;
    updateConfig(endpoint: string, updates: Partial<Configuration>): Promise<void>;
}
interface ICacheStore {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttl: number): Promise<void>;
}
interface IProvider {
    readonly id: string;
    readonly name: string;
    generateInsight(prompt: string, context: Analysis): Promise<ProviderResponse>;
}
interface IEventEmitter {
    emit(event: string, payload: any): void;
    on(event: string, handler: (payload: any) => void): void;
}
interface IClock {
    now(): number;
}
interface IIdGenerator {
    generate(): string;
}

declare class IntelliGateError extends Error {
    readonly status?: number;
    readonly requestId?: string;
    constructor(message: string, status?: number, requestId?: string);
}
declare class ValidationError extends IntelliGateError {
    constructor(message: string, requestId?: string);
}
declare class AuthenticationError extends IntelliGateError {
    constructor(message: string, requestId?: string);
}
declare class RateLimitError extends IntelliGateError {
    readonly retryAfter: number;
    constructor(message: string, retryAfter: number, requestId?: string);
}
declare class ProviderError extends IntelliGateError {
    constructor(message: string, status?: number, requestId?: string);
}
declare class ConfigurationError extends IntelliGateError {
    constructor(message: string);
}
declare class ExecutionError extends IntelliGateError {
    constructor(message: string);
}
declare class CircuitBreakerError extends ExecutionError {
    constructor(message: string);
}

export { type Action, type ActionStatus, type ActionType, type Analysis, AuthenticationError, CircuitBreakerError, type Configuration, ConfigurationError, type Decision, ExecutionError, type GatewayRequest, type GatewayResponse, type ICacheStore, type IClock, type IConfigStore, type IEventEmitter, type IIdGenerator, type ILogger, type IMetricsStore, type IProvider, IntelliGateError, type Metrics, ProviderError, type ProviderResponse, RateLimitError, type Suggestion, ValidationError };
