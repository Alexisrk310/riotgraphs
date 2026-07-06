import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { RankBadge } from '@/components/ui/rank-badge';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayerService } from '@/domain/lol/player.service';
import { PLATFORM_TO_ROUTING, type Platform } from '@/games/shared/routing';
import { formatNumber, formatPercent, timeAgo } from '@/lib/utils';
import { AIInsightPanel } from '@/components/ai-insight-panel';
import { PerformanceChart } from '@/components/charts/performance-chart';
import { ChampionPoolChart } from '@/components/charts/champion-pool-chart';
import type { Metadata } from 'next';

interface Params {
  region: string;
  slug: string;
}

function parseSlug(slug: string) {
  const dec = decodeURIComponent(slug);
  const idx = dec.lastIndexOf('-');
  if (idx === -1) return null;
  return { name: dec.slice(0, idx), tag: dec.slice(idx + 1) };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { region, slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return { title: 'Player not found' };
  const platform = region.toUpperCase() as Platform;
  const title = `${parsed.name}#${parsed.tag} · ${platform} · League of Legends stats`;
  return {
    title,
    description: `Full LoL profile of ${parsed.name}#${parsed.tag} on ${platform}: rank, winrate, KDA, champion pool, recent matches and AI insights.`,
    openGraph: { title, images: [`/api/og/player?name=${parsed.name}&tag=${parsed.tag}®ion=${region}`] },
    alternates: { canonical: `/lol/${region}/${slug}` },
  };
}

export const revalidate = 60;

export default async function LolPlayerPage({ params }: { params: Promise<Params> }) {
  const { region, slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) notFound();
  const platform = region.toUpperCase() as Platform;
  if (!(platform in PLATFORM_TO_ROUTING)) notFound();

  const { account, summoner } = await PlayerService.findOrCreate(parsed.name, parsed.tag, platform);
  const summary = await PlayerService.summary(account.puuid, platform);
  const [matches, champions] = await Promise.all([
    PlayerService.recentMatches(account.puuid, 20),
    PlayerService.championStats(account.puuid),
  ]);

  return (
    <div className="container py-8">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ProfilePage',
            about: {
              '@type': 'Person',
              name: `${account.gameName}#${account.tagLine}`,
              identifier: account.puuid,
            },
          }),
        }}
      />

      {/* Header */}
      <div className="glass relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-hero opacity-40" />
        <div className="relative flex flex-col gap-6 p-8 md:flex-row md:items-center">
          <div className="relative">
            {summoner?.profileIconId != null ? (
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/${summoner.profileIconId}.png`}
                width={96}
                height={96}
                alt=""
                className="rounded-xl border-2 border-electric/40 shadow-glow"
              />
            ) : (
              <div className="h-24 w-24 rounded-xl bg-obsidian-800" />
            )}
            {summoner?.summonerLevel != null && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-md bg-obsidian-900 px-2 py-0.5 font-mono text-xs font-bold text-challenger">
                {summoner.summonerLevel}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl font-bold md:text-4xl">
                {account.gameName}
                <span className="text-graphite-400">#{account.tagLine}</span>
              </h1>
              <Badge variant="muted">{platform}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {summary?.soloTier && (
                <RankBadge tier={summary.soloTier} rank={summary.soloRank} lp={summary.soloLP} size="lg" />
              )}
              {summary?.soloWinrate != null && (
                <span className="font-mono text-sm text-graphite-300">
                  {summary.soloWins}W / {summary.soloLosses}L ·{' '}
                  <span
                    className={
                      summary.soloWinrate >= 0.55
                        ? 'text-emerald-400'
                        : summary.soloWinrate >= 0.5
                          ? 'text-electric'
                          : 'text-red-400'
                    }
                  >
                    {formatPercent(summary.soloWinrate)}
                  </span>
                </span>
              )}
              {summary?.lastSyncedAt && (
                <span className="font-mono text-xs text-graphite-400">
                  synced {timeAgo(summary.lastSyncedAt)}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <form action={`/api/players/${account.puuid}/sync`} method="post">
              <button className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:border-electric/40">
                Refresh
              </button>
            </form>
            <Link
              href={`/lol/${region}/${slug}/live`}
              className="rounded-lg bg-gradient-electric px-4 py-2 text-sm font-semibold text-obsidian-950 shadow-glow"
            >
              Live game
            </Link>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
        <StatCard label="games" value={matches.length} />
        <StatCard
          label="winrate"
          value={
            summary?.soloWinrate != null ? formatPercent(summary.soloWinrate) : '—'
          }
          accent="electric"
        />
        <StatCard
          label="avg kda"
          value={
            matches.length
              ? (
                  matches.reduce((s, m) => s + m.kda, 0) / matches.length
                ).toFixed(2)
              : '—'
          }
        />
        <StatCard
          label="cs / min"
          value={
            matches.length
              ? (matches.reduce((s, m) => s + m.csPerMin, 0) / matches.length).toFixed(2)
              : '—'
          }
        />
        <StatCard
          label="vision"
          value={
            matches.length
              ? (matches.reduce((s, m) => s + m.visionScore, 0) / matches.length).toFixed(1)
              : '—'
          }
        />
        <StatCard
          label="damage / m"
          value={
            matches.length
              ? formatNumber(
                  matches.reduce((s, m) => s + m.damageDealtToChampions, 0) / matches.length,
                )
              : '—'
          }
          accent="challenger"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="matches">
            <TabsList>
              <TabsTrigger value="matches">Matches</TabsTrigger>
              <TabsTrigger value="champions">Champions</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
            <TabsContent value="matches">
              <MatchesList matches={matches} puuid={account.puuid} />
            </TabsContent>
            <TabsContent value="champions">
              <ChampionPoolChart data={champions.slice(0, 10).map((c) => ({ ...c, champion: `Champ ${c.championId}` }))} />
            </TabsContent>
            <TabsContent value="performance">
              <PerformanceChart
                data={matches
                  .slice()
                  .reverse()
                  .map((m, i) => ({
                    match: `#${i + 1}`,
                    game: i + 1,
                    kda: Number(m.kda.toFixed(2)),
                    cs: Number(m.csPerMin.toFixed(2)),
                    vision: m.visionScore,
                    win: m.win ? 1 : 0,
                  }))}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <AIInsightPanel
            puuid={account.puuid}
            name={account.gameName}
            summary={summary}
            matches={matches}
            champions={champions}
          />
        </div>
      </div>
    </div>
  );
}

