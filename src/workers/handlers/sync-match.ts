import type { Job } from 'bullmq';
import { prisma } from '@/lib/prisma';
import { scoped } from '@/lib/logger';
import { LolMatchApi } from '@/games/lol/api';
import { normalizeLolMatch } from '@/domain/lol/normalizer';
import { PLATFORM_TO_ROUTING, type Platform } from '@/games/shared/routing';
import { clickhouse } from '@/lib/clickhouse';

const log = scoped('worker:sync-match');

export interface SyncMatchJobData {
  matchId: string;
  platform: Platform;
  puuidHint?: string;
}

export async function processSyncMatch(job: Job<SyncMatchJobData>) {
  const { matchId, platform } = job.data;
  const existing = await prisma.match.findUnique({ where: { id: matchId } });
  if (existing) return { skipped: true };

  const routing = PLATFORM_TO_ROUTING[platform];
  const dto = await LolMatchApi.byId(routing, matchId);

  const { match, teams, participants } = normalizeLolMatch(dto, platform, routing);

  await prisma.$transaction(async (tx) => {
    await tx.match.upsert({
      where: { id: match.id },
      create: match,
      update: {},
    });
    for (const t of teams) {
      await tx.matchTeam.upsert({
        where: { matchId_teamId: { matchId: match.id, teamId: t.teamId } },
        create: t,
        update: {},
      });
    }
    if (participants.length) {
      await tx.matchParticipant.createMany({ data: participants, skipDuplicates: true });
    }
  });

  // Fire-and-forget analytics insert (safe if ClickHouse is offline)
  try {
    await clickhouse.insert(
      'lol_participants',
      participants.map((p) => ({
        match_id: p.matchId,
        puuid: p.puuid,
        summoner_id: p.summonerId ?? '',
        platform,
        routing,
        queue_id: match.queueId,
        patch: match.patch,
        game_start: new Date(Number(match.gameStartMs)).toISOString(),
        game_duration_s: match.gameDurationS,
        tier: 'ALL',
        division: '',
        champion_id: p.championId,
        role: p.position ?? '',
        lane: p.lane ?? '',
        team_id: p.teamId,
        win: p.win ? 1 : 0,
        kills: p.kills,
        deaths: p.deaths,
        assists: p.assists,
        kda: p.kda,
        cs_total: p.csTotal,
        cs_per_min: p.csPerMin,
        gold_earned: p.goldEarned,
        gold_per_min: p.goldPerMin,
        damage_champions: p.damageDealtToChampions,
        damage_taken: p.damageTaken,
        vision_score: p.visionScore,
        wards_placed: p.wardsPlaced,
        wards_killed: p.wardsKilled,
        first_blood: 0,
        first_tower: 0,
        items: p.items,
        perks_primary: 0,
        perks_sub: 0,
        summoner_spells: [p.summoner1Id, p.summoner2Id],
        region: platform,
        country: '',
      })),
    );
  } catch (err) {
    log.warn({ err: (err as Error).message }, 'ClickHouse insert skipped');
  }

  return { matchId, participants: participants.length };
}
