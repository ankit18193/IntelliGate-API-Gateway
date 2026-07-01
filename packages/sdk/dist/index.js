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
  APIResource: () => APIResource,
  AuthResource: () => AuthResource,
  DecisionResource: () => DecisionResource,
  GatewayResource: () => GatewayResource,
  HTTPError: () => HTTPError,
  IntelliGate: () => IntelliGate,
  IntelliGateError: () => IntelliGateError,
  MetricsResource: () => MetricsResource,
  OptimizeResource: () => OptimizeResource,
  SDKError: () => SDKError,
  TransportError: () => TransportError
});
module.exports = __toCommonJS(index_exports);

// src/errors/index.ts
var IntelliGateError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "IntelliGateError";
  }
};
var TransportError = class extends IntelliGateError {
  constructor(message, cause) {
    super(message);
    this.cause = cause;
    this.name = "TransportError";
  }
  cause;
};
var HTTPError = class extends IntelliGateError {
  constructor(status, message, responseBody) {
    super(`HTTP ${status}: ${message}`);
    this.status = status;
    this.responseBody = responseBody;
    this.name = "HTTPError";
  }
  status;
  responseBody;
};
var SDKError = class extends IntelliGateError {
  constructor(message) {
    super(message);
    this.name = "SDKError";
  }
};

// src/resources/APIResource.ts
var APIResource = class {
  constructor(transport) {
    this.transport = transport;
  }
  transport;
  get(path, options) {
    return this.transport.fetch(path, { method: "GET" }, options);
  }
  post(path, body, options) {
    return this.transport.fetch(path, { method: "POST", body }, options);
  }
  put(path, body, options) {
    return this.transport.fetch(path, { method: "PUT", body }, options);
  }
  delete(path, options) {
    return this.transport.fetch(path, { method: "DELETE" }, options);
  }
};

// src/resources/GatewayResource.ts
var GatewayResource = class extends APIResource {
  /**
   * Access the public gateway proxy endpoint.
   */
  async public(options) {
    return this.get("/gateway/public", options);
  }
  /**
   * Access the private gateway proxy endpoint.
   * Requires a valid API Key.
   */
  async private(options) {
    return this.get("/gateway/private", options);
  }
};

// src/resources/MetricsResource.ts
var MetricsResource = class extends APIResource {
  /**
   * Retrieve collected metrics.
   */
  async list(options) {
    return this.get("/metrics", options);
  }
};

// src/resources/DecisionResource.ts
var DecisionResource = class extends APIResource {
  /**
   * Retrieve automation decisions made by the gateway.
   */
  async list(options) {
    return this.get("/decisions", options);
  }
};

// src/resources/OptimizeResource.ts
var OptimizeResource = class extends APIResource {
  /**
   * Manually trigger the optimization engine.
   */
  async run(payload, options) {
    return this.post("/optimize/run", payload, options);
  }
};

// src/resources/AuthResource.ts
var AuthResource = class extends APIResource {
  /**
   * Register a new user and retrieve an API key (token).
   */
  async register(payload, options) {
    return this.post("/auth/register", payload, options);
  }
  /**
   * Authenticate an existing user and retrieve their API key (token).
   */
  async login(payload, options) {
    return this.post("/auth/login", payload, options);
  }
};

// src/config/index.ts
var DEFAULT_CONFIG = {
  baseURL: "https://api.intelligate.dev/v1",
  timeout: 1e4,
  maxRetries: 2
};
var ConfigResolver = class {
  static resolve(options) {
    const envApiKey = typeof process !== "undefined" ? process.env?.INTELLIGATE_API_KEY : void 0;
    const envBaseURL = typeof process !== "undefined" ? process.env?.INTELLIGATE_BASE_URL : void 0;
    return {
      apiKey: options?.apiKey || envApiKey || "",
      baseURL: options?.baseURL || envBaseURL || DEFAULT_CONFIG.baseURL,
      timeout: options?.timeout ?? DEFAULT_CONFIG.timeout,
      maxRetries: options?.maxRetries ?? DEFAULT_CONFIG.maxRetries
    };
  }
};

// src/auth/index.ts
var Auth = class {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }
  apiKey;
  getHeaders() {
    if (!this.apiKey || this.apiKey.trim() === "") {
      return {};
    }
    return {
      "Authorization": `Bearer ${this.apiKey}`
    };
  }
};

// src/serializer/index.ts
var Serializer = class {
  static stringify(data) {
    return JSON.stringify(data, (key, value) => value === void 0 ? void 0 : value);
  }
  static parse(json) {
    try {
      return JSON.parse(json);
    } catch (error) {
      throw new Error(`Failed to parse response: ${error}`);
    }
  }
};

// src/transport/index.ts
var Transport = class {
  constructor(baseURL, auth, defaultTimeout, defaultMaxRetries) {
    this.baseURL = baseURL;
    this.auth = auth;
    this.defaultTimeout = defaultTimeout;
    this.defaultMaxRetries = defaultMaxRetries;
  }
  baseURL;
  auth;
  defaultTimeout;
  defaultMaxRetries;
  async fetch(path, options, reqOpts) {
    const url = `${this.baseURL}${path}`;
    const timeout = reqOpts?.timeout ?? this.defaultTimeout;
    const maxRetries = reqOpts?.maxRetries ?? this.defaultMaxRetries;
    const headers = {
      ...this.auth.getHeaders(),
      "Content-Type": "application/json",
      ...reqOpts?.headers
    };
    let attempt = 0;
    while (attempt <= maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        const response = await fetch(url, {
          method: options.method,
          headers,
          body: options.body ? Serializer.stringify(options.body) : void 0,
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        const text = await response.text();
        let data = text;
        if (text) {
          try {
            data = Serializer.parse(text);
          } catch {
          }
        }
        if (!response.ok) {
          throw new HTTPError(response.status, response.statusText, data);
        }
        return data;
      } catch (error) {
        attempt++;
        if (error instanceof HTTPError && error.status < 500) {
          throw error;
        }
        if (attempt > maxRetries) {
          if (error instanceof HTTPError) throw error;
          throw new TransportError(`Failed to fetch ${url} after ${maxRetries} retries`, error);
        }
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 100));
      }
    }
    throw new TransportError("Unreachable");
  }
};

// src/client/IntelliGate.ts
var IntelliGate = class {
  gateway;
  metrics;
  decisions;
  optimize;
  auth;
  transport;
  constructor(options) {
    const config = ConfigResolver.resolve(options);
    const auth = new Auth(config.apiKey);
    this.transport = new Transport(config.baseURL, auth, config.timeout, config.maxRetries);
    this.gateway = new GatewayResource(this.transport);
    this.metrics = new MetricsResource(this.transport);
    this.decisions = new DecisionResource(this.transport);
    this.optimize = new OptimizeResource(this.transport);
    this.auth = new AuthResource(this.transport);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  APIResource,
  AuthResource,
  DecisionResource,
  GatewayResource,
  HTTPError,
  IntelliGate,
  IntelliGateError,
  MetricsResource,
  OptimizeResource,
  SDKError,
  TransportError
});
