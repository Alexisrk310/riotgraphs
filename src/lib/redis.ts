import Redis from 'ioredis';
import { env } from './env';

declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined;
}

export const redis =
  global.__redis ??
  new Redis(env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });

if (process.env.NODE_ENV !== 'production') {
  global.__redis = redis;
}

// Convenience cache wrapper (JSON + TTL)
export async function cacheGetOrSet<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const hit = await redis.get(key);
  if (hit) {
    try {
      return JSON.parse(hit) as T;
    } catch {
      // fall through
    }
  }
  const value = await fetcher();
  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  return value;
}

export async function cacheDel(pattern: string) {
  const keys = await redis.keys(pattern);
  if (keys.length) await redis.del(...keys);
}
