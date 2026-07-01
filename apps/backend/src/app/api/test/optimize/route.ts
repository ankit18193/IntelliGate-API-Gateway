import { NextResponse } from "next/server";
import { runOptimization } from "@/models/optimization/optimizer.controller";
import { getConfig } from "@/config/optimization.config";

export async function GET() {
  runOptimization({
    endpoint: "/api/gateway/public",
    issue: "High latency",
    ruleSuggestion: "Enable caching",
    aiSuggestion: "Use Redis caching",
  });

  const config = getConfig("/api/gateway/public");

  console.log(" CONFIG AFTER OPTIMIZATION:", config);

  return NextResponse.json({
    message: "Optimization triggered ",
    config,
  });
}