import { getQueue, QUEUE_NAMES } from './queue';
import { scoped } from '@/lib/logger';

const log = scoped('cron');

/**
 * Cron scheduler — enqueues periodic sync jobs using BullMQ repeatable jobs.
 * Run once with `pnpm cron` (idempotent).
 */
async function main() {
  const ladder = getQueue(QUEUE_NAMES.syncLadder);
  const agg = getQueue(QUEUE_NAMES.aggregateChampion);

  const platforms = ['EUW1', 'NA1', 'KR', 'BR1'] as const;
  for (const platform of platforms) {
    for (const tier of ['CHALLENGER', 'GRANDMASTER', 'MASTER'] as const) {
      await ladder.add(
        `ladder-${platform}-${tier}`,
        { platform, tier, queue: 'RANKED_SOLO_5x5' },
        {
          repeat: { pattern: '*/30 * * * *' }, // every 30 min
          jobId: `ladder:${platform}:${tier}`,
        },
      );
    }
  }

  // Rebuild champion tier list every 2h
  await agg.add(
    'agg-current-patch',
    { patch: process.env.CURRENT_PATCH ?? '14.24', tier: 'ALL', role: 'ALL' },
    { repeat: { pattern: '0 */2 * * *' }, jobId: 'agg:current' },
  );

  log.info('cron schedules installed');
}

main().catch((err) => {
  log.error({ err: err.message }, 'cron failed');
  process.exit(1);
});
