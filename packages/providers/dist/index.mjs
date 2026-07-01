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
export {
  GeminiProviderAdapter,
  GroqProviderAdapter,
  HFProviderAdapter
};
