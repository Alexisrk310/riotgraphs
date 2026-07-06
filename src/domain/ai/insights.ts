import OpenAI from 'openai';
import { env } from '@/lib/env';
import { scoped } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

const log = scoped('ai');

const client = env.ABACUS_API_KEY
  ? new OpenAI({ apiKey: env.ABACUS_API_KEY, baseURL: env.ABACUS_ROUTELLM_BASE_URL })
  : null;

export interface PlayerInsightInput {
  puuid: string;
  gameName: string;
  tier?: string;
  rank?: string;
  games: number;
  wins: number;
  losses: number;
  avgKda: number;
  avgCsPerMin: number;
  avgVisionScore: number;
  avgGoldPerMin: number;
  championStats: { championId: number; games: number; winrate: number; kda: number }[];
  recentTrend: { win: boolean; kda: number; cs: number }[];
}

export interface PlayerInsight {
  summary: string;
  bullets: { icon: 'up' | 'down' | 'neutral'; title: string; detail: string }[];
  score: number;
}

/**
 * Heuristic insights — deterministic baseline. Always available.
 * Fed to the LLM as evidence to reduce hallucinations.
 */
export function heuristicInsights(input: PlayerInsightInput): PlayerInsight {
  const bullets: PlayerInsight['bullets'] = [];
  const winrate = input.wins / Math.max(1, input.wins + input.losses);

  if (input.avgVisionScore > 30) {
    bullets.push({
      icon: 'up',
      title: 'Elite vision control',
      detail: `Your vision score of ${input.avgVisionScore.toFixed(1)} is well above average for your elo.`,
    });
  } else if (input.avgVisionScore < 15) {
    bullets.push({
      icon: 'down',
      title: 'Warding needs work',
      detail: `Vision score ${input.avgVisionScore.toFixed(1)} is low — buy more control wards.`,
    });
  }

  if (input.avgCsPerMin < 5.5) {
    bullets.push({
      icon: 'down',
      title: 'CS is holding you back',
      detail: `You farm ${input.avgCsPerMin.toFixed(2)} CS/min. Aim for 7+ in ranked.`,
    });
  } else if (input.avgCsPerMin > 8) {
    bullets.push({
      icon: 'up',
      title: 'Excellent farming',
      detail: `${input.avgCsPerMin.toFixed(2)} CS/min is top-tier for your rank.`,
    });
  }

  if (input.avgKda > 3.5) {
    bullets.push({ icon: 'up', title: 'High KDA', detail: `Average KDA ${input.avgKda.toFixed(2)}.` });
  }

  const lastFive = input.recentTrend.slice(0, 5);
  const recentWins = lastFive.filter((r) => r.win).length;
  if (lastFive.length >= 5 && recentWins <= 1) {
    bullets.push({
      icon: 'down',
      title: 'Possible tilt window',
      detail: 'Only 1 win in your last 5 — consider taking a short break to reset.',
    });
  }
  if (lastFive.length >= 5 && recentWins >= 4) {
    bullets.push({
      icon: 'up',
      title: 'Hot streak detected',
      detail: 'Ride the wave — this is the moment to climb.',
    });
  }

  const bestChamp = input.championStats
    .filter((c) => c.games >= 3)
    .sort((a, b) => b.winrate - a.winrate)[0];
  if (bestChamp) {
    bullets.push({
      icon: 'neutral',
      title: 'Champion to spam',
      detail: `Champion ${bestChamp.championId}: ${(bestChamp.winrate * 100).toFixed(0)}% WR over ${bestChamp.games} games.`,
    });
  }

  const score = Math.min(
    100,
    Math.max(
      0,
      50 +
        (winrate - 0.5) * 100 +
        (input.avgCsPerMin - 6) * 4 +
        (input.avgVisionScore - 20) * 0.5 +
        (input.avgKda - 2.5) * 3,
    ),
  );

  const summary = `Snapshot of ${input.gameName}: ${(winrate * 100).toFixed(1)}% winrate over ${
    input.games
  } games with a ${input.avgKda.toFixed(2)} KDA. Performance index: ${score.toFixed(0)}/100.`;

  return { summary, bullets, score };
}

/**
 * LLM-enriched insights via Abacus RouteLLM (OpenAI-compatible).
 * Falls back to heuristic if API key is absent or request fails.
 */
export async function generatePlayerInsight(input: PlayerInsightInput): Promise<PlayerInsight> {
  const baseline = heuristicInsights(input);
  if (!env.FEATURE_AI_INSIGHTS || !client) return baseline;

  try {
    const completion = await client.chat.completions.create({
      model: env.ABACUS_ROUTELLM_MODEL,
      temperature: 0.4,
      max_tokens: 500,
      messages: [
        {
          role: 'system',
          content:
            'You are a senior League of Legends coach. Respond with concise, evidence-based, non-generic advice. Always cite the exact numbers provided. Never invent data.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            player: {
              name: input.gameName,
              tier: input.tier,
              games: input.games,
              winrate: (input.wins / Math.max(1, input.wins + input.losses)).toFixed(3),
              kda: input.avgKda.toFixed(2),
              cs_per_min: input.avgCsPerMin.toFixed(2),
              vision: input.avgVisionScore.toFixed(1),
              gold_per_min: input.avgGoldPerMin.toFixed(0),
            },
            evidence: baseline.bullets,
            request:
              'Return a JSON object {"summary": string, "bullets": [{"icon": "up|down|neutral", "title": string, "detail": string}], "score": 0-100}',
          }),
        },
      ],
      response_format: { type: 'json_object' },
    });

    const text = completion.choices[0]?.message?.content ?? '';
    const parsed = JSON.parse(text) as Partial<PlayerInsight>;
    return {
      summary: parsed.summary ?? baseline.summary,
      bullets: parsed.bullets && parsed.bullets.length ? parsed.bullets : baseline.bullets,
      score: typeof parsed.score === 'number' ? parsed.score : baseline.score,
    };
  } catch (err) {
    log.warn({ err: (err as Error).message }, 'LLM insight failed, using heuristic');
    return baseline;
  }
}

export async function persistPlayerInsight(puuid: string, insight: PlayerInsight, model = 'route-llm') {
  return prisma.aIInsight.create({
    data: {
      game: 'LOL',
      puuid,
      scope: 'PROFILE',
      summary: insight.summary,
      bullets: insight.bullets as any,
      score: insight.score,
      model,
    },
  });
}
