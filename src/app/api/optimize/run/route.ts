import { NextRequest, NextResponse } from "next/server";
import { MetricsModel } from "@/models/metrics.model";
import { analyzeMetricsBatch } from "@/modules/optimization/metrics.analyzer";
import { decideFromAnalysis } from "@/models/optimization/decision.engine";
import { executeDecision } from "@/models/optimization/executor";

import { AnalysisModel } from "@/models/analysis.model";
import { smartDecision } from "@/models/optimization/decision.engine";


import { connectDB } from "@/lib/db"; 


export const runtime = "nodejs";

/**
 * @swagger
 * /api/optimize/run:
 *   post:
 *     summary: Trigger Auto-Optimization Engine
 *     description: |
 *       Analyzes recent metrics and automatically applies infrastructure optimizations.
 *
 *        **Intelligence Flow**:
 *       1. **Observe**: Collects latest system metrics from MongoDB.
 *       2. **Analyze**: AI evaluates traffic, latency, and error rates.
 *       3. **Decide**: Rules engine maps AI insights to concrete system actions.
 *       4. **Act**: Executes live configuration changes (e.g., dynamic rate limits, caching).
 *
 *     tags:
 *       - Optimization
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Optimization cycle executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     analysis:
 *                       type: object
 *                       description: AI generated insights
 *                       example:
 *                         severity: MEDIUM
 *                         signals:
 *                           highTraffic: true
 *                           slow: false
 *
 *                     decisions:
 *                       type: object
 *                       description: Mapped system actions
 *                       example:
 *                         action: INCREASE_RATE_LIMIT
 *                         target: /api/gateway/private
 *                         metadata:
 *                           increment: 20
 *
 *                     execution:
 *                       type: array
 *                       description: Results of applied optimizations
 *                       items:
 *                         type: object
 *                       example:
 *                         - endpoint: /api/gateway/private
 *                           action: INCREASE_RATE_LIMIT
 *                           impact: IMPROVED
 *
 *       400:
 *         description: No metrics available to analyze
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       500:
 *         description: Optimization execution failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    
    await connectDB();

    
    const rawMetrics = await MetricsModel.find()
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();

    if (!rawMetrics.length) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "No metrics available",
            code: 400,
          },
        },
        { status: 400 }
      );
    }

    
    const analysis = await analyzeMetricsBatch(rawMetrics);

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

    
    const primaryAnalysis = analysisArray[0];
    
   
    const decision = await smartDecision(primaryAnalysis);

    if (!decision) {
      return NextResponse.json({
        success: true,
        data: {
          message: "No optimization needed based on historical trends. Gathering more data.",
          analysis: primaryAnalysis,
        },
      });
    }

    
    await executeDecision(decision);

    
    return NextResponse.json({
      success: true,
      data: {
        analysis,
        decision,
        execution: "applied",
      },
    });

  } catch (err: unknown) {
    console.error("Optimization Error:", err);

    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            err instanceof Error ? err.message : "Optimization failed",
          code: 500,
        },
      },
      { status: 500 }
    );
  }
}