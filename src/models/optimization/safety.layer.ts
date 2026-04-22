import { Decision } from "@/types/optimization.types";

export const validateDecision = (decision: Decision | null): boolean => {
  if (!decision) return false;

  if (decision.action === "INCREASE_RATE_LIMIT") {
    if ((decision.metadata?.increment || 0) > 50) {
      return false;
    }
  }

  return true;
};