function MatchesList({
  matches,
  puuid,
}: {
  matches: Awaited<ReturnType<typeof PlayerService.recentMatches>>;
  puuid: string;
}) {
  if (!matches.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-graphite-300">
          No matches indexed yet — syncing in background, refresh in a few seconds.
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-2">
      {matches.map((m) => {
        const me = m;
        const teamMates = m.match.participants.filter((p) => p.teamId === me.teamId);
        const enemies = m.match.participants.filter((p) => p.teamId !== me.teamId);
        return (
          <Card
            key={m.id}
            className={`border-l-4 transition hover:border-electric/30 ${
              me.win ? 'border-l-emerald-400/70' : 'border-l-red-400/70'
            }`}
          >
            <CardContent className="grid grid-cols-12 items-center gap-3 p-4">
              <div className="col-span-3 md:col-span-2">
                <div
                  className={`font-mono text-xs font-bold uppercase ${
                    me.win ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {me.win ? 'Victory' : 'Defeat'}
                </div>
                <div className="text-xs text-graphite-300">
                  {timeAgo(Number(m.match.gameStartMs))}
                </div>
                <div className="mt-1 text-[11px] font-mono text-graphite-400">
                  {Math.round(m.match.gameDurationS / 60)}m · Q{m.match.queueId}
                </div>
              </div>
              <div className="col-span-3 md:col-span-2 flex items-center gap-2">
                <div className="h-10 w-10 rounded-md bg-obsidian-800 ring-1 ring-white/10" />
                <div>
                  <div className="text-sm font-semibold">{me.championName}</div>
                  <div className="text-[11px] font-mono text-graphite-400">
                    {me.position || '—'}
                  </div>
                </div>
              </div>
              <div className="col-span-3 md:col-span-2 font-mono">
                <div className="text-sm">
                  <span className="text-white">{me.kills}</span>/
                  <span className="text-red-400">{me.deaths}</span>/
                  <span className="text-white">{me.assists}</span>
                </div>
                <div className="text-xs text-graphite-300">{me.kda.toFixed(2)} KDA</div>
              </div>
              <div className="col-span-3 md:col-span-2 font-mono text-xs">
                <div>{me.csTotal} CS · {me.csPerMin.toFixed(1)}/m</div>
                <div className="text-graphite-400">{me.visionScore} vision</div>
              </div>
              <div className="col-span-12 md:col-span-4 text-[11px] text-graphite-400">
                <div className="truncate">
                  <span className="text-graphite-300">Team:</span>{' '}
                  {teamMates.map((p) => p.championName).join(', ')}
                </div>
                <div className="truncate">
                  <span className="text-graphite-300">Enemy:</span>{' '}
                  {enemies.map((p) => p.championName).join(', ')}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
