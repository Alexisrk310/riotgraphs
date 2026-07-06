import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teamfight Tactics Stats",
  description: "TFT profile analytics, comp winrates, augment tier lists and match history.",
  alternates: { canonical: "/tft" },
};

export default function TftHub() {
  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gradient-electric">Teamfight Tactics</h1>
      <p className="mt-2 text-muted-foreground">Comp analytics, unit tier lists, augment win-rates and more.</p>
    </main>
  );
}
