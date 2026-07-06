import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RankingService } from "@/domain/lol/ranking.service";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Tier List — Champions Meta",
  description: "Data-driven League of Legends tier list. Winrates, pickrates, banrates by patch, role and rank.",
  alternates: { canonical: "/tier-list" },
};

const ROLES = ["ALL", "TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"] as const;
const TIERS = ["ALL", "PLATINUM_PLUS", "DIAMOND_PLUS", "MASTER_PLUS"] as const;

export default async function TierListPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; tier?: string; patch?: string }>;
}) {
  const sp = await searchParams;
  const list = await RankingService.tierList(
    sp.patch ?? "14.24",
    sp.role ?? "ALL",
    sp.tier ?? "PLATINUM_PLUS",
    "ALL",
  ).catch(() => [] as Awaited<ReturnType<typeof RankingService.tierList>>);

  return (
    <main className="container mx-auto px-4 py-12">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gradient-electric">Tier List</h1>
        <p className="mt-2 text-muted-foreground">
          Live winrates from millions of ranked matches. Updated every 2 hours.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap gap-2">
        {ROLES.map((r) => (
          <Link
            key={r}
            href={`/tier-list?role=${r === "ALL" ? "" : r}&tier=${sp.tier ?? "PLATINUM_PLUS"}`}
            className="rounded-md border border-border px-3 py-1.5 text-sm hover:border-electric"
          >
            {r}
          </Link>
        ))}
      </div>
      <div className="mb-8 flex flex-wrap gap-2">
        {TIERS.map((t) => (
          <Link
            key={t}
            href={`/tier-list?tier=${t === "ALL" ? "" : t}&role=${sp.role ?? ""}`}
            className="rounded-md border border-border px-3 py-1.5 text-sm hover:border-challenger"
          >
            {t.replace("_", "+")}
          </Link>
        ))}
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Ranked Champions</CardTitle>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <p className="text-muted-foreground">No aggregated data yet. Workers must ingest matches first.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">Champion</th>
                    <th className="p-2">Tier</th>
                    <th className="p-2">Winrate</th>
                    <th className="p-2">Pickrate</th>
                    <th className="p-2">Banrate</th>
                    <th className="p-2">Games</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((c, i) => (
                    <tr key={c.id} className="border-t border-border hover:bg-white/5">
                      <td className="p-2 num-mono">{i + 1}</td>
                      <td className="p-2">Champion {c.championId}</td>
                      <td className="p-2"><Badge variant="challenger">{c.tierLabel}</Badge></td>
                      <td className="p-2 num-mono">{(c.winRate * 100).toFixed(1)}%</td>
                      <td className="p-2 num-mono">{(c.pickRate * 100).toFixed(1)}%</td>
                      <td className="p-2 num-mono">{(c.banRate * 100).toFixed(1)}%</td>
                      <td className="p-2 num-mono">{c.games.toLocaleString()}</td>
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
