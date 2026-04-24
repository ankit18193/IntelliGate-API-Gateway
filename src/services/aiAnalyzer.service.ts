import { AIInput } from "./aiDataFormatter.service";
import { Suggestion } from "./ruleEngine.service";

export const analyzeWithAI = async (
  data: AIInput
): Promise<Suggestion[]> => {
  console.log("🤖 AI analyzing data...");

  const suggestions: Suggestion[] = [];

  
  const baseMeta = {
    source: "ai" as const,
    createdAt: new Date(),
  };

  
  if (data.avgLatency > 200 && data.requests < 500) {
    suggestions.push({
      endpoint: data.endpoint,
      issue: "Inefficient processing",
      suggestion:
        "Latency is high despite low traffic — check database queries or backend logic",
      priority: "High",
      category: "performance", 
      ...baseMeta,
    });
  }

 
  if (data.avgLatency > 200 && data.requests > 1000) {
    suggestions.push({
      endpoint: data.endpoint,
      issue: "Scalability bottleneck",
      suggestion:
        "High traffic and latency detected — consider load balancing or horizontal scaling",
      priority: "High",
      category: "scaling", 
      ...baseMeta,
    });
  }

  
  if (data.cacheHitRate < 20 && data.avgLatency > 150) {
    suggestions.push({
      endpoint: data.endpoint,
      issue: "Poor cache utilization",
      suggestion:
        "Low cache hit rate is affecting performance — enable smarter caching strategy",
      priority: "Medium",
      category: "caching", 
      ...baseMeta,
    });
  }

   
  if (
    data.avgLatency < 100 &&
    data.errorRate < 1 &&
    data.requests < 500
  ) {
    suggestions.push({
      endpoint: data.endpoint,
      issue: "Healthy system",
      suggestion: "No major issues detected — system is performing well",
      priority: "Low",
      category: "reliability", 
      ...baseMeta,
    });
  }

  return suggestions;
};