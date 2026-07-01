"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AuthenticationError: () => AuthenticationError,
  CircuitBreakerError: () => CircuitBreakerError,
  ConfigurationError: () => ConfigurationError,
  ExecutionError: () => ExecutionError,
  IntelliGateError: () => IntelliGateError,
  ProviderError: () => ProviderError,
  RateLimitError: () => RateLimitError,
  ValidationError: () => ValidationError
});
module.exports = __toCommonJS(index_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AuthenticationError,
  CircuitBreakerError,
  ConfigurationError,
  ExecutionError,
  IntelliGateError,
  ProviderError,
  RateLimitError,
  ValidationError
});
