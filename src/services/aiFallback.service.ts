import { AIInput } from "./aiDataFormatter.service";
import { Suggestion } from "./ruleEngine.service";

import { groqProvider } from "./aiProviders/groq.provider";
import { hfProvider } from "./aiProviders/hf.provider";
import { geminiProvider } from "./aiProviders/gemini.provider";


const normalizeAISuggestions = (
  suggestions: Suggestion[],
  endpoint: string
): Suggestion[] => {
  return suggestions.map((s) => ({
    endpoint: s.endpoint || endpoint,
    issue: s.issue || "AI Optimization Insight",
    suggestion: s.suggestion,
    priority: s.priority || "Medium",

    
    category: s.category || "performance",
    source: "ai",
    createdAt: new Date(),
  }));
};


export const analyzeWithFallback = async (
  data: AIInput
): Promise<Suggestion[]> => {
  const providers = [
    { name: "Groq", fn: groqProvider },
    { name: "HuggingFace", fn: hfProvider },
    { name: "Gemini", fn: geminiProvider },
  ];

  for (const provider of providers) {
    try {
      console.log(`Trying ${provider.name}...`);

      const result = await provider.fn(data);

      if (result && result.length > 0) {
        console.log(`Success from ${provider.name}`);

        // 🔥 Normalize before returning
        return normalizeAISuggestions(result, data.endpoint);
      }
    } catch (error) {
      console.warn(`${provider.name} failed`);

      if (error instanceof Error) {
        console.warn(error.message);
      } else {
        console.warn(error);
      }
    }
  }

  
  console.warn("⚠️ All AI providers failed");

  return [
    {
      endpoint: data.endpoint,
      issue: "AI unavailable",
      suggestion:
        "All AI providers failed. Falling back to rule-based optimization.",
      priority: "Low",

      
      category: "performance",
      source: "ai",
      createdAt: new Date(),
    },
  ];
};