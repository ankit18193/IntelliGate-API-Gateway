import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAggregatedMetrics } from "@/utils/metricsAggregator";
import { MetricsModel } from "@/models/metrics.model";
import { analyzeMetricsBatch } from "@/modules/optimization/metrics.analyzer";

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Get system metrics + AI optimization insights
 *     description: Returns aggregated API performance, health status, and AI-generated optimization suggestions
 *     tags:
 *       - Metrics
 *     responses:
 *       200:
 *         description: Metrics and AI insights fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 data:
 *                   type: object
 *                   properties:
 *                     all:
 *                       type: array
 *                       description: Complete metrics for all endpoints
 *                       items:
 *                         type: object
 *                         properties:
 *                           endpoint:
 *                             type: string
 *                             example: /api/gateway/public
 *                           totalRequests:
 *                             type: number
 *                             example: 10
 *                           errors:
 *                             type: number
 *                             example: 1
 *                           avgLatency:
 *                             type: number
 *                             example: 120
 *                           errorRate:
 *                             type: string
 *                             example: "10.00%"
 *                           health:
 *                             type: number
 *                             example: 85
 *                           status:
 *                             type: string
 *                             example: Good
 *
 *                     slow:
 *                       type: array
 *                       description: Endpoints with high latency (performance bottlenecks)
 *                       items:
 *                         type: object
 *                         properties:
 *                           endpoint:
 *                             type: string
 *                             example: /api/gateway/private
 *                           avgLatency:
 *                             type: number
 *                             example: 432
 *
 *                     top:
 *                       type: array
 *                       description: Most frequently accessed endpoints
 *                       items:
 *                         type: object
 *                         properties:
 *                           endpoint:
 *                             type: string
 *                             example: /api/gateway/public
 *                           totalRequests:
 *                             type: number
 *                             example: 120
 *
 *                     problematic:
 *                       type: array
 *                       description: Endpoints with high error rate or instability
 *                       items:
 *                         type: object
 *                         properties:
 *                           endpoint:
 *                             type: string
 *                             example: /api/gateway/private
 *                           errorRate:
 *                             type: string
 *                             example: "35.00%"
 *
 *                 analysis:
 *                   type: object
 *                   description: 🔥 AI-generated optimization insights
 *                   properties:
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "Enable caching for /api/gateway/private"
 *
 *                     riskLevel:
 *                       type: string
 *                       example: "medium"
 *
 *                     improvementScore:
 *                       type: number
 *                       example: 78
 *
 *             example:
 *               success: true
 *               data:
 *                 all:
 *                   - endpoint: "/api/gateway/public"
 *                     totalRequests: 10
 *                     errors: 1
 *                     avgLatency: 120
 *                     errorRate: "10.00%"
 *                     health: 85
 *                     status: "Good"
 *
 *               analysis:
 *                 suggestions:
 *                   - "Enable caching for /api/gateway/private"
 *                   - "Reduce latency for /api/gateway/public"
 *                 riskLevel: "medium"
 *                 improvementScore: 78
 *
 *       500:
 *         description: Failed to fetch metrics
 */

export async function GET() {

    await connectDB();

  const data = await getAggregatedMetrics();

   
  const rawMetrics = await MetricsModel.find()
    .sort({ timestamp: -1 })
    .limit(100)
    .lean();

   
  const analysis = analyzeMetricsBatch(rawMetrics);

  return NextResponse.json({
    success: true,
    data,
    analysis,  
  });
}
