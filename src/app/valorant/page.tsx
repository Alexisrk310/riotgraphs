import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Valorant Stats",
  description: "Valorant profile analytics, act rank, agent winrates and match history.",
  alternates: { canonical: "/valorant" },
};

export default function ValHub() {
  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gradient-electric">Valorant</h1>
      <p className="mt-2 text-muted-foreground">Coming soon: agent picks, KAST, ADR and act rank analytics.</p>
    </main>
  );
}
