import type { Job } from 'bullmq';
import { clickhouse } from '@/lib/clickhouse';
import { prisma } from '@/lib/prisma';
import { scoped } from '@/lib/logger';

const log = scoped('worker:aggregate-champion');

export interface AggregateChampionJobData {
  patch: string;
  tier?: string;
  role?: string;
}

/**
 * Reads ClickHouse aggregates for the given patch and materialises them into
 * `ChampionStats` in PostgreSQL for fast tier list rendering.
 */
export async function processAggregateChampion(job: Job<AggregateChampionJobData>) {
  const { patch, tier = 'ALL', role = 'ALL' } = job.data;

  const rows = await clickhouse.query<{
    champion_id: number;
    games: number;
    wins: number;
    kills_sum: number;
    deaths_sum: number;
    assists_sum: number;
  }>(
    `SELECT champion_id,
            sum(games) AS games,
            sum(wins) AS wins,
            sum(kills_sum) AS kills_sum,
            sum(deaths_sum) AS deaths_sum,
            sum(assists_sum) AS assists_sum
       FROM lol_champion_agg
      WHERE patch = '${patch.replace(/'/g, '')}'
        ${tier !== 'ALL' ? `AND tier = '${tier}'` : ''}
        ${role !== 'ALL' ? `AND role = '${role}'` : ''}
      GROUP BY champion_id`,
  ).catch(() => []);

  const totalGames = rows.reduce((s, r) => s + Number(r.games), 0) || 1;

  for (const r of rows) {
    const winRate = Number(r.wins) / Math.max(1, Number(r.games));
    const pickRate = Number(r.games) / totalGames;
    const kda = (Number(r.kills_sum) + Number(r.assists_sum)) / Math.max(1, Number(r.deaths_sum));
    // Tier score: winRate anchored at 50%, weighted by log(games).
    const tierScore = (winRate - 0.5) * 100 + Math.log10(Number(r.games) + 1) * 2;
    const tierLabel =
      tierScore > 4 ? 'S+' : tierScore > 2 ? 'S' : tierScore > 0.5 ? 'A' : tierScore > -0.5 ? 'B' : tierScore > -2 ? 'C' : 'D';

    await prisma.championStats.upsert({
      where: {
        game_championId_patch_tier_role_region: {
          game: 'LOL',
          championId: r.champion_id,
          patch,
          tier,
          role,
          region: 'ALL',
        },
      },
      create: {
        game: 'LOL',
        championId: r.champion_id,
        patch,
        tier,
        role,
        region: 'ALL',
        games: Number(r.games),
        wins: Number(r.wins),
        bans: 0,
        picks: Number(r.games),
        winRate,
        pickRate,
        banRate: 0,
        avgKda: kda,
        tierScore,
        tierLabel,
      },
      update: {
        games: Number(r.games),
        wins: Number(r.wins),
        winRate,
        pickRate,
        avgKda: kda,
        tierScore,
        tierLabel,
      },
    });
  }

  log.info({ patch, tier, role, champions: rows.length }, 'champion aggregates refreshed');
  return { champions: rows.length };
}
