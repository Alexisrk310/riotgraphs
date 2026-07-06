import { riotFetch } from '../shared/http';
import { PLATFORM_HOSTS, ROUTING_HOSTS, type Platform, type Routing } from '../shared/routing';

export interface TftSummonerDTO {
  id: string;
  accountId: string;
  puuid: string;
  name: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

export interface TftLeagueEntryDTO {
  leagueId: string;
  queueType: string;
  tier: string;
  rank: string;
  summonerId: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  veteran: boolean;
  inactive: boolean;
  freshBlood: boolean;
  hotStreak: boolean;
}

export interface TftMatchDto {
  metadata: { data_version: string; match_id: string; participants: string[] };
  info: {
    game_datetime: number;
    game_length: number;
    game_version: string;
    queue_id: number;
    tft_game_type: string;
    tft_set_core_name: string;
    tft_set_number: number;
    participants: TftMatchParticipantDto[];
  };
}

export interface TftMatchParticipantDto {
  puuid: string;
  placement: number;
  level: number;
  gold_left: number;
  last_round: number;
  players_eliminated: number;
  time_eliminated: number;
  total_damage_to_players: number;
  companion: unknown;
  traits: { name: string; num_units: number; style: number; tier_current: number }[];
  units: {
    character_id: string;
    itemNames: string[];
    rarity: number;
    tier: number;
  }[];
  augments: string[];
}

export const TftApi = {
  summonerByPuuid(platform: Platform, puuid: string) {
    return riotFetch<TftSummonerDTO>({
      routing: platform,
      host: PLATFORM_HOSTS[platform],
      method: 'summoner-v4',
      path: `/tft/summoner/v1/summoners/by-puuid/${puuid}`,
    });
  },
  leagueBySummoner(platform: Platform, summonerId: string) {
    return riotFetch<TftLeagueEntryDTO[]>({
      routing: platform,
      host: PLATFORM_HOSTS[platform],
      method: 'league-v4',
      path: `/tft/league/v1/entries/by-summoner/${summonerId}`,
    });
  },
  matchIdsByPuuid(routing: Routing, puuid: string, count = 20) {
    return riotFetch<string[]>({
      routing,
      host: ROUTING_HOSTS[routing],
      method: 'tft-match-v1',
      path: `/tft/match/v1/matches/by-puuid/${puuid}/ids`,
      query: { count },
    });
  },
  matchById(routing: Routing, matchId: string) {
    return riotFetch<TftMatchDto>({
      routing,
      host: ROUTING_HOSTS[routing],
      method: 'tft-match-v1',
      path: `/tft/match/v1/matches/${matchId}`,
    });
  },
};
