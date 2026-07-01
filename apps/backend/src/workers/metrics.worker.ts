import { Worker } from "bullmq";
import IORedis from "ioredis";
import { logMetricsToDB } from "@/utils/metricsLogger";
import { connectDB } from "../lib/db";
import { dlqQueue } from "@/queues/dlq.queue";
import { analyzeMetricsBatch } from "@/modules/optimization/metrics.analyzer";
import { MetricsModel } from "@/models/metrics.model";
import { runOptimization } from "@/models/optimization/optimizer.controller";


import { analyzeAndOptimize } from "@/modules/optimization/metrics.analyzer";

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

const startWorker = async () => {
  await connectDB();
  console.log("Worker MongoDB Connected");

  const worker = new Worker(
    "metrics-queue",
    async (job) => {
      console.log("Processing job:", job.name);

      try {
        
        if (job.name === "log-metrics") {
          const { metrics, userId } = job.data;

          await logMetricsToDB(metrics, userId);

          console.log(" Metrics saved from worker");
        }

        
        else if (job.name === "auto-optimize") {
          const { metrics } = job.data;

          console.log("Running intelligent optimization...");

          
          const rawMetrics = await MetricsModel.find()
            .sort({ timestamp: -1 })
            .limit(100)
            .lean();

          
          const analysisList = analyzeMetricsBatch(rawMetrics);

          
          const endpointAnalysis = analysisList.find(
            (a) => a.endpoint === metrics.endpoint,
          );

          
          if (endpointAnalysis) {
            runOptimization(
              {
                endpoint: metrics.endpoint,
                issue: "Auto-detected from metrics",
                ruleSuggestion: "",
                aiSuggestion: "",
                priority: "Medium",
              },
              endpointAnalysis,
            );
          } else {
            
            analyzeAndOptimize(metrics);
          }
        }

        
        else {
          console.log("Unknown job type:", job.name);
        }
      } catch (error: unknown) {
        console.error(`Job failed (Attempt ${job.attemptsMade + 1})`, error);
        throw error;
      }
    },
    {
      connection,
    },
  );

  worker.on("failed", async (job, err) => {
    if (!job) return;

    if (job.attemptsMade === job.opts.attempts) {
      console.error(`Final failure: ${job.name}`, err);

      await dlqQueue.add("failed-job", {
        originalJob: job.name,
        data: job.data,
        error: err.message,
        failedAt: new Date().toISOString(),
      });

      console.log("Job moved to DLQ (FINAL)");
    }
  });

  worker.on("completed", (job) => {
    console.log(`Job completed: ${job.name}`);
  });

  console.log("Worker started...");
};

startWorker();
