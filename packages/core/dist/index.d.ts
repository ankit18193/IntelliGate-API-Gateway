import { IMetricsStore, ILogger, Analysis, Suggestion, Decision, IProvider, IConfigStore, IEventEmitter, Action } from '@intelligate/shared';

declare class MetricsAnalyzer {
    private readonly metricsStore;
    private readonly logger;
    constructor(metricsStore: IMetricsStore, logger: ILogger);
    analyzeEndpoint(endpoint: string, limit?: number): Promise<Analysis | null>;
}

declare class ScoringEngine {
    scoreSuggestions(suggestions: Suggestion[]): (Suggestion & {
        score: number;
    })[];
}

interface TrendResult {
    endpoint: string;
    slowTrend: boolean;
    errorTrend: boolean;
    trafficTrend: boolean;
}
declare class TrendAnalyzer {
    analyzeTrends(history: Analysis[]): TrendResult | null;
}

declare class RuleEngine {
    evaluate(analysis: Analysis): Suggestion[];
}

declare class MergeEngine {
    mergeSuggestions(suggestions: (Suggestion & {
        score?: number;
    })[]): Suggestion | null;
}

declare class DecisionEngine {
    private readonly trendAnalyzer;
    constructor(trendAnalyzer: TrendAnalyzer);
    makeDecision(suggestion: Suggestion | null, analysis: Analysis, history: Analysis[]): Decision;
}

declare class FallbackManager {
    private readonly logger;
    constructor(logger: ILogger);
    executeWithFallback(analysis: Analysis, providers: IProvider[]): Promise<Suggestion[]>;
}

declare class ProviderRouter {
    private readonly providers;
    private readonly fallbackManager;
    constructor(providers: IProvider[], fallbackManager: FallbackManager);
    getSuggestions(analysis: Analysis): Promise<Suggestion[]>;
}

declare class Executor {
    private readonly configStore;
    private readonly logger;
    private readonly eventEmitter;
    private decisionMemory;
    private failureCount;
    private readonly MAX_FAILURES;
    private readonly COOLDOWN;
    constructor(configStore: IConfigStore, logger: ILogger, eventEmitter: IEventEmitter);
    executeDecision(decision: Decision): Promise<Action>;
}

declare class IntelliGateEngine {
    private metricsAnalyzer;
    private trendAnalyzer;
    private ruleEngine;
    private mergeEngine;
    private decisionEngine;
    private providerRouter;
    private fallbackManager;
    private executor;
    constructor(metricsStore: IMetricsStore, configStore: IConfigStore, providers: IProvider[], logger: ILogger, eventEmitter: IEventEmitter);
    runOptimization(endpoint: string): Promise<void>;
}

export { DecisionEngine, Executor, FallbackManager, IntelliGateEngine, MergeEngine, MetricsAnalyzer, ProviderRouter, RuleEngine, ScoringEngine, TrendAnalyzer, type TrendResult };
