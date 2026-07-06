import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerSearch } from "@/components/player-search";

export const metadata: Metadata = {
  title: "League of Legends Stats",
  description: "League of Legends profile lookup, tier lists, ladders and champion analytics.",
  alternates: { canonical: "/lol" },
};

export default function LolHub() {
  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gradient-electric">League of Legends</h1>
      <p className="mt-2 text-muted-foreground">The complete analytics suite for LoL players.</p>

      <div className="mt-8 max-w-xl"><PlayerSearch /></div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <Link href="/tier-list"><Card className="glass glass-hover"><CardHeader><CardTitle>Tier List</CardTitle></CardHeader><CardContent>Meta champions by patch and role.</CardContent></Card></Link>
        <Link href="/rankings"><Card className="glass glass-hover"><CardHeader><CardTitle>Rankings</CardTitle></CardHeader><CardContent>Challenger & GM leaderboards.</CardContent></Card></Link>
        <Link href="/compare"><Card className="glass glass-hover"><CardHeader><CardTitle>Compare</CardTitle></CardHeader><CardContent>Head-to-head player analytics.</CardContent></Card></Link>
      </div>
    </main>
  );
}
