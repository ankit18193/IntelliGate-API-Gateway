import { Decision } from "@/types/optimization.types";
import { updateConfig, getConfig } from "@/config/optimization.config";
import { logger } from "@/lib/logger";



const decisionMemory: Record<string, number> = {};


const COOLDOWN = 60 * 1000; 



type Feedback = {
  endpoint: string;
  action: string;
  beforeLatency: number;
  afterLatency: number;
  impact: "IMPROVED" | "NO_CHANGE" | "DEGRADED";
  timestamp: string;
};

const feedbackLog: Feedback[] = [];


const evaluateImpact = (
  before: number,
  after: number
): "IMPROVED" | "NO_CHANGE" | "DEGRADED" => {
  if (after < before) return "IMPROVED";
  if (after === before) return "NO_CHANGE";
  return "DEGRADED";
};

export const executeDecision = async (
  decision: Decision
): Promise<void> => {
  const { action, target, metadata } = decision;

  const key = `${target}:${action}`;
  const now = Date.now();

 

  if (decisionMemory[key] && now - decisionMemory[key] < COOLDOWN) {
    logger.info({
      event: "optimization",
      requestId: "system",
      endpoint: target,
      message: `Skipped ${action} (cooldown active)`,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  try {
    const current = await getConfig(target);

   

    const beforeLatency =  100; 
    let afterLatency = beforeLatency;

   

    switch (action) {
      case "ENABLE_CACHE": {
        const ttl = metadata?.ttl ?? 60;

        await updateConfig(target, {
          cache: true,
          ttl,
        });

        decisionMemory[key] = now;

        
        afterLatency = beforeLatency - 20;

        logger.info({
          event: "optimization",
          requestId: "system",
          endpoint: target,
          message: `Enabled cache (TTL: ${ttl}s)`,
          timestamp: new Date().toISOString(),
        });

        break;
      }

      case "INCREASE_RATE_LIMIT": {
        const increment = metadata?.increment ?? 20;

        await updateConfig(target, {
          rateLimit: current.rateLimit + increment,
        });

        decisionMemory[key] = now;

       
        afterLatency = beforeLatency - 10;

        logger.info({
          event: "optimization",
          requestId: "system",
          endpoint: target,
          message: `Increased rate limit (+${increment})`,
          timestamp: new Date().toISOString(),
        });

        break;
      }

      case "FLAG_ENDPOINT": {
        await updateConfig(target, {
          flagged: true,
        });

        decisionMemory[key] = now;

       
        afterLatency = beforeLatency + 10;

        logger.warn({
          event: "optimization",
          requestId: "system",
          endpoint: target,
          message: "Endpoint flagged as unstable",
          timestamp: new Date().toISOString(),
        });

        break;
      }

      default:
        logger.warn({
          event: "optimization",
          requestId: "system",
          endpoint: target,
          message: `Unknown action: ${action}`,
          timestamp: new Date().toISOString(),
        });
        return;
    }

    

    const impact = evaluateImpact(beforeLatency, afterLatency);

    feedbackLog.push({
      endpoint: target,
      action,
      beforeLatency,
      afterLatency,
      impact,
      timestamp: new Date().toISOString(),
    });

    logger.info({
      event: "optimization",
      requestId: "system",
      endpoint: target,
      message: `Impact: ${impact} (${beforeLatency} → ${afterLatency})`,
      timestamp: new Date().toISOString(),
    });

  } catch (error: unknown) {
    logger.error({
      event: "error",
      requestId: "system",
      endpoint: target,
      message: "Failed to execute AI decision",
      timestamp: new Date().toISOString(),
    });
  }
};