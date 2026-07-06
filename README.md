# RiotGraphs

A production-grade analytics platform for the entire Riot Games ecosystem — League of Legends, TFT, Valorant, Legends of Runeterra and Wild Rift (stub).

Superset clone of LeagueOfGraphs with:
- Real-time player profiles (rank, mastery, match history, KDA, CS, vision, damage share)
- Data-driven tier lists (winrate/pickrate/banrate by patch, role, tier and region)
- Ladders (Challenger / GM / Master)
- Head-to-head comparisons
- **AI coaching insights** powered by Abacus.AI RouteLLM
- Live spectator view (Pro tier)
- Public REST API with API keys

## Stack

- **Next.js 16** (App Router, RSC, Server Actions, Turbopack) + TypeScript + Tailwind + shadcn/ui
- **PostgreSQL** (Prisma) — operational data
- **ClickHouse** — analytical/OLAP (billions of match participant rows)
- **Redis** — cache + BullMQ queues + rate-limit buckets
- **BullMQ** workers — player sync, match sync, ladder sync, aggregate materialization
- **NextAuth v5** — Google / Discord / (Riot Sign-On stub)
- **Stripe** — subscriptions (Free / Pro / Team)
- **Sentry** + **Prometheus** + Grafana — observability
- **Docker** + **Kubernetes** — deployment

## Architecture

```
apps
  web (Next.js) ──┬── REST/GraphQL API
                  ├── Server Components + RSC data
                  └── SEO (dynamic OG, sitemap, JSON-LD)

workers
  sync-player  ── Riot API ── Postgres + ClickHouse
  sync-match   ── Riot API ── Postgres + ClickHouse
  sync-ladder  ── Riot API ── Postgres
  aggregate    ── ClickHouse → Postgres (ChampionStats)

infra
  postgres · redis · clickhouse
```

See `docs/ARCHITECTURE.md` for the full deep-dive.

## Getting Started

```bash
pnpm install
cp .env.example .env
# edit .env with your Riot API key, DB URLs, etc.
docker compose up -d postgres redis clickhouse
pnpm prisma migrate deploy
pnpm dev            # web
pnpm worker         # in another shell — BullMQ workers
pnpm cron           # in another shell — schedules
```

Then open http://localhost:3000.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Next.js dev server |
| `pnpm build` | Production build |
| `pnpm start` | Production server |
| `pnpm worker` | Run BullMQ workers |
| `pnpm cron` | Register repeatable jobs |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | tsc --noEmit |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright end-to-end |
| `pnpm prisma migrate dev` | DB migrations |

## Disclaimer

RiotGraphs isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc.

## License

MIT — see `LICENSE`.
