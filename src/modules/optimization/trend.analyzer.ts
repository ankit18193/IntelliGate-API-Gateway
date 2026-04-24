import { AnalysisModel } from "@/models/analysis.model";

export const analyzeTrends = async (endpoint: string) => {
  const history = await AnalysisModel.find({ endpoint })
    .sort({ timestamp: -1 })
    .limit(20)
    .lean();

  if (!history || history.length === 0) return null;

  let slowCount = 0;
  let errorCount = 0;
  let trafficCount = 0;

  history.forEach((h) => {
    if (h.signals?.slow) slowCount++;
    if (h.signals?.errorProne) errorCount++;
    if (h.signals?.highTraffic) trafficCount++;
  });

  return {
    endpoint,
    slowTrend: slowCount > 5,
    errorTrend: errorCount > 3,
    trafficTrend: trafficCount > 5,
  };
};