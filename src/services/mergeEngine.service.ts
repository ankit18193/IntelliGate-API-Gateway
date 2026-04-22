import { Suggestion } from "./ruleEngine.service";

export const mergeSuggestions = (
  ruleSuggestions: Suggestion[],
  aiSuggestions: Suggestion[]
): Suggestion[] => {
  const aiText = aiSuggestions
    .map((s) => s.suggestion.toLowerCase())
    .join(" ");

  const merged: Suggestion[] = ruleSuggestions.map((rule) => {
    const updated = { ...rule };
    const issue = updated.issue.toLowerCase();

    if (issue.includes("latency") && aiText.includes("cache")) {
      updated.suggestion =
        "Optimize queries and implement caching for faster response";
    }

    if (issue.includes("traffic") && aiText.includes("scale")) {
      updated.suggestion =
        "Use load balancing and horizontal scaling to handle traffic efficiently";
    }

    if (issue.includes("error")) {
      if (aiText.includes("retry") || aiText.includes("validation")) {
        updated.suggestion =
          "Improve validation and add retry mechanisms to reduce errors";
      }
    }

    return updated;
  });

  return merged;
};