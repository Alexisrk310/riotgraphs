import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legends of Runeterra Stats",
  description: "Legends of Runeterra profile analytics, decks and win rates.",
  alternates: { canonical: "/lor" },
};

export default function LorHub() {
  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gradient-electric">Legends of Runeterra</h1>
      <p className="mt-2 text-muted-foreground">Deck analytics, match history and meta trends.</p>
    </main>
  );
}
