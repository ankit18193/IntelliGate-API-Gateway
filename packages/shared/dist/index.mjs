// src/errors.ts
var IntelliGateError = class extends Error {
  status;
  requestId;
  constructor(message, status, requestId) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.requestId = requestId;
    Object.setPrototypeOf(this, new.target.prototype);
  }
};
var ValidationError = class extends IntelliGateError {
  constructor(message, requestId) {
    super(message, 400, requestId);
  }
};
var AuthenticationError = class extends IntelliGateError {
  constructor(message, requestId) {
    super(message, 401, requestId);
  }
};
var RateLimitError = class extends IntelliGateError {
  retryAfter;
  constructor(message, retryAfter, requestId) {
    super(message, 429, requestId);
    this.retryAfter = retryAfter;
  }
};
var ProviderError = class extends IntelliGateError {
  constructor(message, status, requestId) {
    super(message, status || 502, requestId);
  }
};
var ConfigurationError = class extends IntelliGateError {
  constructor(message) {
    super(message, 500);
  }
};
var ExecutionError = class extends IntelliGateError {
  constructor(message) {
    super(message, 500);
  }
};
var CircuitBreakerError = class extends ExecutionError {
  constructor(message) {
    super(`Circuit Breaker Open: ${message}`);
  }
};
export {
  AuthenticationError,
  CircuitBreakerError,
  ConfigurationError,
  ExecutionError,
  IntelliGateError,
  ProviderError,
  RateLimitError,
  ValidationError
};
