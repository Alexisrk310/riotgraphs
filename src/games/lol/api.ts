import { riotFetch } from '../shared/http';
import { PLATFORM_HOSTS, ROUTING_HOSTS, type Platform, type Routing } from '../shared/routing';

// ─────────────────────────────────────────────────────────────
// Summoner-V4
// ─────────────────────────────────────────────────────────────

export interface SummonerDTO {
  id: string;
  accountId: string;
  puuid: string;
  name: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

export const LolSummonerApi = {
  byPuuid(platform: Platform, puuid: string) {
    return riotFetch<SummonerDTO>({
      routing: platform,
      host: PLATFORM_HOSTS[platform],
      method: 'summoner-v4',
      path: `/lol/summoner/v4/summoners/by-puuid/${puuid}`,
    });
  },
  byName(platform: Platform, name: string) {
    return riotFetch<SummonerDTO>({
      routing: platform,
      host: PLATFORM_HOSTS[platform],
      method: 'summoner-v4',
      path: `/lol/summoner/v4/summoners/by-name/${encodeURIComponent(name)}`,
    });
  },
};

// ─────────────────────────────────────────────────────────────
// League-V4
// ─────────────────────────────────────────────────────────────

export interface LeagueEntryDTO {
  leagueId: string;
  queueType: string;
  tier: string;
  rank: string;
  summonerId: string;
  summonerName?: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  veteran: boolean;
  inactive: boolean;
  freshBlood: boolean;
  hotStreak: boolean;
}

export const LolLeagueApi = {
  bySummoner(platform: Platform, summonerId: string) {
    return riotFetch<LeagueEntryDTO[]>({
      routing: platform,
      host: PLATFORM_HOSTS[platform],
      method: 'league-v4',
      path: `/lol/league/v4/entries/by-summoner/${summonerId}`,
    });
  },
  challenger(platform: Platform, queue: 'RANKED_SOLO_5x5' | 'RANKED_FLEX_SR' = 'RANKED_SOLO_5x5') {
    return riotFetch<unknown>({
      routing: platform,
      host: PLATFORM_HOSTS[platform],
      method: 'league-v4',
      path: `/lol/league/v4/challengerleagues/by-queue/${queue}`,
    });
  },
  grandmaster(platform: Platform, queue: 'RANKED_SOLO_5x5' | 'RANKED_FLEX_SR' = 'RANKED_SOLO_5x5') {
    return riotFetch<unknown>({
      routing: platform,
      host: PLATFORM_HOSTS[platform],
      method: 'league-v4',
      path: `/lol/league/v4/grandmasterleagues/by-queue/${queue}`,
    });
  },
  master(platform: Platform, queue: 'RANKED_SOLO_5x5' | 'RANKED_FLEX_SR' = 'RANKED_SOLO_5x5') {
    return riotFetch<unknown>({
      routing: platform,
      host: PLATFORM_HOSTS[platform],
      method: 'league-v4',
      path: `/lol/league/v4/masterleagues/by-queue/${queue}`,
    });
  },
};

// ─────────────────────────────────────────────────────────────
// Match-V5
// ─────────────────────────────────────────────────────────────

export interface MatchListParams {
  startTime?: number;
  endTime?: number;
  queue?: number;
  type?: 'ranked' | 'normal' | 'tourney' | 'tutorial';
  start?: number;
  count?: number;
}

export const LolMatchApi = {
  idsByPuuid(routing: Routing, puuid: string, params: MatchListParams = {}) {
    return riotFetch<string[]>({
      routing,
      host: ROUTING_HOSTS[routing],
      method: 'match-v5',
      path: `/lol/match/v5/matches/by-puuid/${puuid}/ids`,
      query: { ...params, count: params.count ?? 20 },
    });
  },
  byId(routing: Routing, matchId: string) {
    return riotFetch<MatchV5Dto>({
      routing,
      host: ROUTING_HOSTS[routing],
      method: 'match-v5',
      path: `/lol/match/v5/matches/${matchId}`,
    });
  },
  timeline(routing: Routing, matchId: string) {
    return riotFetch<MatchTimelineDto>({
      routing,
      host: ROUTING_HOSTS[routing],
      method: 'match-v5',
      path: `/lol/match/v5/matches/${matchId}/timeline`,
    });
  },
};

// ─────────────────────────────────────────────────────────────
// Champion Mastery
// ─────────────────────────────────────────────────────────────

export interface ChampionMasteryDTO {
  puuid: string;
  championId: number;
  championLevel: number;
  championPoints: number;
  lastPlayTime: number;
  championPointsSinceLastLevel: number;
  championPointsUntilNextLevel: number;
  chestGranted: boolean;
  tokensEarned: number;
}

export const LolMasteryApi = {
  byPuuid(platform: Platform, puuid: string) {
    return riotFetch<ChampionMasteryDTO[]>({
      routing: platform,
      host: PLATFORM_HOSTS[platform],
      method: 'champion-mastery-v4',
      path: `/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`,
    });
  },
  top(platform: Platform, puuid: string, count = 3) {
    return riotFetch<ChampionMasteryDTO[]>({
      routing: platform,
      host: PLATFORM_HOSTS[platform],
      method: 'champion-mastery-v4',
      path: `/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top`,
      query: { count },
    });
  },
};

// ─────────────────────────────────────────────────────────────
// Spectator V5
// ─────────────────────────────────────────────────────────────

export const LolSpectatorApi = {
  active(platform: Platform, puuid: string) {
    return riotFetch<unknown>({
      routing: platform,
      host: PLATFORM_HOSTS[platform],
      method: 'spectator-v5',
      path: `/lol/spectator/v5/active-games/by-summoner/${puuid}`,
    });
  },
  featured(platform: Platform) {
    return riotFetch<unknown>({
      routing: platform,
      host: PLATFORM_HOSTS[platform],
      method: 'spectator-v5',
      path: `/lol/spectator/v5/featured-games`,
    });
  },
};

// Minimal DTO surface (Match-V5 is huge — we type only what we consume)
export interface MatchV5Dto {
  metadata: { matchId: string; participants: string[]; dataVersion: string };
  info: {
    gameId: number;
    gameMode: string;
    gameType: string;
    gameVersion: string;
    mapId: number;
    platformId: string;
    queueId: number;
    gameStartTimestamp: number;
    gameDuration: number;
    gameEndTimestamp?: number;
    tournamentCode?: string;
    teams: MatchTeamDto[];
    participants: MatchParticipantDto[];
  };
}
export interface MatchTeamDto {
  teamId: number;
  win: boolean;
  bans: { championId: number; pickTurn: number }[];
  objectives: Record<string, { first: boolean; kills: number }>;
}
export interface MatchParticipantDto {
  puuid: string;
  summonerId?: string;
  summonerName?: string;
  championId: number;
  championName: string;
  teamId: number;
  teamPosition: string;
  individualPosition: string;
  lane: string;
  role: string;
  participantId: number;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  goldEarned: number;
  totalDamageDealt: number;
  totalDamageDealtToChampions: number;
  totalDamageTaken: number;
  visionScore: number;
  wardsPlaced: number;
  wardsKilled: number;
  visionWardsBoughtInGame: number;
  summoner1Id: number;
  summoner2Id: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  perks: unknown;
  [k: string]: unknown;
}
export interface MatchTimelineDto {
  metadata: { matchId: string; participants: string[] };
  info: { frames: unknown[]; frameInterval: number };
}
