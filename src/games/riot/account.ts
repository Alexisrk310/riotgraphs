import { riotFetch } from '../shared/http';
import { ROUTING_HOSTS, type Routing } from '../shared/routing';

export interface AccountDTO {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export interface ActiveShardDTO {
  puuid: string;
  game: 'val' | 'lor';
  activeShard: string;
}

export const AccountApi = {
  byRiotId(routing: Routing, gameName: string, tagLine: string) {
    return riotFetch<AccountDTO>({
      routing,
      host: ROUTING_HOSTS[routing],
      method: 'account-v1',
      path: `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
        gameName,
      )}/${encodeURIComponent(tagLine)}`,
    });
  },

  byPuuid(routing: Routing, puuid: string) {
    return riotFetch<AccountDTO>({
      routing,
      host: ROUTING_HOSTS[routing],
      method: 'account-v1',
      path: `/riot/account/v1/accounts/by-puuid/${puuid}`,
    });
  },

  activeShard(routing: Routing, game: 'val' | 'lor', puuid: string) {
    return riotFetch<ActiveShardDTO>({
      routing,
      host: ROUTING_HOSTS[routing],
      method: 'account-v1',
      path: `/riot/account/v1/active-shards/by-game/${game}/by-puuid/${puuid}`,
    });
  },
};
