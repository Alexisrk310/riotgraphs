import { NextResponse } from "next/server";
import { RankingService } from "@/domain/lol/ranking.service";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const revalidate = 300;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const patch = url.searchParams.get("patch") ?? "14.24";
    const role = url.searchParams.get("role") ?? "ALL";
    const tier = url.searchParams.get("tier") ?? "PLATINUM_PLUS";
    const region = url.searchParams.get("region") ?? "ALL";
    const list = await RankingService.tierList(patch, role, tier, region);
    return NextResponse.json({ patch, role, tier, region, list });
  } catch (err) {
    logger.error({ err }, "tier-list route failed");
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
