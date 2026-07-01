export const mergeSuggestions = (
  rule: string,
  ai: string
): string => {
  

  if (rule && ai) {
    if (rule.includes("cache") && ai.includes("Redis")) {
      return "Enable Redis caching";
    }
    return rule;
  }

  return rule || ai;
};