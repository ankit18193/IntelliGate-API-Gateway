import { Metrics, Analysis, Configuration, ProviderResponse, GatewayResponse, GatewayRequest } from "./domain";

export interface ILogger {
  info(msg: string, meta?: Record<string, any>): void;
  warn(msg: string, meta?: Record<string, any>): void;
  error(msg: string, error?: Error | unknown): void;
  debug(msg: string, meta?: Record<string, any>): void;
}

export interface IMetricsStore {
  save(metrics: Metrics[]): Promise<void>;
  getRecent(endpoint: string, limit: number): Promise<Metrics[]>;
}

export interface IConfigStore {
  getConfig(endpoint: string): Promise<Configuration>;
  updateConfig(endpoint: string, updates: Partial<Configuration>): Promise<void>;
}

export interface ICacheStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl: number): Promise<void>;
}

export interface IProvider {
  readonly id: string;
  readonly name: string;
  generateInsight(prompt: string, context: Analysis): Promise<ProviderResponse>;
}

export interface IEventEmitter {
  emit(event: string, payload: any): void;
  on(event: string, handler: (payload: any) => void): void;
}

export interface IClock {
  now(): number;
}

export interface IIdGenerator {
  generate(): string;
}
