import { createWorker, QUEUE_NAMES } from './queue';
import { processSyncPlayer } from './handlers/sync-player';
import { processSyncMatch } from './handlers/sync-match';
import { processSyncLadder } from './handlers/sync-ladder';
import { processAggregateChampion } from './handlers/aggregate-champion';
import { scoped } from '@/lib/logger';

const log = scoped('workers');

async function main() {
  log.info('starting RiotGraphs workers');

  createWorker(QUEUE_NAMES.syncPlayer, processSyncPlayer, 4);
  createWorker(QUEUE_NAMES.syncMatch, processSyncMatch, 8);
  createWorker(QUEUE_NAMES.syncLadder, processSyncLadder, 2);
  createWorker(QUEUE_NAMES.aggregateChampion, processAggregateChampion, 2);

  process.on('SIGINT', () => {
    log.info('received SIGINT, shutting down');
    process.exit(0);
  });
}

main().catch((err) => {
  log.error({ err: err.message }, 'workers crashed');
  process.exit(1);
});
