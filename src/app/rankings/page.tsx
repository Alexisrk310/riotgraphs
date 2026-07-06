import type { Metadata } from "next";
import { RankingService } from "@/domain/lol/ranking.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RankBadge } from "@/components/ui/rank-badge";
import Link from "next/link";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Rankings — Top Players",
  description: "Global and regional player leaderboards across League of Legends, TFT and Valorant.",
  alternates: { canonical: "/rankings" },
};

export default async function RankingsPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; queue?: string }>;
}) {
  const sp = await searchParams;
  const region = sp.region ?? "euw1";
  const queue = sp.queue ?? "RANKED_SOLO_5x5";
  const scope = `REGION:${region.toUpperCase()}`;
  const raw = await RankingService.leaderboard(scope, queue, 1).catch(() => []);
  const rows = (Array.isArray(raw) ? raw : []) as Array<{
    summonerId?: string;
    summonerName?: string;
    tier?: string;
    rank?: string;
    leaguePoints?: number;
    wins?: number;
    losses?: number;
  }>;

  return (
    <main className="container mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gradient-challenger">Rankings</h1>
        <p className="mt-2 text-muted-foreground">Region: {region.toUpperCase()} — Queue: {queue}</p>
      </header>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Challenger & Above</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-muted-foreground">No ladder data yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">Player</th>
                    <th className="p-2">Tier</th>
                    <th className="p-2">LP</th>
                    <th className="p-2">W</th>
                    <th className="p-2">L</th>
                    <th className="p-2">Winrate</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.summonerId ?? i} className="border-t border-border hover:bg-white/5">
                      <td className="p-2 num-mono">{i + 1}</td>
                      <td className="p-2">
                        <Link
                          className="hover:text-electric"
                          href={`/lol/${region}/${encodeURIComponent(r.summonerName ?? "")}`}
                        >
                          {r.summonerName ?? "—"}
                        </Link>
                      </td>
                      <td className="p-2"><RankBadge tier={r.tier ?? "UNRANKED"} rank={r.rank} /></td>
                      <td className="p-2 num-mono">{r.leaguePoints ?? 0}</td>
                      <td className="p-2 num-mono">{r.wins ?? 0}</td>
                      <td className="p-2 num-mono">{r.losses ?? 0}</td>
                      <td className="p-2 num-mono">
                        {(r.wins ?? 0) + (r.losses ?? 0) > 0 ? (((r.wins ?? 0) / ((r.wins ?? 0) + (r.losses ?? 0))) * 100).toFixed(1) : "0"}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
