import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { redis } from "@/lib/redis";

export async function POST(_req: NextRequest) {
  // Consume parameter to satisfy type requirements
  void _req;
  if (!redis) {
    return NextResponse.json({
      success: false,
      message: "Redis not connected",
    });
  }

  await redis.flushall();

  return NextResponse.json({
    success: true,
    message: "Redis cleared ",
  });
}