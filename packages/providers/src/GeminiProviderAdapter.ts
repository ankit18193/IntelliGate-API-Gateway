import { IProvider, ProviderResponse, Analysis } from '@intelligate/shared';

export class GeminiProviderAdapter implements IProvider {
  public readonly id = 'gemini';
  public readonly name = 'Gemini';

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
    
    throw new Error('Gemini generated no insight');
  }
}
