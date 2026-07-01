import { OptimizationInput } from "@/types/optimization.types";
import { mergeSuggestions } from "./merge.engine";
import { decideAction } from "./decision.engine";
import { validateDecision } from "./safety.layer";
import { executeDecision } from "./executor";
import { logAction } from "./audit.logger";
import { decideFromAnalysis } from "./decision.engine";
import { EndpointAnalysis } from "@/types/optimization.types";
import { IntelliGateEngine } from "@intelligate/core";
import { IMetricsStore, IConfigStore, IProvider, ILogger, IEventEmitter, Metrics, Configuration } from "@intelligate/shared";
import { RedisConfigStore } from "@intelligate/store-redis";
import { MongoMetricsStore } from "@intelligate/store-mongo";
import { GroqProviderAdapter, GeminiProviderAdapter, HFProviderAdapter } from "@intelligate/providers";
import { MetricsModel } from "@/models/metrics.model";
import { getConfig, updateConfig } from "@/config/optimization.config";
import { groqProvider } from "@/services/aiProviders/groq.provider";
import { geminiProvider } from "@/services/aiProviders/gemini.provider";
import { hfProvider } from "@/services/aiProviders/hf.provider";
import { logger, LogEvent } from "@/lib/logger";

class BackendLogger implements ILogger {
  private formatLog(msg: string, meta?: any): LogEvent {
    return {
      event: "optimization",
      message: `${msg} ${meta ? JSON.stringify(meta) : ""}`,
      timestamp: new Date().toISOString()
    };
  }
  info(msg: string, meta?: any) { logger.info(this.formatLog(msg, meta)); }
  warn(msg: string, meta?: any) { logger.warn(this.formatLog(msg, meta)); }
  error(msg: string, err?: any) { logger.error(this.formatLog(msg, err)); }
  debug(msg: string, meta?: any) { logger.info(this.formatLog(msg, meta)); }
}

class BackendEventEmitter implements IEventEmitter {
  emit(event: string, payload: any): void {
    // Mapping core events to legacy audit logger when appropriate
    if (event === 'action_executed') {
      logAction(payload.action, payload.reason);
    }
  }
  on(event: string, handler: (payload: any) => void): void {}
}

const coreEngine = new IntelliGateEngine(
  new MongoMetricsStore(MetricsModel),
  new RedisConfigStore(getConfig, updateConfig),
  [
    new GroqProviderAdapter(groqProvider),
    new GeminiProviderAdapter(geminiProvider),
    new HFProviderAdapter(hfProvider)
  ],
  new BackendLogger(),
  new BackendEventEmitter()
);


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

  // Delegate execution to the new IntelliGateEngine (Core Extraction - M2)
  coreEngine.runOptimization(input.endpoint).catch(console.error);
};
