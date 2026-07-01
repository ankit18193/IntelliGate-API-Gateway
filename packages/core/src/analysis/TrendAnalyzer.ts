import { Analysis } from '@intelligate/shared';

export interface TrendResult {
  endpoint: string;
  slowTrend: boolean;
  errorTrend: boolean;
  trafficTrend: boolean;
}

export class TrendAnalyzer {
  public analyzeTrends(history: Analysis[]): TrendResult | null {
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
      slowTrend: slowCount > history.length * 0.25, // More than 25% of recent analyses were slow
      errorTrend: errorCount > history.length * 0.15,
      trafficTrend: trafficCount > history.length * 0.25,
    };
  }
}
