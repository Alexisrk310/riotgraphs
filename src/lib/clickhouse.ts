import { env } from './env';
import { scoped } from './logger';

const log = scoped('clickhouse');

interface QueryOptions {
  format?: 'JSON' | 'JSONEachRow' | 'CSV' | 'TabSeparated';
}

/**
 * Minimal ClickHouse HTTP client — no heavy driver required.
 * For heavy workloads switch to @clickhouse/client-web.
 */
export const clickhouse = {
  async query<T = unknown>(sql: string, opts: QueryOptions = {}): Promise<T[]> {
    const format = opts.format ?? 'JSONEachRow';
    const url = new URL(env.CLICKHOUSE_URL);
    url.searchParams.set('database', env.CLICKHOUSE_DB);

    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'X-ClickHouse-User': env.CLICKHOUSE_USER,
        'X-ClickHouse-Key': env.CLICKHOUSE_PASSWORD,
      },
      body: `${sql} FORMAT ${format}`,
    });

    if (!res.ok) {
      const text = await res.text();
      log.error({ status: res.status, text }, 'ClickHouse query failed');
      throw new Error(`ClickHouse ${res.status}: ${text.slice(0, 200)}`);
    }

    if (format === 'JSONEachRow') {
      const text = await res.text();
      if (!text.trim()) return [];
      return text
        .trim()
        .split('\n')
        .map((l) => JSON.parse(l) as T);
    }
    if (format === 'JSON') {
      const data = (await res.json()) as { data: T[] };
      return data.data;
    }
    return (await res.text()) as unknown as T[];
  },

  async insert(table: string, rows: Record<string, unknown>[]): Promise<void> {
    if (!rows.length) return;
    const url = new URL(env.CLICKHOUSE_URL);
    url.searchParams.set('database', env.CLICKHOUSE_DB);
    url.searchParams.set('query', `INSERT INTO ${table} FORMAT JSONEachRow`);

    const body = rows.map((r) => JSON.stringify(r)).join('\n');
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ClickHouse-User': env.CLICKHOUSE_USER,
        'X-ClickHouse-Key': env.CLICKHOUSE_PASSWORD,
      },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`ClickHouse insert failed: ${res.status} ${text.slice(0, 200)}`);
    }
  },

  async exec(sql: string): Promise<void> {
    const url = new URL(env.CLICKHOUSE_URL);
    url.searchParams.set('database', env.CLICKHOUSE_DB);
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'X-ClickHouse-User': env.CLICKHOUSE_USER,
        'X-ClickHouse-Key': env.CLICKHOUSE_PASSWORD,
      },
      body: sql,
    });
    if (!res.ok) {
      throw new Error(`ClickHouse exec failed: ${res.status} ${await res.text()}`);
    }
  },
};
