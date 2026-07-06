import type { Job } from 'bullmq';
import { prisma } from '@/lib/prisma';
import { scoped } from '@/lib/logger';
import { LolLeagueApi } from '@/games/lol/api';
import type { Platform } from '@/games/shared/routing';

const log = scoped('worker:sync-ladder');

export interface SyncLadderJobData {
  platform: Platform;
  tier: 'CHALLENGER' | 'GRANDMASTER' | 'MASTER';
  queue?: 'RANKED_SOLO_5x5' | 'RANKED_FLEX_SR';
}

export async function processSyncLadder(job: Job<SyncLadderJobData>) {
  const { platform, tier, queue = 'RANKED_SOLO_5x5' } = job.data;
  const fn =
    tier === 'CHALLENGER'
      ? LolLeagueApi.challenger
      : tier === 'GRANDMASTER'
        ? LolLeagueApi.grandmaster
        : LolLeagueApi.master;

  const ladder = (await fn(platform, queue)) as {
    tier: string;
    queue: string;
    name: string;
    entries: {
      summonerId: string;
      leaguePoints: number;
      rank: string;
      wins: number;
      losses: number;
      veteran: boolean;
      inactive: boolean;
      freshBlood: boolean;
      hotStreak: boolean;
    }[];
  };

  await prisma.leaderboard.upsert({
    where: {
      game_scope_queueId_page: { game: 'LOL', scope: `REGION:${platform}`, queueId: queue, page: 1 },
    },
    create: {
      game: 'LOL',
      scope: `REGION:${platform}`,
      queueId: queue,
      page: 1,
      entries: ladder.entries.slice(0, 300) as any,
    },
    update: { entries: ladder.entries.slice(0, 300) as any },
  });

  log.info({ platform, tier, count: ladder.entries.length }, 'ladder synced');
  return { platform, tier, count: ladder.entries.length };
}
