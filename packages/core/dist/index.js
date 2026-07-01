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
  DecisionEngine: () => DecisionEngine,
  Executor: () => Executor,
  FallbackManager: () => FallbackManager,
  IntelliGateEngine: () => IntelliGateEngine,
  MergeEngine: () => MergeEngine,
  MetricsAnalyzer: () => MetricsAnalyzer,
  ProviderRouter: () => ProviderRouter,
  RuleEngine: () => RuleEngine,
  ScoringEngine: () => ScoringEngine,
  TrendAnalyzer: () => TrendAnalyzer
});
module.exports = __toCommonJS(index_exports);

// src/analysis/MetricsAnalyzer.ts
var MetricsAnalyzer = class {
  constructor(metricsStore, logger) {
    this.metricsStore = metricsStore;
    this.logger = logger;
  }
  metricsStore;
  logger;
  async analyzeEndpoint(endpoint, limit = 100) {
    try {
      const history = await this.metricsStore.getRecent(endpoint, limit);
      if (!history || history.length === 0) {
        return null;
      }
      const totalRequests = history.length;
      const avgLatency = history.reduce((sum, m) => sum + m.latency, 0) / totalRequests;
      const errors = history.filter((m) => m.status >= 500).length;
      const errorRate = errors / totalRequests * 100;
      const healthScore = Math.max(0, 100 - avgLatency * 0.2 - errorRate * 2);
      const isSlow = avgLatency > 300;
      const isErrorProne = errorRate > 5;
      const isHighTraffic = totalRequests > 50;
      const analysis = {
        endpoint,
        avgLatency: Math.round(avgLatency),
        errorRate: Math.round(errorRate),
        healthScore: Math.round(healthScore),
        signals: {
          isSlow,
          isErrorProne,
          isHighTraffic
        }
      };
      this.logger.debug(`Analysis complete for ${endpoint}`, { healthScore });
      return analysis;
    } catch (error) {
      this.logger.error(`Failed to analyze metrics for ${endpoint}`, error);
      throw error;
    }
  }
};

// src/analysis/ScoringEngine.ts
var PRIORITY_WEIGHTS = {
  CRITICAL: 100,
  HIGH: 80,
  MEDIUM: 60,
  LOW: 40
};
var SOURCE_WEIGHTS = {
  RULE: 5,
  AI: 3
};
var KEYWORD_BOOSTS = {
  error: 10,
  latency: 8,
  traffic: 5,
  cache: 4,
  retry: 6,
  validation: 6
};
var ScoringEngine = class {
  scoreSuggestions(suggestions) {
    return suggestions.map((s) => {
      let score = 0;
      const combinedText = `${s.issue} ${s.suggestionText}`.toLowerCase().trim();
      score += PRIORITY_WEIGHTS[s.priority] || 0;
      score += SOURCE_WEIGHTS[s.source] || 0;
      const words = new Set(combinedText.split(/\s+/));
      for (const keyword in KEYWORD_BOOSTS) {
        if (words.has(keyword)) {
          score += KEYWORD_BOOSTS[keyword];
        }
      }
      return { ...s, score };
    }).sort((a, b) => b.score - a.score);
  }
};

// src/analysis/TrendAnalyzer.ts
var TrendAnalyzer = class {
  analyzeTrends(history) {
    if (!history || history.length === 0) return null;
    let slowCount = 0;
    let errorCount = 0;
    let trafficCount = 0;
    history.forEach((h) => {
      if (h.signals.isSlow) slowCount++;
      if (h.signals.isErrorProne) errorCount++;
      if (h.signals.isHighTraffic) trafficCount++;
    });
    return {
      endpoint: history[0].endpoint,
      slowTrend: slowCount > history.length * 0.25,
      // More than 25% of recent analyses were slow
      errorTrend: errorCount > history.length * 0.15,
      trafficTrend: trafficCount > history.length * 0.25
    };
  }
};

