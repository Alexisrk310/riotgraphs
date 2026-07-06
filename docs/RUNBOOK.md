# Runbook

## Incidents

### Riot API rate-limit exhaustion
- **Signal**: HTTP 429 spikes, `RiotApiError` in Sentry.
- **Diagnose**: `redis-cli KEYS "rl:*"` — inspect bucket sizes.
- **Mitigate**: lower `count` in sync jobs, pause queues (`bull-board`), request higher Riot key tier.

### Postgres saturation
- **Signal**: >80% CPU sustained, connection queue.
- **Mitigate**: scale replicas (read-only), enable pgBouncer, add covering indexes.

### ClickHouse query slowdown
- **Signal**: MergeTree query >5s.
- **Mitigate**: check partitions, `OPTIMIZE TABLE lol_participants FINAL`, review projections.

### Worker lag
- **Signal**: BullMQ waiting > 10k jobs.
- **Mitigate**: scale worker Deployment replicas, inspect `/admin/jobs`.

## Deployments

- Merge to `main` → GitHub Actions builds + pushes images → ArgoCD sync.
- Rollback: `kubectl rollout undo deployment/riotgraphs-app`.

## Backups

- Postgres: nightly WAL + full snapshot to S3 (retention 30 days).
- ClickHouse: `BACKUP DATABASE riotgraphs TO S3(...)` weekly.
- Redis: RDB snapshots every 15 min (cache — no critical data).
