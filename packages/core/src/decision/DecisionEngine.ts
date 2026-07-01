import { Decision, Suggestion, Analysis, ActionType } from '@intelligate/shared';
import { TrendAnalyzer } from '../analysis/TrendAnalyzer';

export class DecisionEngine {
  constructor(private readonly trendAnalyzer: TrendAnalyzer) {}

  public makeDecision(suggestion: Suggestion | null, analysis: Analysis, history: Analysis[]): Decision {
    if (suggestion) {
      const normalized = suggestion.suggestionText.toLowerCase();
      const issue = suggestion.issue.toLowerCase();

      if (/\berror\b/.test(normalized) || /\bunstable\b/.test(normalized) || /\berror\b/.test(issue)) {
        return { action: 'FLAG_ENDPOINT', target: suggestion.endpoint, reason: suggestion.suggestionText };
      }
      if (/\bcache\b/.test(normalized) || /\bcaching\b/.test(normalized)) {
        return { action: 'ENABLE_CACHE', target: suggestion.endpoint, metadata: { ttl: 60 }, reason: suggestion.suggestionText };
      }
      if (/\brate limit\b/.test(normalized) || /\brate-limit\b/.test(normalized) || /\btraffic\b/.test(normalized)) {
        return { action: 'INCREASE_RATE_LIMIT', target: suggestion.endpoint, metadata: { increment: 20 }, reason: suggestion.suggestionText };
      }
    }

    const trend = this.trendAnalyzer.analyzeTrends(history);
    if (trend) {
      if (trend.errorTrend) {
        return { action: 'FLAG_ENDPOINT', target: analysis.endpoint, reason: 'Historical error trend' };
      }
      if (trend.slowTrend) {
        return { action: 'ENABLE_CACHE', target: analysis.endpoint, metadata: { ttl: 60 }, reason: 'Historical slow trend' };
      }
      if (trend.trafficTrend) {
        return { action: 'INCREASE_RATE_LIMIT', target: analysis.endpoint, metadata: { increment: 20 }, reason: 'Historical traffic trend' };
      }
    }

    if (analysis.healthScore < 50) {
      return { action: 'FLAG_ENDPOINT', target: analysis.endpoint, reason: 'Critically low health score' };
    }

    return { action: 'NONE', target: analysis.endpoint, reason: 'System stable' };
  }
}
