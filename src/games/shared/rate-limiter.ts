import { redis } from '@/lib/redis';
import { scoped } from '@/lib/logger';

const log = scoped('riot-limiter');

/**
 * Riot API rate limiter — enforces per-region app + method limits using Redis
 * sliding window counters. Respects Retry-After from Riot when rate-limited.
 *
 * Development key: 20 req/1s, 100 req/2min.
 * Production keys are usually 500 req/10s, 30k req/10min.
 * Adjust `APP_LIMITS` when your prod key is approved.
 */

interface WindowLimit {
  windowMs: number;
  max: number;
}

export const APP_LIMITS: WindowLimit[] = [
  { windowMs: 1_000, max: 20 },
  { windowMs: 120_000, max: 100 },
];

// Method-level limits per Riot (very rough safe defaults).
export const METHOD_LIMITS: Record<string, WindowLimit[]> = {
  'match-v5': [{ windowMs: 10_000, max: 2000 }],
  'summoner-v4': [{ windowMs: 60_000, max: 1600 }],
  'league-v4': [{ windowMs: 60_000, max: 1200 }],
  'account-v1': [{ windowMs: 60_000, max: 1000 }],
  'champion-mastery-v4': [{ windowMs: 60_000, max: 1200 }],
  'spectator-v5': [{ windowMs: 60_000, max: 1200 }],
  'tft-match-v1': [{ windowMs: 10_000, max: 2000 }],
  'val-match-v1': [{ windowMs: 60_000, max: 900 }],
};

async function checkWindows(prefix: string, limits: WindowLimit[]) {
  const now = Date.now();
  for (const { windowMs, max } of limits) {
    const key = `riot:rl:${prefix}:${windowMs}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.pexpire(key, windowMs);
    if (count > max) {
      const ttl = await redis.pttl(key);
      log.warn({ prefix, windowMs, count, ttl }, 'app rate limit reached');
      return { ok: false as const, waitMs: Math.max(ttl, 250) };
    }
    void now;
  }
  return { ok: true as const, waitMs: 0 };
}

export async function acquire(routing: string, method: string): Promise<void> {
  // Try up to N times with backoff.
  for (let attempt = 0; attempt < 8; attempt++) {
    const app = await checkWindows(`app:${routing}`, APP_LIMITS);
    const methodLimits = METHOD_LIMITS[method] ?? [];
    const meth = methodLimits.length
      ? await checkWindows(`m:${routing}:${method}`, methodLimits)
      : { ok: true as const, waitMs: 0 };

    if (app.ok && meth.ok) return;
    const wait = Math.max(app.waitMs, meth.waitMs, 100);
    await new Promise((r) => setTimeout(r, wait));
  }
  throw new Error(`Rate limit could not be acquired for ${routing}/${method}`);
}

export async function honorRetryAfter(retryAfterSeconds: number) {
  const ms = Math.max(1000, retryAfterSeconds * 1000);
  log.warn({ ms }, 'honoring Riot Retry-After');
  await new Promise((r) => setTimeout(r, ms));
}
