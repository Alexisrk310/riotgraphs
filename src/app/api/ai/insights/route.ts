import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generatePlayerInsight, persistPlayerInsight } from "@/domain/ai/insights";
import { PlayerService } from "@/domain/lol/player.service";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  puuid: z.string().min(10),
  region: z.string().min(2),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_body", details: parsed.error.flatten() }, { status: 400 });
    }
    const { puuid, region } = parsed.data;

    const summary = await PlayerService.summary(puuid, region as any);
    if (!summary) {
      return NextResponse.json({ error: "player_not_found" }, { status: 404 });
    }
    const champs = await PlayerService.championStats(puuid);
    const games = (summary.soloWins ?? 0) + (summary.soloLosses ?? 0);
    const insight = await generatePlayerInsight({
      puuid: summary.puuid,
      gameName: summary.gameName,
      tier: summary.soloTier,
      rank: summary.soloRank,
      games,
      wins: summary.soloWins ?? 0,
      losses: summary.soloLosses ?? 0,
      avgKda: champs[0]?.kda ?? 0,
      avgCsPerMin: champs[0]?.csPerMin ?? 0,
      avgVisionScore: 0,
      avgGoldPerMin: 0,
      championStats: champs.map((c) => ({ championId: c.championId, games: c.games, winrate: c.winrate, kda: c.kda })),
      recentTrend: [],
    });
    await persistPlayerInsight(puuid, insight);
    return NextResponse.json(insight, {
      headers: { "cache-control": "private, max-age=0, must-revalidate" },
    });
  } catch (err) {
    logger.error({ err }, "ai insights route failed");
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
