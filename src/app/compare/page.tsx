import type { Metadata } from "next";
import { PlayerSearch } from "@/components/player-search";

export const metadata: Metadata = {
  title: "Compare Players",
  description: "Side-by-side comparison of two or more players. See who's better across KDA, CS, vision and win-rate.",
  alternates: { canonical: "/compare" },
};

export default function ComparePage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gradient-electric">Compare Players</h1>
      <p className="mt-2 text-muted-foreground">Enter two Riot IDs to see a head-to-head breakdown.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <PlayerSearch />
        <PlayerSearch />
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Comparison analytics load automatically once both profiles finish syncing.
      </p>
    </main>
  );
}
