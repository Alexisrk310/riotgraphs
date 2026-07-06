import { prisma } from '@/lib/prisma';

/**
 * ComparisonService — side-by-side stats for 2..5 players.
 * Uses PostgreSQL aggregates for freshness; ClickHouse for large ranges.
 */
export const ComparisonService = {
  async compare(puuids: string[]) {
    const results = await Promise.all(
      puuids.map(async (puuid) => {
        const [participations, summoner] = await Promise.all([
          prisma.matchParticipant.aggregate({
            where: { puuid },
            _count: { _all: true },
            _avg: { kda: true, csPerMin: true, goldPerMin: true, visionScore: true, damageDealtToChampions: true },
            _sum: { kills: true, deaths: true, assists: true },
          }),
          prisma.summoner.findFirst({
            where: { puuid },
            include: { leagueEntries: true, riotAccount: true },
          }),
        ]);
        const wins = await prisma.matchParticipant.count({ where: { puuid, win: true } });
        const games = participations._count._all;
        const solo = summoner?.leagueEntries.find((e) => e.queueType === 'RANKED_SOLO_5x5');

        return {
          puuid,
          name: summoner?.riotAccount?.gameName ?? summoner?.name ?? 'Unknown',
          tag: summoner?.riotAccount?.tagLine ?? '',
          tier: solo?.tier,
          rank: solo?.rank,
          lp: solo?.leaguePoints,
          games,
          wins,
          winrate: games ? wins / games : 0,
          kda: participations._avg.kda ?? 0,
          csPerMin: participations._avg.csPerMin ?? 0,
          goldPerMin: participations._avg.goldPerMin ?? 0,
          vision: participations._avg.visionScore ?? 0,
          damage: participations._avg.damageDealtToChampions ?? 0,
          kills: participations._sum.kills ?? 0,
          deaths: participations._sum.deaths ?? 0,
          assists: participations._sum.assists ?? 0,
        };
      }),
    );
    return results;
  },
};
