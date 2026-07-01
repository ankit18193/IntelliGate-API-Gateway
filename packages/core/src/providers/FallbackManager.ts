import { Analysis, IProvider, Suggestion, ILogger } from '@intelligate/shared';

export class FallbackManager {
  constructor(private readonly logger: ILogger) {}

  public async executeWithFallback(analysis: Analysis, providers: IProvider[]): Promise<Suggestion[]> {
    for (const provider of providers) {
      try {
        this.logger.debug(`Trying AI Provider: ${provider.name}`);
        const result = await provider.generateInsight(JSON.stringify(analysis), analysis);
        
        if (result && result.insightText) {
          this.logger.debug(`Success from ${provider.name}`);
          return [{
            endpoint: analysis.endpoint,
            issue: 'AI Optimization Insight',
            suggestionText: result.insightText,
            priority: 'MEDIUM',
            source: 'AI'
          }];
        }
      } catch (error) {
        this.logger.warn(`Provider ${provider.name} failed`, { error });
      }
    }

    this.logger.warn('All AI providers failed. Falling back to empty suggestions.');
    return [];
  }
}
