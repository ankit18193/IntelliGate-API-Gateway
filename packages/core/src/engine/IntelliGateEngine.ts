import { IMetricsStore, IConfigStore, IProvider, ILogger, IEventEmitter, Analysis } from '@intelligate/shared';
import { MetricsAnalyzer } from '../analysis/MetricsAnalyzer';
import { TrendAnalyzer } from '../analysis/TrendAnalyzer';
import { RuleEngine } from '../decision/RuleEngine';
import { MergeEngine } from '../decision/MergeEngine';
import { DecisionEngine } from '../decision/DecisionEngine';
import { ProviderRouter } from '../providers/ProviderRouter';
import { FallbackManager } from '../providers/FallbackManager';
import { Executor } from '../execution/Executor';

export class IntelliGateEngine {
  private metricsAnalyzer: MetricsAnalyzer;
  private trendAnalyzer: TrendAnalyzer;
  private ruleEngine: RuleEngine;
  private mergeEngine: MergeEngine;
  private decisionEngine: DecisionEngine;
  private providerRouter: ProviderRouter;
  private fallbackManager: FallbackManager;
  private executor: Executor;

  constructor(
    metricsStore: IMetricsStore,
    configStore: IConfigStore,
    providers: IProvider[],
    logger: ILogger,
    eventEmitter: IEventEmitter
  ) {
    this.metricsAnalyzer = new MetricsAnalyzer(metricsStore, logger);
    this.trendAnalyzer = new TrendAnalyzer();
    this.ruleEngine = new RuleEngine();
    this.mergeEngine = new MergeEngine();
    this.decisionEngine = new DecisionEngine(this.trendAnalyzer);
    this.fallbackManager = new FallbackManager(logger);
    this.providerRouter = new ProviderRouter(providers, this.fallbackManager);
    this.executor = new Executor(configStore, logger, eventEmitter);
  }

  public async runOptimization(endpoint: string): Promise<void> {
    const analysis = await this.metricsAnalyzer.analyzeEndpoint(endpoint);
    if (!analysis) return;

    const ruleSuggestions = this.ruleEngine.evaluate(analysis);
    const aiSuggestions = await this.providerRouter.getSuggestions(analysis);
    
    const combinedSuggestions = [...ruleSuggestions, ...aiSuggestions];
    const topSuggestion = this.mergeEngine.mergeSuggestions(combinedSuggestions);
    
    // Create a mock history array containing just this analysis for now.
    // In a full implementation, history would be fetched via an IAnalysisStore.
    const history: Analysis[] = [analysis];
    
    const decision = this.decisionEngine.makeDecision(topSuggestion, analysis, history);
    
    if (decision && decision.action !== 'NONE') {
      await this.executor.executeDecision(decision);
    }
  }
}
