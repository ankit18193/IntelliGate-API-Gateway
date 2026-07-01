import { Metrics, Analysis, IMetricsStore, ILogger } from '@intelligate/shared';

export class MetricsAnalyzer {
  constructor(
    private readonly metricsStore: IMetricsStore,
    private readonly logger: ILogger
  ) {}

  public async analyzeEndpoint(endpoint: string, limit: number = 100): Promise<Analysis | null> {
    try {
      const history = await this.metricsStore.getRecent(endpoint, limit);
      if (!history || history.length === 0) {
        return null;
      }

      const totalRequests = history.length;
      const avgLatency = history.reduce((sum, m) => sum + m.latency, 0) / totalRequests;
      const errors = history.filter((m) => m.status >= 500).length;
      const errorRate = (errors / totalRequests) * 100;

      const healthScore = Math.max(0, 100 - avgLatency * 0.2 - errorRate * 2);

      const isSlow = avgLatency > 300;
      const isErrorProne = errorRate > 5;
      const isHighTraffic = totalRequests > 50;

      const analysis: Analysis = {
        endpoint,
        avgLatency: Math.round(avgLatency),
        errorRate: Math.round(errorRate),
        healthScore: Math.round(healthScore),
        signals: {
          isSlow,
          isErrorProne,
          isHighTraffic,
        },
      };

      this.logger.debug(`Analysis complete for ${endpoint}`, { healthScore });
      return analysis;
    } catch (error) {
      this.logger.error(`Failed to analyze metrics for ${endpoint}`, error);
      throw error;
    }
  }
}
