'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Loader2, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PlayerSummary } from '@/domain/lol/player.service';

interface Props {
  puuid: string;
  name: string;
  summary: PlayerSummary | null;
  matches: { win: boolean; kda: number; csPerMin: number; visionScore: number; goldPerMin: number }[];
  champions: { championId: number; games: number; winrate: number; kda: number }[];
}

interface Insight {
  summary: string;
  bullets: { icon: 'up' | 'down' | 'neutral'; title: string; detail: string }[];
  score: number;
}

export function AIInsightPanel({ puuid, name, summary, matches, champions }: Props) {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/ai/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        puuid,
        gameName: name,
        tier: summary?.soloTier,
        rank: summary?.soloRank,
        games: matches.length,
        wins: summary?.soloWins ?? matches.filter((m) => m.win).length,
        losses: summary?.soloLosses ?? matches.filter((m) => !m.win).length,
        avgKda: avg(matches.map((m) => m.kda)),
        avgCsPerMin: avg(matches.map((m) => m.csPerMin)),
        avgVisionScore: avg(matches.map((m) => m.visionScore)),
        avgGoldPerMin: avg(matches.map((m) => m.goldPerMin)),
        championStats: champions.slice(0, 8).map((c) => ({
          championId: c.championId,
          games: c.games,
          winrate: c.winrate,
          kda: c.kda,
        })),
        recentTrend: matches.slice(0, 10).map((m) => ({ win: m.win, kda: m.kda, cs: m.csPerMin })),
      }),
    })
      .then((r) => r.json())
      .then((data) => !cancelled && setInsight(data))
      .catch(() => !cancelled && setInsight(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [puuid, name, summary?.soloTier, summary?.soloRank, summary?.soloWins, summary?.soloLosses, matches, champions]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-electric/10 p-2">
            <Brain className="h-4 w-4 text-electric" />
          </div>
          <CardTitle className="text-base">AI insights</CardTitle>
        </div>
        <Badge variant="challenger">Premium</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-graphite-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing your last {matches.length} games…
          </div>
        )}
        {!loading && insight && (
          <>
            <div className="flex items-baseline gap-3">
              <span className="font-display text-4xl font-bold text-gradient-electric num-mono">
                {Math.round(insight.score)}
              </span>
              <span className="font-mono text-xs uppercase tracking-widest text-graphite-400">/ 100 index</span>
            </div>
            <p className="text-sm leading-relaxed text-graphite-200">{insight.summary}</p>
            <div className="space-y-2 pt-2">
              {insight.bullets.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3"
                >
                  <div
                    className={`mt-0.5 h-6 w-6 flex-none rounded-md ${
                      b.icon === 'up'
                        ? 'bg-emerald-400/15 text-emerald-400'
                        : b.icon === 'down'
                          ? 'bg-red-400/15 text-red-400'
                          : 'bg-graphite-500/15 text-graphite-300'
                    } flex items-center justify-center`}
                  >
                    {b.icon === 'up' ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : b.icon === 'down' ? (
                      <TrendingDown className="h-3.5 w-3.5" />
                    ) : (
                      <Minus className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{b.title}</div>
                    <div className="mt-0.5 text-xs text-graphite-300">{b.detail}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
        {!loading && !insight && (
          <p className="text-sm text-graphite-300">
            AI insights temporarily unavailable. Try refreshing in a moment.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function avg(arr: number[]) {
  return arr.length ? arr.reduce((s, n) => s + n, 0) / arr.length : 0;
}
