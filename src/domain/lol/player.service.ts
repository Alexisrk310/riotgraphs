import { prisma } from '@/lib/prisma';
import { cacheGetOrSet } from '@/lib/redis';
import { AccountApi } from '@/games/riot/account';
import { PLATFORM_TO_ROUTING, type Platform } from '@/games/shared/routing';
import { getQueue, QUEUE_NAMES } from '@/workers/queue';
import type { SyncPlayerJobData } from '@/workers/handlers/sync-player';

export interface PlayerSummary {
  puuid: string;
  gameName: string;
  tagLine: string;
  region: Platform;
  summonerLevel: number;
  profileIconId: number;
  soloTier?: string;
  soloRank?: string;
  soloLP?: number;
  soloWins?: number;
  soloLosses?: number;
  soloWinrate?: number;
  flexTier?: string;
  lastSyncedAt?: Date | null;
}

export const PlayerService = {
  async findOrCreate(gameName: string, tagLine: string, platform: Platform) {
    const routing = PLATFORM_TO_ROUTING[platform];
    const cacheKey = `player:lookup:${platform}:${gameName}:${tagLine}`.toLowerCase();
    const account = await cacheGetOrSet(cacheKey, 300, () =>
      AccountApi.byRiotId(routing, gameName, tagLine),
    );

    const summoner = await prisma.summoner.findFirst({
      where: { region: platform as any, puuid: account.puuid },
      include: { leagueEntries: true, riotAccount: true },
    });

    // Schedule background sync (idempotent)
    await getQueue<SyncPlayerJobData>(QUEUE_NAMES.syncPlayer).add(
      'sync-player',
      { puuid: account.puuid, platform, syncMatches: true, matchCount: 20 },
      { jobId: `p:${platform}:${account.puuid}`, priority: 10 },
    );

    return { account, summoner };
  },

  async summary(puuid: string, platform: Platform): Promise<PlayerSummary | null> {
    const s = await prisma.summoner.findFirst({
      where: { region: platform as any, puuid },
      include: { leagueEntries: true, riotAccount: true },
    });
    if (!s) return null;

    const solo = s.leagueEntries.find((e) => e.queueType === 'RANKED_SOLO_5x5');
    const flex = s.leagueEntries.find((e) => e.queueType === 'RANKED_FLEX_SR');
    const soloWinrate = solo ? solo.wins / Math.max(1, solo.wins + solo.losses) : undefined;

    return {
      puuid: s.puuid,
      gameName: s.riotAccount?.gameName ?? s.name,
      tagLine: s.riotAccount?.tagLine ?? '',
      region: s.region as Platform,
      summonerLevel: s.summonerLevel,
      profileIconId: s.profileIconId,
      soloTier: solo?.tier,
      soloRank: solo?.rank,
      soloLP: solo?.leaguePoints,
      soloWins: solo?.wins,
      soloLosses: solo?.losses,
      soloWinrate,
      flexTier: flex?.tier,
      lastSyncedAt: s.lastSyncedAt,
    };
  },

  async recentMatches(puuid: string, limit = 20) {
    return prisma.matchParticipant.findMany({
      where: { puuid },
      take: limit,
      orderBy: { match: { gameStartMs: 'desc' } },
      include: { match: { include: { participants: true, teams: true } } },
    });
  },

  async championStats(puuid: string) {
    const rows = await prisma.matchParticipant.groupBy({
      by: ['championId'],
      where: { puuid },
      _count: { _all: true },
      _sum: { kills: true, deaths: true, assists: true, goldEarned: true },
      _avg: { kda: true, csPerMin: true, damageDealtToChampions: true },
    });
    // Winrate needs separate query
    const wins = await prisma.matchParticipant.groupBy({
      by: ['championId'],
      where: { puuid, win: true },
      _count: { _all: true },
    });
    const winMap = new Map(wins.map((w) => [w.championId, w._count._all]));

    return rows
      .map((r) => ({
        championId: r.championId,
        games: r._count._all,
        wins: winMap.get(r.championId) ?? 0,
        winrate: (winMap.get(r.championId) ?? 0) / Math.max(1, r._count._all),
        kda: r._avg.kda ?? 0,
        csPerMin: r._avg.csPerMin ?? 0,
        damage: r._avg.damageDealtToChampions ?? 0,
      }))
      .sort((a, b) => b.games - a.games);
  },
};
