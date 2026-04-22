import "dotenv/config";
import "tsconfig-paths/register";

import { mergeSuggestions } from "@/services/mergeEngine.service";
import { formatMetricsForAI } from "@/services/aiDataFormatter.service";
import { runRuleEngine } from "@/services/ruleEngine.service";
import { analyzeWithFallback } from "@/services/aiFallback.service";
import { scoreSuggestions } from "@/services/scoringEngine.service";

const run = async (): Promise<void> => {
  try {
    console.log("Starting AI Pipeline Test...\n");

    
    const rawData = {
      endpoint: "/api/test",
      avgLatency: 320,
      errorRate: "6.5%",
      totalRequests: 1500,
    };

    console.log("Raw Data:");
    console.dir(rawData, { depth: null });

    
    const formatted = formatMetricsForAI(rawData);
    console.log("\nFormatted Data:");
    console.dir(formatted, { depth: null });

    
    const ruleSuggestions = runRuleEngine(formatted);
    console.log("\nRule Suggestions:");
    console.dir(ruleSuggestions, { depth: null });

    
    const aiSuggestions = await analyzeWithFallback(formatted);
    console.log("\nAI Suggestions:");
    console.dir(aiSuggestions, { depth: null });

    
    const mergedSuggestions = mergeSuggestions(
      ruleSuggestions,
      aiSuggestions
    );
    console.log("\n Merged Suggestions:");
    console.dir(mergedSuggestions, { depth: null });

    
    const scoredSuggestions = scoreSuggestions(mergedSuggestions);
    console.log("\nFINAL SCORED OUTPUT:");
    console.dir(scoredSuggestions, { depth: null });

    console.log("\nTEST COMPLETED SUCCESSFULLY");

    process.exit(0); 
  } catch (error: unknown) {
    console.error("\nTEST FAILED");

    if (error instanceof Error) {
      console.error("Message:", error.message);
    } else {
      console.error("Unknown error:", error);
    }

    process.exit(1);
  }
};

run();