import { env } from '@/lib/env';
import { scoped } from '@/lib/logger';
import { acquire, honorRetryAfter } from './rate-limiter';

const log = scoped('riot-http');

export interface RiotFetchOptions {
  routing: string;               // routing cluster or platform host key
  host: string;                  // resolved hostname
  method: string;                // method key for rate limit bucket
  path: string;                  // /lol/summoner/v4/summoners/by-puuid/{puuid}
  query?: Record<string, string | number | boolean | undefined>;
  apiKey?: string;               // override key (e.g. Valorant)
  signal?: AbortSignal;
  retries?: number;
}

export class RiotApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public path: string,
  ) {
    super(message);
    this.name = 'RiotApiError';
  }
}

export async function riotFetch<T>(opts: RiotFetchOptions): Promise<T> {
  const { routing, host, method, path, query, apiKey, signal } = opts;
  const key = apiKey ?? env.RIOT_API_KEY;
  const url = new URL(`https://${host}${path}`);
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v !== undefined) url.searchParams.set(k, String(v));
  }

  const maxRetries = opts.retries ?? 4;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    await acquire(routing, method);

    const res = await fetch(url.toString(), {
      headers: {
        'X-Riot-Token': key,
        Accept: 'application/json',
        'User-Agent': 'RiotGraphs/1.0 (+https://riotgraphs.gg)',
      },
      signal,
    });

    if (res.status === 429) {
      const retry = Number(res.headers.get('Retry-After') ?? 1);
      await honorRetryAfter(retry);
      continue;
    }

    if (res.status === 404) {
      throw new RiotApiError('Not Found', 404, path);
    }

    if (res.status >= 500 && attempt < maxRetries) {
      const backoff = 500 * 2 ** attempt;
      log.warn({ status: res.status, path, attempt, backoff }, 'Riot 5xx, retrying');
      await new Promise((r) => setTimeout(r, backoff));
      continue;
    }

    if (!res.ok) {
      const text = await res.text();
      throw new RiotApiError(`Riot ${res.status}: ${text.slice(0, 200)}`, res.status, path);
    }

    return (await res.json()) as T;
  }

  throw new RiotApiError('Retries exhausted', 0, path);
}
