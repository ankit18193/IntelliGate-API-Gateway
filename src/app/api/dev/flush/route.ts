import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET() {
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