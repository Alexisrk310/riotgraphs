import { env } from '@/lib/env';
import { riotFetch } from '../shared/http';
import { VALORANT_HOSTS, type ValorantRouting } from '../shared/routing';

/**
 * Riot's public Valorant endpoints are limited to:
 *   - CONTENT-V1 (agent/map metadata)
 *   - RANKED-V1 (leaderboards for competitive)
 *   - STATUS-V1
 *
 * The full match-v1 endpoint requires a specific Valorant production key.
 * We keep the signature identical so that upgrading the key is a config-only change.
 */

export interface ValContentDTO {
  version: string;
  characters: { name: string; id: string; assetName: string }[];
  maps: { name: string; id: string; assetName: string }[];
  gameModes: { name: string; id: string }[];
  seasons: { name: string; id: string; type: string }[];
}

export interface ValLeaderboardDTO {
  shard: string;
  actId: string;
  totalPlayers: number;
  players: {
    puuid?: string;
    gameName?: string;
    tagLine?: string;
    leaderboardRank: number;
    rankedRating: number;
    numberOfWins: number;
    competitiveTier: number;
  }[];
}

export interface ValMatchDto {
  matchInfo: {
    matchId: string;
    mapId: string;
    gameLengthMillis: number;
    gameStartMillis: number;
    provisioningFlowId: string;
    isCompleted: boolean;
    queueId: string;
    gameMode: string;
    isRanked: boolean;
    seasonId: string;
  };
  players: {
    puuid: string;
    gameName: string;
    tagLine: string;
    teamId: string;
    partyId: string;
    characterId: string;
    stats: {
      score: number;
      roundsPlayed: number;
      kills: number;
      deaths: number;
      assists: number;
      playtimeMillis: number;
    };
    competitiveTier: number;
  }[];
  teams: { teamId: string; won: boolean; roundsPlayed: number; roundsWon: number }[];
  roundResults?: unknown[];
}

function key() {
  return env.RIOT_API_KEY_VALORANT || env.RIOT_API_KEY;
}

export const ValorantApi = {
  content(routing: ValorantRouting = 'na', locale?: string) {
    return riotFetch<ValContentDTO>({
      routing,
      host: VALORANT_HOSTS[routing],
      method: 'val-content-v1',
      path: `/val/content/v1/contents`,
      query: locale ? { locale } : {},
      apiKey: key(),
    });
  },
  leaderboard(routing: ValorantRouting, actId: string, size = 200, startIndex = 0) {
    return riotFetch<ValLeaderboardDTO>({
      routing,
      host: VALORANT_HOSTS[routing],
      method: 'val-ranked-v1',
      path: `/val/ranked/v1/leaderboards/by-act/${actId}`,
      query: { size, startIndex },
      apiKey: key(),
    });
  },
  matchById(routing: ValorantRouting, matchId: string) {
    return riotFetch<ValMatchDto>({
      routing,
      host: VALORANT_HOSTS[routing],
      method: 'val-match-v1',
      path: `/val/match/v1/matches/${matchId}`,
      apiKey: key(),
    });
  },
  matchListByPuuid(routing: ValorantRouting, puuid: string) {
    return riotFetch<{ history: { matchId: string; gameStartTimeMillis: number; queueId: string }[] }>(
      {
        routing,
        host: VALORANT_HOSTS[routing],
        method: 'val-match-v1',
        path: `/val/match/v1/matchlists/by-puuid/${puuid}`,
        apiKey: key(),
      },
    );
  },
  recentMatches(routing: ValorantRouting, queue: string) {
    return riotFetch<{ matchIds: string[] }>({
      routing,
      host: VALORANT_HOSTS[routing],
      method: 'val-match-v1',
      path: `/val/match/v1/recent-matches/by-queue/${queue}`,
      apiKey: key(),
    });
  },
};
