import { Queue, QueueEvents, Worker, type Job } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '@/lib/env';
import { scoped } from '@/lib/logger';

const log = scoped('queue');

export const connection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

export const QUEUE_NAMES = {
  syncPlayer: 'sync-player',
  syncMatch: 'sync-match',
  syncLadder: 'sync-ladder',
  aggregateChampion: 'aggregate-champion',
  aiInsight: 'ai-insight',
  tftMatch: 'tft-match',
  valorantMatch: 'valorant-match',
} as const;

type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

const queues = new Map<QueueName, Queue>();
export function getQueue<T = unknown>(name: QueueName): Queue<T> {
  if (!queues.has(name)) {
    queues.set(
      name,
      new Queue(name, {
        connection,
        defaultJobOptions: {
          attempts: 5,
          backoff: { type: 'exponential', delay: 3_000 },
          removeOnComplete: { count: 1000, age: 24 * 3600 },
          removeOnFail: { count: 5000 },
        },
      }),
    );
  }
  return queues.get(name) as Queue<T>;
}

export function createWorker<T>(
  name: QueueName,
  processor: (job: Job<T>) => Promise<unknown>,
  concurrency = 4,
) {
  const worker = new Worker<T>(name, processor, { connection, concurrency });
  worker.on('failed', (job, err) => log.error({ jobId: job?.id, name, err: err.message }, 'job failed'));
  worker.on('completed', (job) => log.debug({ jobId: job.id, name }, 'job done'));
  return worker;
}

export function createQueueEvents(name: QueueName) {
  return new QueueEvents(name, { connection });
}
