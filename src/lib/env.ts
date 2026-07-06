import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('RiotGraphs'),

  RIOT_API_KEY: z.string().min(1, 'RIOT_API_KEY required'),
  RIOT_API_KEY_VALORANT: z.string().optional(),

  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),

  REDIS_URL: z.string().default('redis://localhost:6379'),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  CLICKHOUSE_URL: z.string().url().default('http://localhost:8123'),
  CLICKHOUSE_DB: z.string().default('riotgraphs_analytics'),
  CLICKHOUSE_USER: z.string().default('default'),
  CLICKHOUSE_PASSWORD: z.string().default(''),

  AUTH_SECRET: z.string().min(16).default('dev-secret-change-me-please-32chars'),
  AUTH_URL: z.string().url().optional(),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  ABACUS_API_KEY: z.string().optional(),
  ABACUS_ROUTELLM_BASE_URL: z.string().url().default('https://api.abacus.ai/v1'),
  ABACUS_ROUTELLM_MODEL: z.string().default('route-llm'),

  SENTRY_DSN: z.string().optional(),

  FEATURE_VALORANT: z.coerce.boolean().default(true),
  FEATURE_TFT: z.coerce.boolean().default(true),
  FEATURE_LOR: z.coerce.boolean().default(true),
  FEATURE_WILD_RIFT: z.coerce.boolean().default(false),
  FEATURE_AI_INSIGHTS: z.coerce.boolean().default(true),

  RATE_LIMIT_ANON_PER_MINUTE: z.coerce.number().default(30),
  RATE_LIMIT_USER_PER_MINUTE: z.coerce.number().default(120),
  RATE_LIMIT_PREMIUM_PER_MINUTE: z.coerce.number().default(600),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success && process.env.NODE_ENV !== 'test') {
  // In development show issues clearly, in production fail hard.
  const flattened = parsed.error.flatten().fieldErrors;
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment variables:', flattened);
  if (process.env.NODE_ENV === 'production' && process.env.SKIP_ENV_VALIDATION !== '1') {
    throw new Error('Invalid environment configuration');
  }
}

export const env = (parsed.success
  ? parsed.data
  : (envSchema.parse({
      ...process.env,
      RIOT_API_KEY: process.env.RIOT_API_KEY ?? 'RGAPI-dev-placeholder',
      DATABASE_URL:
        process.env.DATABASE_URL ??
        'postgresql://riotgraphs:riotgraphs@localhost:5432/riotgraphs',
    }))) as z.infer<typeof envSchema>;

export type Env = typeof env;
