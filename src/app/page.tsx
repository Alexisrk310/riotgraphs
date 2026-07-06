import Link from 'next/link';
import { Activity, BarChart3, Brain, Crown, Flame, Globe, Sparkles, Zap } from 'lucide-react';
import { PlayerSearch } from '@/components/player-search';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-lines opacity-40" />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="container relative pt-24 pb-16 md:pt-32 md:pb-24">
          <Badge variant="challenger" className="mb-6">
            <Sparkles className="mr-1 h-3 w-3" />
            Season 15 · AI insights live
          </Badge>
          <h1 className="max-w-4xl font-display text-5xl font-black leading-[1.05] tracking-tight md:text-7xl">
            The competitive intelligence platform
            <br />
            <span className="text-gradient-electric">for the entire Riot ecosystem.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-graphite-300">
            Deep stats, tier lists, meta trends and AI-powered coaching across League of
            Legends, Valorant, TFT and LoR — refreshed in real time from the Riot Games API.
          </p>

          <div className="mt-10 max-w-2xl">
            <PlayerSearch />
            <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-graphite-400">
              try: Faker#KR1 · Caps#EUW · TenZ#001
            </p>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="matches indexed" value="1.4B+" accent="electric" hint="+2.1M/day" />
            <StatCard label="players tracked" value="41M" hint="across 4 games" />
            <StatCard label="ai analyses" value="9.2M" accent="challenger" hint="last 30 days" />
            <StatCard label="patch coverage" value="14.24" hint="live syncing" trend="up" />
          </div>
        </div>
      </section>

      {/* Games grid */}
      <section className="container py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-electric">Games</p>
            <h2 className="mt-1 font-display text-3xl font-bold md:text-4xl">
              Every Riot title, one dashboard.
            </h2>
          </div>
          <Link href="/rankings" className="hidden text-sm text-electric hover:underline md:inline">
            View all rankings →
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {GAMES.map((g) => (
            <Link key={g.href} href={g.href}>
              <Card className="group h-full overflow-hidden transition hover:border-electric/30">
                <div className={`h-1 bg-gradient-to-r ${g.accent}`} />
                <CardContent className="pt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <g.icon className="h-6 w-6 text-electric" />
                    <Badge variant={g.status === 'live' ? 'success' : 'muted'}>
                      {g.status}
                    </Badge>
                  </div>
                  <h3 className="font-display text-xl font-bold">{g.name}</h3>
                  <p className="mt-2 text-sm text-graphite-300">{g.tagline}</p>
                  <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-graphite-400 group-hover:text-electric">
                    Explore →
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <p className="font-mono text-xs uppercase tracking-widest text-electric">What you get</p>
        <h2 className="mt-1 font-display text-3xl font-bold md:text-4xl">
          Built like a trading terminal.
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="p-6 transition hover:border-electric/30">
              <f.icon className="h-6 w-6 text-electric" />
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-graphite-300">{f.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container py-24">
        <div className="glass relative overflow-hidden rounded-2xl p-10 md:p-16">
          <div className="absolute inset-0 bg-gradient-hero opacity-70" />
          <div className="relative">
            <h2 className="max-w-2xl font-display text-4xl font-bold md:text-5xl">
              Ready to <span className="text-gradient-challenger">climb</span>?
            </h2>
            <p className="mt-4 max-w-xl text-graphite-300">
              Unlock advanced comparisons, unlimited match analysis and AI coaching for less than
              the cost of a skin.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/pricing"
                className="rounded-lg bg-gradient-challenger px-6 py-3 font-semibold text-obsidian-950 shadow-glow-gold"
              >
                Go Premium
              </Link>
              <Link
                href="/developers"
                className="rounded-lg border border-white/10 bg-white/5 px-6 py-3 font-semibold hover:border-electric/40"
              >
                Get API access
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const GAMES = [
  {
    name: 'League of Legends',
    tagline: 'Player profiles, tier lists, meta trends, match analysis.',
    href: '/lol',
    icon: Crown,
    status: 'live',
    accent: 'from-electric via-electric-500 to-electric-700',
  },
  {
    name: 'Valorant',
    tagline: 'ADR, KAST, HS%, agent & map winrates, clutch stats.',
    href: '/valorant',
    icon: Flame,
    status: 'live',
    accent: 'from-red-400 via-red-500 to-red-700',
  },
  {
    name: 'Teamfight Tactics',
    tagline: 'Comp meta, augment stats, trait synergies, placements.',
    href: '/tft',
    icon: Zap,
    status: 'live',
    accent: 'from-purple-400 via-fuchsia-500 to-purple-700',
  },
  {
    name: 'Legends of Runeterra',
    tagline: 'Deck archetypes, matchups and card performance.',
    href: '/lor',
    icon: Globe,
    status: 'beta',
    accent: 'from-teal-400 via-emerald-500 to-emerald-700',
  },
] as const;

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Bloomberg-grade dashboards',
    description:
      'Line charts, heatmaps, radars, scatter plots and timelines — all interactive, all real-time.',
  },
  {
    icon: Brain,
    title: 'AI-powered coaching',
    description:
      'Personal weaknesses, tilt detection, mistake patterns and predicted rank — cited from your real data.',
  },
  {
    icon: Activity,
    title: 'Live match tracker',
    description: 'Real-time spectator data, MMR predictions and win probability the moment you queue.',
  },
  {
    icon: Crown,
    title: 'Global leaderboards',
    description:
      'World, region, country, city, champion, agent, role and season. Filter anything.',
  },
  {
    icon: Flame,
    title: 'Meta at the speed of patch',
    description:
      'Aggregates rebuilt every 2 hours the moment a new patch drops. Never trust yesterday\'s tier list.',
  },
  {
    icon: Sparkles,
    title: 'Compare like a scout',
    description:
      'Side-by-side comparison for up to 5 players across every stat that matters.',
  },
] as const;
