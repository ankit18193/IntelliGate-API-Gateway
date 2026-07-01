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
  GeminiProviderAdapter: () => GeminiProviderAdapter,
  GroqProviderAdapter: () => GroqProviderAdapter,
  HFProviderAdapter: () => HFProviderAdapter
});
module.exports = __toCommonJS(index_exports);

// src/GroqProviderAdapter.ts
var GroqProviderAdapter = class {
  constructor(legacyProviderFn) {
    this.legacyProviderFn = legacyProviderFn;
  }
  legacyProviderFn;
  id = "groq";
  name = "Groq";
  async generateInsight(prompt, context) {
    const start = Date.now();
    const input = {
      endpoint: context.endpoint,
      avgLatency: context.avgLatency,
      errorRate: context.errorRate,
      requests: context.signals.isHighTraffic ? 1e3 : 100,
      cacheHitRate: 0
    };
    const result = await this.legacyProviderFn(input);
    const latencyMs = Date.now() - start;
    if (result && result.length > 0) {
      return {
        insightText: result[0].suggestion,
        confidence: 0.8,
        providerName: this.name,
        latencyMs
      };
    }
    throw new Error("Groq generated no insight");
  }
};

// src/GeminiProviderAdapter.ts
var GeminiProviderAdapter = class {
  constructor(legacyProviderFn) {
    this.legacyProviderFn = legacyProviderFn;
  }
  legacyProviderFn;
  id = "gemini";
  name = "Gemini";
  async generateInsight(prompt, context) {
    const start = Date.now();
    const input = {
      endpoint: context.endpoint,
      avgLatency: context.avgLatency,
      errorRate: context.errorRate,
      requests: context.signals.isHighTraffic ? 1e3 : 100,
      cacheHitRate: 0
    };
    const result = await this.legacyProviderFn(input);
    const latencyMs = Date.now() - start;
    if (result && result.length > 0) {
      return {
        insightText: result[0].suggestion,
        confidence: 0.8,
        providerName: this.name,
        latencyMs
      };
    }
    throw new Error("Gemini generated no insight");
  }
};

// src/HFProviderAdapter.ts
var HFProviderAdapter = class {
  constructor(legacyProviderFn) {
    this.legacyProviderFn = legacyProviderFn;
  }
  legacyProviderFn;
  id = "huggingface";
  name = "HuggingFace";
  async generateInsight(prompt, context) {
    const start = Date.now();
    const input = {
      endpoint: context.endpoint,
      avgLatency: context.avgLatency,
      errorRate: context.errorRate,
      requests: context.signals.isHighTraffic ? 1e3 : 100,
      cacheHitRate: 0
    };
    const result = await this.legacyProviderFn(input);
    const latencyMs = Date.now() - start;
    if (result && result.length > 0) {
      return {
        insightText: result[0].suggestion,
        confidence: 0.8,
        providerName: this.name,
        latencyMs
      };
    }
    throw new Error("HuggingFace generated no insight");
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GeminiProviderAdapter,
  GroqProviderAdapter,
  HFProviderAdapter
});
