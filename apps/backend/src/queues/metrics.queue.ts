import { Queue } from "bullmq";
import { redis } from "@/lib/redis";


export const metricsQueue = new Queue("metrics-queue", {
  connection: {
    host: "127.0.0.1",
    port: 6379,
  },
});