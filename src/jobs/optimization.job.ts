import { connectDB } from "@/lib/db";
import { MetricsModel } from "@/models/metrics.model";
import { AnalysisModel } from "@/models/analysis.model";  
import { analyzeMetricsBatch } from "@/modules/optimization/metrics.analyzer";
import { smartDecision } from "@/models/optimization/decision.engine";
import { executeDecision } from "@/models/optimization/executor";

export const runOptimizationJob = async (): Promise<void> => {
  try {
    await connectDB();
    console.log("🤖 [CRON] Waking up Optimization Engine...");

    const metrics = await MetricsModel.find()
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();

    if (!metrics.length) {
      console.log("🤖 [CRON] No metrics found. Going back to sleep.");
      return;
    }

    const analysis = await analyzeMetricsBatch(metrics);
    const analysisArray = Array.isArray(analysis) ? analysis : [analysis];

    
    if (analysisArray.length > 0 && analysisArray[0]) {
      await AnalysisModel.insertMany(
        analysisArray.map((a) => ({
          endpoint: a.endpoint,
          severity: a.severity,
          signals: a.signals,
        }))
      );
    }

    
    for (const item of analysisArray) {
      const decision = await smartDecision(item);

      if (decision) {
        console.log(`⚡ [CRON] Executing action: ${decision.action} on ${decision.target}`);
        await executeDecision(decision);
      }
    }

    console.log("[CRON] Optimization cycle complete.");
  } catch (err: unknown) {
    console.error("[CRON] Job Error:", err);
  }
};