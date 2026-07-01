import { Analysis, Suggestion } from '@intelligate/shared';

export class RuleEngine {
  public evaluate(analysis: Analysis): Suggestion[] {
    const suggestions: Suggestion[] = [];
    const { endpoint, avgLatency, errorRate, signals } = analysis;

    if (signals.isSlow || avgLatency > 200) {
      suggestions.push({
        endpoint,
        issue: 'High latency',
        suggestionText: 'Optimize queries and implement caching for faster response',
        priority: 'HIGH',
        source: 'RULE',
      });
    }

    if (signals.isErrorProne || errorRate > 5) {
      suggestions.push({
        endpoint,
        issue: 'High error rate',
        suggestionText: 'Improve validation and add retry mechanisms to reduce errors',
        priority: 'HIGH',
        source: 'RULE',
      });
    }

    if (signals.isHighTraffic) {
      suggestions.push({
        endpoint,
        issue: 'High traffic',
        suggestionText: 'Use load balancing and horizontal scaling to handle traffic efficiently',
        priority: 'MEDIUM',
        source: 'RULE',
      });
    }

    return suggestions;
  }
}
