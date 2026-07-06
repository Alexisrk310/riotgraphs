import { prisma } from '@/lib/prisma';
import { cacheGetOrSet } from '@/lib/redis';

export const RankingService = {
  async tierList(patch: string, role = 'ALL', tier = 'ALL', region = 'ALL') {
    return cacheGetOrSet(`tier:LOL:${patch}:${role}:${tier}:${region}`, 900, async () => {
      const rows = await prisma.championStats.findMany({
        where: { game: 'LOL', patch, role, tier, region },
        orderBy: { tierScore: 'desc' },
      });
      return rows;
    });
  },

  async leaderboard(scope: string, queueId = 'RANKED_SOLO_5x5', page = 1) {
    return cacheGetOrSet(`ladder:LOL:${scope}:${queueId}:${page}`, 300, async () => {
      const row = await prisma.leaderboard.findFirst({
        where: { game: 'LOL', scope, queueId, page },
      });
      return row?.entries ?? [];
    });
  },

  async topByChampion(championId: number, limit = 100) {
    return cacheGetOrSet(`top:champ:${championId}:${limit}`, 900, async () => {
      const rows = await prisma.$queryRaw<
        { puuid: string; games: bigint; wins: bigint; kda: number }[]
      >`
        SELECT puuid, COUNT(*)::bigint AS games,
               SUM(CASE WHEN win THEN 1 ELSE 0 END)::bigint AS wins,
               AVG(kda) AS kda
          FROM "MatchParticipant"
         WHERE "championId" = ${championId}
         GROUP BY puuid
        HAVING COUNT(*) >= 5
         ORDER BY (SUM(CASE WHEN win THEN 1 ELSE 0 END)::float / COUNT(*)) DESC
         LIMIT ${limit}`;
      return rows.map((r) => ({
        puuid: r.puuid,
        games: Number(r.games),
        wins: Number(r.wins),
        winrate: Number(r.wins) / Math.max(1, Number(r.games)),
        kda: r.kda,
      }));
    });
  },
};
