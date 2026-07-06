import type { MatchV5Dto } from '@/games/lol/api';
import type { Platform, Routing } from '@/games/shared/routing';

export function normalizeLolMatch(dto: MatchV5Dto, platform: Platform, routing: Routing) {
  const info = dto.info;
  const gameVersion = info.gameVersion || '0.0.0';
  const patch = gameVersion.split('.').slice(0, 2).join('.');

  const match = {
    id: dto.metadata.matchId,
    gameId: BigInt(info.gameId),
    routing: routing.toUpperCase() as any,
    platform: platform as any,
    queueId: info.queueId,
    gameMode: info.gameMode,
    gameType: info.gameType,
    gameVersion,
    patch,
    mapId: info.mapId,
    gameStartMs: BigInt(info.gameStartTimestamp),
    gameDurationS: Math.round(info.gameDuration > 100000 ? info.gameDuration / 1000 : info.gameDuration),
    gameEndMs: info.gameEndTimestamp ? BigInt(info.gameEndTimestamp) : null,
    tournamentCode: info.tournamentCode ?? null,
    raw: dto as any,
  };

  const teams = info.teams.map((t) => ({
    matchId: match.id,
    teamId: t.teamId,
    win: t.win,
    bans: t.bans as any,
    objectives: t.objectives as any,
  }));

  const durationMin = Math.max(1, match.gameDurationS / 60);

  const participants = info.participants.map((p) => {
    const cs = (p.totalMinionsKilled ?? 0) + (p.neutralMinionsKilled ?? 0);
    return {
      matchId: match.id,
      summonerId: null as string | null,
      puuid: p.puuid,
      teamId: p.teamId,
      participantId: p.participantId,
      championId: p.championId,
      championName: p.championName,
      position: p.teamPosition || p.individualPosition || null,
      lane: p.lane || null,
      role: p.role || null,
      win: p.win,
      kills: p.kills,
      deaths: p.deaths,
      assists: p.assists,
      kda: (p.kills + p.assists) / Math.max(1, p.deaths),
      csTotal: cs,
      csPerMin: cs / durationMin,
      goldEarned: p.goldEarned,
      goldPerMin: p.goldEarned / durationMin,
      damageDealt: p.totalDamageDealt,
      damageDealtToChampions: p.totalDamageDealtToChampions,
      damageTaken: p.totalDamageTaken,
      visionScore: p.visionScore,
      wardsPlaced: p.wardsPlaced,
      wardsKilled: p.wardsKilled,
      controlWardsBought: p.visionWardsBoughtInGame ?? 0,
      summoner1Id: p.summoner1Id,
      summoner2Id: p.summoner2Id,
      items: [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6].filter(
        (i) => typeof i === 'number',
      ) as number[],
      perks: (p.perks ?? {}) as any,
      stats: p as any,
    };
  });

  return { match, teams, participants };
}
