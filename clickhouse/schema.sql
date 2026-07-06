-- RiotGraphs — ClickHouse OLAP schema
-- Handles billions of match/participant rows for analytics, trends, tier lists.

CREATE DATABASE IF NOT EXISTS riotgraphs_analytics;

-- ─────────────────────────────────────────────────────────────
-- League of Legends: fact table
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS riotgraphs_analytics.lol_participants
(
    match_id           String,
    puuid              String,
    summoner_id        String,
    platform           LowCardinality(String),
    routing            LowCardinality(String),
    queue_id           UInt16,
    patch              LowCardinality(String),
    game_start         DateTime64(3),
    game_duration_s    UInt32,
    tier               LowCardinality(String),
    division           LowCardinality(String),
    champion_id        UInt16,
    role               LowCardinality(String),
    lane               LowCardinality(String),
    team_id            UInt8,
    win                UInt8,
    kills              UInt16,
    deaths             UInt16,
    assists            UInt16,
    kda                Float32,
    cs_total           UInt32,
    cs_per_min         Float32,
    gold_earned        UInt32,
    gold_per_min       Float32,
    damage_champions   UInt32,
    damage_taken       UInt32,
    vision_score       UInt32,
    wards_placed       UInt16,
    wards_killed       UInt16,
    first_blood        UInt8,
    first_tower        UInt8,
    items              Array(UInt32),
    perks_primary      UInt32,
    perks_sub          UInt32,
    summoner_spells    Array(UInt16),
    region             LowCardinality(String),
    country            LowCardinality(String),
    ingested_at        DateTime DEFAULT now()
)
ENGINE = MergeTree
PARTITION BY (patch, toYYYYMM(game_start))
ORDER BY (patch, champion_id, tier, role, game_start)
TTL game_start + INTERVAL 5 YEAR
SETTINGS index_granularity = 8192;

-- Materialised view: champion aggregates per patch/tier/role
CREATE TABLE IF NOT EXISTS riotgraphs_analytics.lol_champion_agg
(
    patch          LowCardinality(String),
    tier           LowCardinality(String),
    role           LowCardinality(String),
    region         LowCardinality(String),
    champion_id    UInt16,
    games          UInt64,
    wins           UInt64,
    kills_sum      UInt64,
    deaths_sum     UInt64,
    assists_sum    UInt64,
    cs_sum         UInt64,
    gold_sum       UInt64,
    damage_sum     UInt64,
    vision_sum     UInt64
)
ENGINE = SummingMergeTree
PARTITION BY patch
ORDER BY (patch, tier, role, region, champion_id);

CREATE MATERIALIZED VIEW IF NOT EXISTS riotgraphs_analytics.lol_champion_agg_mv
TO riotgraphs_analytics.lol_champion_agg
AS SELECT
    patch,
    tier,
    role,
    region,
    champion_id,
    count() AS games,
    sum(win) AS wins,
    sum(kills) AS kills_sum,
    sum(deaths) AS deaths_sum,
    sum(assists) AS assists_sum,
    sum(cs_total) AS cs_sum,
    sum(gold_earned) AS gold_sum,
    sum(damage_champions) AS damage_sum,
    sum(vision_score) AS vision_sum
FROM riotgraphs_analytics.lol_participants
GROUP BY patch, tier, role, region, champion_id;

-- ─────────────────────────────────────────────────────────────
-- TFT
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS riotgraphs_analytics.tft_participants
(
    match_id        String,
    puuid           String,
    routing         LowCardinality(String),
    patch           LowCardinality(String),
    set             UInt8,
    game_start      DateTime64(3),
    placement       UInt8,
    level           UInt8,
    gold_left       UInt16,
    time_eliminated Float32,
    traits          Array(String),
    units           Array(String),
    augments        Array(String),
    tier            LowCardinality(String),
    ingested_at     DateTime DEFAULT now()
)
ENGINE = MergeTree
PARTITION BY (set, toYYYYMM(game_start))
ORDER BY (set, patch, tier, placement, game_start);

-- ─────────────────────────────────────────────────────────────
-- Valorant
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS riotgraphs_analytics.val_participants
(
    match_id      String,
    puuid         String,
    region        LowCardinality(String),
    queue_id      LowCardinality(String),
    map_id        LowCardinality(String),
    agent_id      LowCardinality(String),
    season_id     LowCardinality(String),
    game_start    DateTime64(3),
    game_length_ms UInt32,
    is_ranked     UInt8,
    won           UInt8,
    rounds        UInt16,
    kills         UInt16,
    deaths        UInt16,
    assists       UInt16,
    score         UInt32,
    adr           Float32,
    hs_pct        Float32,
    kast          Float32,
    first_bloods  UInt16,
    clutches      UInt16,
    tier          LowCardinality(String),
    ingested_at   DateTime DEFAULT now()
)
ENGINE = MergeTree
PARTITION BY (season_id, toYYYYMM(game_start))
ORDER BY (season_id, agent_id, map_id, tier, game_start);

-- ─────────────────────────────────────────────────────────────
-- Cross-game player summary (30-day rolling)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS riotgraphs_analytics.player_pulse_30d
(
    puuid       String,
    game        LowCardinality(String),
    games       UInt32,
    wins        UInt32,
    winrate     Float32,
    kda         Float32,
    updated_at  DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(updated_at)
ORDER BY (puuid, game);
