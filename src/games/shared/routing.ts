// Riot regional routing map — routing = cross-region cluster, platform = shard.
// https://developer.riotgames.com/docs/lol

export type Platform =
  | 'BR1' | 'EUN1' | 'EUW1' | 'JP1' | 'KR' | 'LA1' | 'LA2'
  | 'NA1' | 'OC1' | 'TR1' | 'RU' | 'PH2' | 'SG2' | 'TH2'
  | 'TW2' | 'VN2' | 'ME1';

export type Routing = 'americas' | 'europe' | 'asia' | 'sea' | 'esports';

export const PLATFORM_TO_ROUTING: Record<Platform, Routing> = {
  BR1: 'americas',
  LA1: 'americas',
  LA2: 'americas',
  NA1: 'americas',
  OC1: 'sea',

  EUN1: 'europe',
  EUW1: 'europe',
  TR1: 'europe',
  RU: 'europe',
  ME1: 'europe',

  KR: 'asia',
  JP1: 'asia',

  PH2: 'sea',
  SG2: 'sea',
  TH2: 'sea',
  TW2: 'sea',
  VN2: 'sea',
};

export const PLATFORM_HOSTS: Record<Platform, string> = Object.fromEntries(
  Object.keys(PLATFORM_TO_ROUTING).map((p) => [p, `${p.toLowerCase()}.api.riotgames.com`]),
) as Record<Platform, string>;

export const ROUTING_HOSTS: Record<Routing, string> = {
  americas: 'americas.api.riotgames.com',
  europe: 'europe.api.riotgames.com',
  asia: 'asia.api.riotgames.com',
  sea: 'sea.api.riotgames.com',
  esports: 'esports.api.riotgames.com',
};

export const VALORANT_ROUTING = ['na', 'eu', 'ap', 'kr', 'latam', 'br', 'esports'] as const;
export type ValorantRouting = (typeof VALORANT_ROUTING)[number];
export const VALORANT_HOSTS: Record<ValorantRouting, string> = {
  na: 'na.api.riotgames.com',
  eu: 'eu.api.riotgames.com',
  ap: 'ap.api.riotgames.com',
  kr: 'kr.api.riotgames.com',
  latam: 'latam.api.riotgames.com',
  br: 'br.api.riotgames.com',
  esports: 'esports.api.riotgames.com',
};

export const QUEUE_IDS = {
  RANKED_SOLO_5x5: 420,
  RANKED_FLEX_5x5: 440,
  NORMAL_DRAFT: 400,
  ARAM: 450,
  TFT_RANKED: 1100,
  TFT_NORMAL: 1090,
  TFT_HYPERROLL: 1130,
  TFT_DOUBLE_UP: 1160,
} as const;
