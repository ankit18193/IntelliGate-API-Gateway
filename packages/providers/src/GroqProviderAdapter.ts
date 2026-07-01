import { IProvider, ProviderResponse, Analysis } from '@intelligate/shared';

export class GroqProviderAdapter implements IProvider {
  public readonly id = 'groq';
  public readonly name = 'Groq';

  constructor(private readonly legacyProviderFn: (data: any) => Promise<any>) {}

  async generateInsight(prompt: string, context: Analysis): Promise<ProviderResponse> {
    const start = Date.now();
    const input = {
      endpoint: context.endpoint,
      avgLatency: context.avgLatency,
      errorRate: context.errorRate,
      requests: context.signals.isHighTraffic ? 1000 : 100,
      cacheHitRate: 0,
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
    
    throw new Error('Groq generated no insight');
  }
}
