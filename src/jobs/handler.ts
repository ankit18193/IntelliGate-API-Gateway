import { runOptimizationJob } from "./optimization.job";


export const optimizeJob = async (_event: unknown, _context: unknown): Promise<void> => {
  await runOptimizationJob();
};