import { Suggestion } from '@intelligate/shared';

const PRIORITY_WEIGHTS: Record<string, number> = {
  CRITICAL: 100,
  HIGH: 80,
  MEDIUM: 60,
  LOW: 40,
};

const SOURCE_WEIGHTS: Record<string, number> = {
  RULE: 5,
  AI: 3,
};

const KEYWORD_BOOSTS: Record<string, number> = {
  error: 10,
  latency: 8,
  traffic: 5,
  cache: 4,
  retry: 6,
  validation: 6,
};

export class ScoringEngine {
  public scoreSuggestions(suggestions: Suggestion[]): (Suggestion & { score: number })[] {
    return suggestions
      .map((s) => {
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
      })
      .sort((a, b) => b.score - a.score);
  }
}
