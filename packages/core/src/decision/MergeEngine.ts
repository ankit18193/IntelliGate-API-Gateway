import { Suggestion } from '@intelligate/shared';

export class MergeEngine {
  public mergeSuggestions(suggestions: (Suggestion & { score?: number })[]): Suggestion | null {
    if (!suggestions || suggestions.length === 0) {
      return null;
    }

    // Sort by score descending
    const sorted = [...suggestions].sort((a, b) => (b.score || 0) - (a.score || 0));
    
    // We return the highest scored suggestion. 
    // In a more complex engine, we might merge the suggestion texts if they share the same issue.
    return sorted[0];
  }
}
