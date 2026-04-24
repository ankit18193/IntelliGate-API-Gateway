import { NextResponse } from "next/server";
import { DecisionModel } from "@/models/decision.model";
import { connectDB } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  try {
    await connectDB();

    const decisions = await DecisionModel.find()
      .sort({ timestamp: -1 })
      .limit(20)
      .lean();

    return NextResponse.json(
      { success: true, data: decisions },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("🔥 Decisions API Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch decisions", code: 500 } },
      { status: 500 }
    );
  }
}