// src/decision/RuleEngine.ts
var RuleEngine = class {
  evaluate(analysis) {
    const suggestions = [];
    const { endpoint, avgLatency, errorRate, signals } = analysis;
    if (signals.isSlow || avgLatency > 200) {
      suggestions.push({
        endpoint,
        issue: "High latency",
        suggestionText: "Optimize queries and implement caching for faster response",
        priority: "HIGH",
        source: "RULE"
      });
    }
    if (signals.isErrorProne || errorRate > 5) {
      suggestions.push({
        endpoint,
        issue: "High error rate",
        suggestionText: "Improve validation and add retry mechanisms to reduce errors",
        priority: "HIGH",
        source: "RULE"
      });
    }
    if (signals.isHighTraffic) {
      suggestions.push({
        endpoint,
        issue: "High traffic",
        suggestionText: "Use load balancing and horizontal scaling to handle traffic efficiently",
        priority: "MEDIUM",
        source: "RULE"
      });
    }
    return suggestions;
  }
};

// src/decision/MergeEngine.ts
var MergeEngine = class {
  mergeSuggestions(suggestions) {
    if (!suggestions || suggestions.length === 0) {
      return null;
    }
    const sorted = [...suggestions].sort((a, b) => (b.score || 0) - (a.score || 0));
    return sorted[0];
  }
};

// src/decision/DecisionEngine.ts
var DecisionEngine = class {
  constructor(trendAnalyzer) {
    this.trendAnalyzer = trendAnalyzer;
  }
  trendAnalyzer;
  makeDecision(suggestion, analysis, history) {
    if (suggestion) {
      const normalized = suggestion.suggestionText.toLowerCase();
      const issue = suggestion.issue.toLowerCase();
      if (/\berror\b/.test(normalized) || /\bunstable\b/.test(normalized) || /\berror\b/.test(issue)) {
        return { action: "FLAG_ENDPOINT", target: suggestion.endpoint, reason: suggestion.suggestionText };
      }
      if (/\bcache\b/.test(normalized) || /\bcaching\b/.test(normalized)) {
        return { action: "ENABLE_CACHE", target: suggestion.endpoint, metadata: { ttl: 60 }, reason: suggestion.suggestionText };
      }
      if (/\brate limit\b/.test(normalized) || /\brate-limit\b/.test(normalized) || /\btraffic\b/.test(normalized)) {
        return { action: "INCREASE_RATE_LIMIT", target: suggestion.endpoint, metadata: { increment: 20 }, reason: suggestion.suggestionText };
      }
    }
    const trend = this.trendAnalyzer.analyzeTrends(history);
    if (trend) {
      if (trend.errorTrend) {
        return { action: "FLAG_ENDPOINT", target: analysis.endpoint, reason: "Historical error trend" };
      }
      if (trend.slowTrend) {
        return { action: "ENABLE_CACHE", target: analysis.endpoint, metadata: { ttl: 60 }, reason: "Historical slow trend" };
      }
      if (trend.trafficTrend) {
        return { action: "INCREASE_RATE_LIMIT", target: analysis.endpoint, metadata: { increment: 20 }, reason: "Historical traffic trend" };
      }
    }
    if (analysis.healthScore < 50) {
      return { action: "FLAG_ENDPOINT", target: analysis.endpoint, reason: "Critically low health score" };
    }
    return { action: "NONE", target: analysis.endpoint, reason: "System stable" };
  }
};

// src/providers/ProviderRouter.ts
var ProviderRouter = class {
  constructor(providers, fallbackManager) {
    this.providers = providers;
    this.fallbackManager = fallbackManager;
  }
  providers;
  fallbackManager;
  async getSuggestions(analysis) {
    return this.fallbackManager.executeWithFallback(analysis, this.providers);
  }
};

// src/providers/FallbackManager.ts
var FallbackManager = class {
  constructor(logger) {
    this.logger = logger;
  }
  logger;
  async executeWithFallback(analysis, providers) {
    for (const provider of providers) {
      try {
        this.logger.debug(`Trying AI Provider: ${provider.name}`);
        const result = await provider.generateInsight(JSON.stringify(analysis), analysis);
        if (result && result.insightText) {
          this.logger.debug(`Success from ${provider.name}`);
          return [{
            endpoint: analysis.endpoint,
            issue: "AI Optimization Insight",
            suggestionText: result.insightText,
            priority: "MEDIUM",
            source: "AI"
          }];
        }
      } catch (error) {
        this.logger.warn(`Provider ${provider.name} failed`, { error });
      }
    }
    this.logger.warn("All AI providers failed. Falling back to empty suggestions.");
    return [];
  }
};

