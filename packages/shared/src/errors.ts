export class IntelliGateError extends Error {
  public readonly status?: number;
  public readonly requestId?: string;

  constructor(message: string, status?: number, requestId?: string) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.requestId = requestId;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends IntelliGateError {
  constructor(message: string, requestId?: string) {
    super(message, 400, requestId);
  }
}

export class AuthenticationError extends IntelliGateError {
  constructor(message: string, requestId?: string) {
    super(message, 401, requestId);
  }
}

export class RateLimitError extends IntelliGateError {
  public readonly retryAfter: number;
  constructor(message: string, retryAfter: number, requestId?: string) {
    super(message, 429, requestId);
    this.retryAfter = retryAfter;
  }
}

export class ProviderError extends IntelliGateError {
  constructor(message: string, status?: number, requestId?: string) {
    super(message, status || 502, requestId);
  }
}

export class ConfigurationError extends IntelliGateError {
  constructor(message: string) {
    super(message, 500);
  }
}

export class ExecutionError extends IntelliGateError {
  constructor(message: string) {
    super(message, 500);
  }
}

export class CircuitBreakerError extends ExecutionError {
  constructor(message: string) {
    super(`Circuit Breaker Open: ${message}`);
  }
}
