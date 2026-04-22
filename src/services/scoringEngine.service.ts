import { Suggestion } from "./ruleEngine.service";


const PRIORITY_WEIGHTS: Record<Suggestion["priority"], number> = {
  High: 80,
  Medium: 60,
  Low: 40,
};


const CATEGORY_WEIGHTS: Record<
  Suggestion["category"],
  number
> = {
  performance: 10,
  reliability: 15,
  scaling: 5,
  caching: 3,
};


const SOURCE_WEIGHTS: Record<
  Suggestion["source"],
  number
> = {
  rule: 5,
  ai: 3,
};


const KEYWORD_BOOSTS: Record<string, number> = {
  error: 10,
  latency: 8,
  traffic: 5,
  cache: 4,
  retry: 6,
  validation: 6,
};


const normalizeText = (text: string): string =>
  text.toLowerCase().trim();


const extractWords = (text: string): Set<string> => {
  return new Set(text.split(/\s+/));
};


const getKeywordScore = (text: string): number => {
  const words = extractWords(text);
  let score = 0;

  for (const keyword in KEYWORD_BOOSTS) {
    if (words.has(keyword)) {
      score += KEYWORD_BOOSTS[keyword];
    }
  }

  return score;
};


const safeGet = <T extends Record<string, number>>(
  obj: T,
  key: string
): number => {
  return obj[key as keyof T] ?? 0;
};


export const scoreSuggestions = (
  suggestions: Suggestion[]
): Suggestion[] => {
  return suggestions
    .map((s) => {
      let score = 0;

      
      const combinedText = normalizeText(
        `${s.issue} ${s.suggestion}`
      );

      
      const priorityScore = safeGet(
        PRIORITY_WEIGHTS,
        s.priority
      );
      score += priorityScore;

      
      const categoryScore = safeGet(
        CATEGORY_WEIGHTS,
        s.category
      );
      score += categoryScore;

      
      const sourceScore = safeGet(
        SOURCE_WEIGHTS,
        s.source
      );
      score += sourceScore;

      
      const keywordScore = getKeywordScore(combinedText);
      score += keywordScore;

      return {
        ...s,
        score,

        
        debug: {
          priorityScore,
          categoryScore,
          sourceScore,
          keywordScore,
        },
      };
    })
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
};