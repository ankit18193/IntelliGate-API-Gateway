import { AIInput } from "./aiDataFormatter.service";


export type Priority = "Low" | "Medium" | "High";


export interface Suggestion {
  endpoint: string;
  issue: string;
  suggestion: string;
  priority: Priority;

  // 🔥 NEW FIELDS (for Phase 5+)
  category: "performance" | "reliability" | "scaling" | "caching";
  score?: number;
  source: "rule" | "ai";
  createdAt: Date;
}


interface Rule {
  name: string;
  check: (data: AIInput) => boolean;
  build: (data: AIInput) => Suggestion;
}


const RULES: Rule[] = [
  {
    name: "High Latency",
    check: (data) => data.avgLatency > 200,
    build: (data) => ({
      endpoint: data.endpoint,
      issue: "High latency",
      suggestion: "Optimize queries and implement caching for faster response",
      priority: "High",
      category: "performance",
      source: "rule",
      createdAt: new Date(),
    }),
  },
  {
    name: "High Error Rate",
    check: (data) => data.errorRate > 5,
    build: (data) => ({
      endpoint: data.endpoint,
      issue: "High error rate",
      suggestion: "Improve validation and add retry mechanisms to reduce errors",
      priority: "High",
      category: "reliability",
      source: "rule",
      createdAt: new Date(),
    }),
  },
  {
    name: "High Traffic",
    check: (data) => data.requests > 1000,
    build: (data) => ({
      endpoint: data.endpoint,
      issue: "High traffic",
      suggestion: "Use load balancing and horizontal scaling to handle traffic efficiently",
      priority: "Medium",
      category: "scaling",
      source: "rule",
      createdAt: new Date(),
    }),
  },
  {
    name: "Low Cache Utilization",
    check: (data) => data.cacheHitRate < 20,
    build: (data) => ({
      endpoint: data.endpoint,
      issue: "Low cache utilization",
      suggestion: "Increase cache usage for better performance",
      priority: "Medium",
      category: "caching",
      source: "rule",
      createdAt: new Date(),
    }),
  },
];


export const runRuleEngine = (data: AIInput): Suggestion[] => {
  const suggestions: Suggestion[] = [];

  for (const rule of RULES) {
    try {
      if (rule.check(data)) {
        suggestions.push(rule.build(data));
      }
    } catch (error) {
      console.error(`Rule failed: ${rule.name}`, error);
    }
  }

  return suggestions;
};