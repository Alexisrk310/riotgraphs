# API

Base URL: `https://riotgraphs.com/api`

## Auth

Bearer token in `Authorization: Bearer <API_KEY>`.

## Endpoints

### `GET /api/tier-list`
Query: `patch`, `role` (TOP/JUNGLE/MIDDLE/BOTTOM/UTILITY), `tier` (PLATINUM_PLUS/DIAMOND_PLUS/MASTER_PLUS), `region`.
Returns aggregated champion winrates.

### `POST /api/ai/insights`
Body: `{ puuid, region }` → AI coaching JSON `{ score, summary, strengths[], weaknesses[], nextSteps[] }`.

### `POST /api/players/:puuid/sync`
Body: `{ region, routing, count }` → 202 `{ jobId, status: "queued" }`. Enqueues a BullMQ sync job.

### `GET /api/health`
Liveness/readiness probe. Returns `{ ok, checks: { postgres, redis } }`.

### `GET /api/metrics`
Prometheus metrics.

## Errors

Standard HTTP status codes. JSON body: `{ error: "code", details?: {} }`.

## Rate limits

- Anonymous: 120 requests / minute per IP.
- Pro API key: 1,000 / hour.
- Team API key: 10,000 / day sustained.
