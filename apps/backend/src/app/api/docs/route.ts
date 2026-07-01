import { NextRequest, NextResponse } from "next/server";
import { swaggerSpec } from "@/lib/swagger";

export async function GET(_req: NextRequest) {
  // Consume parameter to satisfy type requirements
  void _req;
  return NextResponse.json(swaggerSpec);
}