// src/execution/Executor.ts
var Executor = class {
  constructor(configStore, logger, eventEmitter) {
    this.configStore = configStore;
    this.logger = logger;
    this.eventEmitter = eventEmitter;
  }
  configStore;
  logger;
  eventEmitter;
  decisionMemory = {};
  failureCount = 0;
  MAX_FAILURES = 3;
  COOLDOWN = 60 * 1e3;
  async executeDecision(decision) {
    const { action, target, metadata, reason } = decision;
    if (this.failureCount >= this.MAX_FAILURES) {
      this.logger.error(`Circuit breaker triggered! Halting AI optimizations for ${target}`);
      return { decision, status: "BLOCKED_CIRCUIT", timestamp: Date.now() };
    }
    const key = `${target}:${action}`;
    const now = Date.now();
    if (this.decisionMemory[key] && now - this.decisionMemory[key] < this.COOLDOWN) {
      this.logger.info(`Skipped ${action} (cooldown active) for ${target}`);
      return { decision, status: "SKIPPED_COOLDOWN", timestamp: now };
    }
    try {
      const currentConfig = await this.configStore.getConfig(target);
      if (action === "ENABLE_CACHE") {
        const ttl = metadata?.ttl ?? 60;
        await this.configStore.updateConfig(target, { cacheEnabled: true, cacheTtl: ttl });
      } else if (action === "INCREASE_RATE_LIMIT") {
        const increment = metadata?.increment ?? 20;
        await this.configStore.updateConfig(target, { rateLimit: currentConfig.rateLimit + increment });
      } else if (action === "FLAG_ENDPOINT") {
        await this.configStore.updateConfig(target, { isFlagged: true });
      }
      this.decisionMemory[key] = now;
      this.logger.info(`Executed ${action} on ${target}. Reason: ${reason}`);
      this.eventEmitter.emit("action_executed", { action, target, metadata, reason });
      return { decision, status: "EXECUTED", timestamp: now };
    } catch (error) {
      this.failureCount++;
      this.logger.error(`Failed to execute decision ${action} on ${target}`, error);
      throw error;
    }
  }
};

// src/engine/IntelliGateEngine.ts
var IntelliGateEngine = class {
  metricsAnalyzer;
  trendAnalyzer;
  ruleEngine;
  mergeEngine;
  decisionEngine;
  providerRouter;
  fallbackManager;
  executor;
  constructor(metricsStore, configStore, providers, logger, eventEmitter) {
    this.metricsAnalyzer = new MetricsAnalyzer(metricsStore, logger);
    this.trendAnalyzer = new TrendAnalyzer();
    this.ruleEngine = new RuleEngine();
    this.mergeEngine = new MergeEngine();
    this.decisionEngine = new DecisionEngine(this.trendAnalyzer);
    this.fallbackManager = new FallbackManager(logger);
    this.providerRouter = new ProviderRouter(providers, this.fallbackManager);
    this.executor = new Executor(configStore, logger, eventEmitter);
  }
  async runOptimization(endpoint) {
    const analysis = await this.metricsAnalyzer.analyzeEndpoint(endpoint);
    if (!analysis) return;
    const ruleSuggestions = this.ruleEngine.evaluate(analysis);
    const aiSuggestions = await this.providerRouter.getSuggestions(analysis);
    const combinedSuggestions = [...ruleSuggestions, ...aiSuggestions];
    const topSuggestion = this.mergeEngine.mergeSuggestions(combinedSuggestions);
    const history = [analysis];
    const decision = this.decisionEngine.makeDecision(topSuggestion, analysis, history);
    if (decision && decision.action !== "NONE") {
      await this.executor.executeDecision(decision);
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DecisionEngine,
  Executor,
  FallbackManager,
  IntelliGateEngine,
  MergeEngine,
  MetricsAnalyzer,
  ProviderRouter,
  RuleEngine,
  ScoringEngine,
  TrendAnalyzer
});
