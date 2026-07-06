import type { Job } from 'bullmq';
import { prisma } from '@/lib/prisma';
import { scoped } from '@/lib/logger';
import { AccountApi } from '@/games/riot/account';
import { LolSummonerApi, LolLeagueApi, LolMatchApi, LolMasteryApi } from '@/games/lol/api';
import { PLATFORM_TO_ROUTING, type Platform } from '@/games/shared/routing';
import { getQueue, QUEUE_NAMES } from '../queue';
import type { SyncMatchJobData } from './sync-match';

const log = scoped('worker:sync-player');

export interface SyncPlayerJobData {
  puuid?: string;
  gameName?: string;
  tagLine?: string;
  platform: Platform;
  syncMatches?: boolean;
  matchCount?: number;
}

export async function processSyncPlayer(job: Job<SyncPlayerJobData>) {
  const { platform, syncMatches = true, matchCount = 20 } = job.data;
  const routing = PLATFORM_TO_ROUTING[platform];

  const account = job.data.puuid
    ? await AccountApi.byPuuid(routing, job.data.puuid)
    : await AccountApi.byRiotId(routing, job.data.gameName!, job.data.tagLine!);

  const summoner = await LolSummonerApi.byPuuid(platform, account.puuid);

  const riotAccount = await prisma.riotAccount.upsert({
    where: { puuid: account.puuid },
    create: {
      puuid: account.puuid,
      gameName: account.gameName,
      tagLine: account.tagLine,
      routing: routing.toUpperCase() as any,
      region: platform as any,
      primaryGame: 'LOL',
    },
    update: {
      gameName: account.gameName,
      tagLine: account.tagLine,
      lastSyncedAt: new Date(),
    },
  });

  const summonerRow = await prisma.summoner.upsert({
    where: { region_puuid: { region: platform as any, puuid: summoner.puuid } },
    create: {
      riotAccountId: riotAccount.id,
      region: platform as any,
      summonerId: summoner.id,
      accountId: summoner.accountId,
      puuid: summoner.puuid,
      name: summoner.name,
      profileIconId: summoner.profileIconId,
      summonerLevel: summoner.summonerLevel,
      revisionDate: BigInt(summoner.revisionDate),
      lastSyncedAt: new Date(),
    },
    update: {
      name: summoner.name,
      profileIconId: summoner.profileIconId,
      summonerLevel: summoner.summonerLevel,
      revisionDate: BigInt(summoner.revisionDate),
      lastSyncedAt: new Date(),
    },
  });

  const [entries, masteries] = await Promise.all([
    LolLeagueApi.bySummoner(platform, summoner.id).catch(() => []),
    LolMasteryApi.top(platform, summoner.puuid, 10).catch(() => []),
  ]);

  for (const e of entries) {
    await prisma.leagueEntry.upsert({
      where: { summonerId_queueType: { summonerId: summonerRow.id, queueType: e.queueType } },
      create: {
        summonerId: summonerRow.id,
        queueType: e.queueType,
        tier: e.tier,
        rank: e.rank,
        leaguePoints: e.leaguePoints,
        wins: e.wins,
        losses: e.losses,
        veteran: e.veteran,
        inactive: e.inactive,
        freshBlood: e.freshBlood,
        hotStreak: e.hotStreak,
      },
      update: {
        tier: e.tier,
        rank: e.rank,
        leaguePoints: e.leaguePoints,
        wins: e.wins,
        losses: e.losses,
      },
    });
  }

  for (const m of masteries) {
    await prisma.championMastery.upsert({
      where: { summonerId_championId: { summonerId: summonerRow.id, championId: m.championId } },
      create: {
        summonerId: summonerRow.id,
        championId: m.championId,
        championLevel: m.championLevel,
        championPoints: m.championPoints,
        lastPlayTime: BigInt(m.lastPlayTime),
        championPointsSinceLastLevel: m.championPointsSinceLastLevel,
        championPointsUntilNextLevel: m.championPointsUntilNextLevel,
        chestGranted: m.chestGranted,
        tokensEarned: m.tokensEarned,
      },
      update: {
        championLevel: m.championLevel,
        championPoints: m.championPoints,
        lastPlayTime: BigInt(m.lastPlayTime),
      },
    });
  }

  if (syncMatches) {
    const ids = await LolMatchApi.idsByPuuid(routing, account.puuid, { count: matchCount });
    const queue = getQueue<SyncMatchJobData>(QUEUE_NAMES.syncMatch);
    for (const matchId of ids) {
      await queue.add(
        'sync-match',
        { matchId, platform, puuidHint: account.puuid },
        { jobId: `m:${matchId}`, priority: 5 },
      );
    }
    log.info({ puuid: account.puuid, queued: ids.length }, 'match ids queued');
  }

  return { puuid: account.puuid, summonerId: summoner.id };
}
