interface ClientOptions {
    apiKey?: string;
    baseURL?: string;
    timeout?: number;
    maxRetries?: number;
}
interface RequestOptions {
    timeout?: number;
    maxRetries?: number;
    headers?: Record<string, string>;
}
interface ApiResponse<T> {
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
interface User {
    id: string;
    email: string;
    role: string;
}
interface Metrics {
    endpoint: string;
    latency: number;
    status: number;
    timestamp: number;
}
type ActionType = "ENABLE_CACHE" | "FLAG_ENDPOINT" | "INCREASE_RATE_LIMIT" | "NONE";
interface Decision {
    action: ActionType;
    target: string;
    metadata?: Record<string, any>;
    reason?: string;
}

declare class IntelliGateError extends Error {
    constructor(message: string);
}
declare class TransportError extends IntelliGateError {
    readonly cause?: unknown | undefined;
    constructor(message: string, cause?: unknown | undefined);
}
declare class HTTPError extends IntelliGateError {
    readonly status: number;
    readonly responseBody?: any | undefined;
    constructor(status: number, message: string, responseBody?: any | undefined);
}
declare class SDKError extends IntelliGateError {
    constructor(message: string);
}

declare class Auth {
    private readonly apiKey?;
    constructor(apiKey?: string | undefined);
    getHeaders(): Record<string, string>;
}

declare class Transport {
    private readonly baseURL;
    private readonly auth;
    private readonly defaultTimeout;
    private readonly defaultMaxRetries;
    constructor(baseURL: string, auth: Auth, defaultTimeout: number, defaultMaxRetries: number);
    fetch<T>(path: string, options: {
        method: string;
        body?: any;
    }, reqOpts?: RequestOptions): Promise<T>;
}

declare abstract class APIResource {
    protected readonly transport: Transport;
    constructor(transport: Transport);
    protected get<T>(path: string, options?: RequestOptions): Promise<T>;
    protected post<T>(path: string, body: any, options?: RequestOptions): Promise<T>;
    protected put<T>(path: string, body: any, options?: RequestOptions): Promise<T>;
    protected delete<T>(path: string, options?: RequestOptions): Promise<T>;
}

declare class GatewayResource extends APIResource {
    /**
     * Access the public gateway proxy endpoint.
     */
    public(options?: RequestOptions): Promise<ApiResponse<{
        message: string;
    }>>;
    /**
     * Access the private gateway proxy endpoint.
     * Requires a valid API Key.
     */
    private(options?: RequestOptions): Promise<ApiResponse<{
        message: string;
        user: User;
    }>>;
}

declare class MetricsResource extends APIResource {
    /**
     * Retrieve collected metrics.
     */
    list(options?: RequestOptions): Promise<ApiResponse<Metrics[]>>;
}

declare class DecisionResource extends APIResource {
    /**
     * Retrieve automation decisions made by the gateway.
     */
    list(options?: RequestOptions): Promise<ApiResponse<Decision[]>>;
}

interface OptimizeRunPayload {
    endpoint: string;
    issue: string;
}
declare class OptimizeResource extends APIResource {
    /**
     * Manually trigger the optimization engine.
     */
    run(payload: OptimizeRunPayload, options?: RequestOptions): Promise<ApiResponse<{
        decision: Decision;
    }>>;
}

interface AuthPayload {
    email: string;
    password?: string;
}
interface AuthResponse {
    user: User;
    token: string;
}
declare class AuthResource extends APIResource {
    /**
     * Register a new user and retrieve an API key (token).
     */
    register(payload: AuthPayload, options?: RequestOptions): Promise<ApiResponse<AuthResponse>>;
    /**
     * Authenticate an existing user and retrieve their API key (token).
     */
    login(payload: AuthPayload, options?: RequestOptions): Promise<ApiResponse<AuthResponse>>;
}

declare class IntelliGate {
    readonly gateway: GatewayResource;
    readonly metrics: MetricsResource;
    readonly decisions: DecisionResource;
    readonly optimize: OptimizeResource;
    readonly auth: AuthResource;
    private transport;
    constructor(options?: ClientOptions);
}

export { APIResource, type ActionType, type ApiResponse, type AuthPayload, AuthResource, type AuthResponse, type ClientOptions, type Decision, DecisionResource, GatewayResource, HTTPError, IntelliGate, IntelliGateError, type Metrics, MetricsResource, OptimizeResource, type OptimizeRunPayload, type RequestOptions, SDKError, TransportError, type User };
