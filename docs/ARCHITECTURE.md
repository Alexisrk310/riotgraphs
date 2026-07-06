# Architecture

## Layers

- **Presentation** (`src/app`, `src/components`) — Next.js App Router. Server Components fetch through domain services; client components hydrate on interaction.
- **Domain** (`src/domain`) — pure business logic: services (PlayerService, RankingService, ComparisonService), normalizers, AI insight generation.
- **Games** (`src/games`) — Riot API adapter layer, one folder per game. Shared HTTP client, rate limiter, routing tables.
- **Infrastructure** (`src/lib`) — Prisma, Redis, ClickHouse, Stripe, env, logger.
- **Workers** (`src/workers`) — BullMQ workers and cron scheduler.

## Data Flow

1. User visits `/lol/euw1/faker-kr1`.
2. RSC calls `PlayerService.findOrCreate` — cache hit → serve; miss → Riot API → Postgres upsert → enqueue background match sync.
3. Match sync worker fetches Match-v5 details, normalizes, writes to Postgres (`Match`, `MatchTeam`, `MatchParticipant`) and inserts into ClickHouse (`lol_participants`).
4. Aggregate worker runs every 2h: aggregates ClickHouse into PostgreSQL `ChampionStats` with a tier score (S+/S/A/B/C/D).
5. Tier list page reads `ChampionStats`, cached with `revalidate: 300`.
6. AI insight route summarizes recent perf and calls Abacus RouteLLM (OpenAI-compatible), falls back to a deterministic heuristic if the model errors.

## Rate Limiting

- **Riot**: sliding-window Redis buckets keyed by `app:{region}` and `method:{region}:{path}`. Honors `Retry-After`.
- **API**: middleware IP+route bucket 120/min.

## Caching

- Redis `SET ... EX` with `cacheGetOrSet`. Player summary 60s, tier list 300s, ladder 600s.
- Next.js `revalidate` for RSC pages.
- HTTP cache-control for public JSON endpoints.

## Deployment

- Container images built per commit (`Dockerfile`, `Dockerfile.worker`).
- Kubernetes: `Deployment` + `HPA` (3–20 replicas @ 70% CPU) + PDB.
- Managed Postgres + Redis + ClickHouse cluster.
- Sentry + Prometheus scrape `/api/metrics`.
