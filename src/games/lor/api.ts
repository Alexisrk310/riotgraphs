import { riotFetch } from '../shared/http';
import { ROUTING_HOSTS, type Routing } from '../shared/routing';

/** Legends of Runeterra — Match & Ranked (limited public surface). */
export const LorApi = {
  matchIdsByPuuid(routing: Routing, puuid: string) {
    return riotFetch<string[]>({
      routing,
      host: ROUTING_HOSTS[routing],
      method: 'lor-match-v1',
      path: `/lor/match/v1/matches/by-puuid/${puuid}/ids`,
    });
  },
  matchById(routing: Routing, matchId: string) {
    return riotFetch<unknown>({
      routing,
      host: ROUTING_HOSTS[routing],
      method: 'lor-match-v1',
      path: `/lor/match/v1/matches/${matchId}`,
    });
  },
  leaderboards(routing: Routing) {
    return riotFetch<unknown>({
      routing,
      host: ROUTING_HOSTS[routing],
      method: 'lor-ranked-v1',
      path: `/lor/ranked/v1/leaderboards`,
    });
  },
};

/** Wild Rift — no public API yet; stub kept for module symmetry. */
export const WildRiftApi = {
  isSupported: false,
  ping() {
    return { supported: false, message: 'Wild Rift has no public Riot API endpoints yet.' };
  },
};
