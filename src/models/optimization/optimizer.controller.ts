import { OptimizationInput } from "@/types/optimization.types";
import { mergeSuggestions } from "./merge.engine";
import { decideAction } from "./decision.engine";
import { validateDecision } from "./safety.layer";
import { executeDecision } from "./executor";
import { logAction } from "./audit.logger";
import { decideFromAnalysis } from "./decision.engine";
import { EndpointAnalysis } from "@/types/optimization.types";

export const runOptimization = (
  input: OptimizationInput,
  analysis?: EndpointAnalysis,
): void => {
  
  const rule = input.ruleSuggestion ?? "";
  const ai = input.aiSuggestion ?? "";

  const merged = mergeSuggestions(rule, ai);

  console.log("Merged Suggestion:", merged);

  let decision = null;

 
  if (analysis) {
    decision = decideFromAnalysis(analysis);
  }

  
  if (!decision) {
    decision = decideAction({
      ...input,
      suggestion: merged,
    });
  }

  console.log("Decision:", decision);


  if (!decision) return;

 
  if (!validateDecision(decision)) return;

  executeDecision(decision);

  logAction(decision, input.issue);
};
