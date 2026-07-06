import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = {};
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.postgres = "ok";
  } catch {
    checks.postgres = "down";
  }
  try {
    await redis.ping();
    checks.redis = "ok";
  } catch {
    checks.redis = "down";
  }
  const ok = Object.values(checks).every((v) => v === "ok");
  return NextResponse.json({ ok, checks }, { status: ok ? 200 : 503 });
}
