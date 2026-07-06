import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — RiotGraphs Premium",
  description: "Free, Pro and Team plans. Unlock advanced analytics, AI coaching and API access.",
  alternates: { canonical: "/pricing" },
};

const PLANS = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    features: ["Basic profile analytics", "Match history (last 20)", "Public tier list", "Community insights"],
    cta: "Get started",
    href: "/",
  },
  {
    id: "PRO",
    name: "Pro",
    price: 6.99,
    features: [
      "Unlimited match history",
      "AI-powered coaching",
      "Advanced champion analytics",
      "Live game insights",
      "No ads",
      "Priority sync",
    ],
    cta: "Upgrade",
    href: "/api/stripe/checkout?plan=PRO",
    highlight: true,
  },
  {
    id: "TEAM",
    name: "Team",
    price: 24.99,
    features: [
      "Everything in Pro",
      "Up to 5 accounts",
      "Team dashboards",
      "Scrim analytics",
      "API access (10k req/day)",
      "Priority support",
    ],
    cta: "Contact sales",
    href: "/api/stripe/checkout?plan=TEAM",
  },
];

export default function PricingPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <header className="mb-14 text-center">
        <h1 className="text-5xl font-bold text-gradient-electric">Pricing</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Start free. Upgrade when you want deeper insights. Cancel any time.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((p) => (
          <Card key={p.id} className={`glass ${p.highlight ? "ring-2 ring-electric" : ""}`}>
            <CardHeader>
              <CardTitle className="flex items-baseline justify-between">
                <span>{p.name}</span>
                <span className="text-3xl font-bold num-mono">
                  {p.price === 0 ? "Free" : `$${p.price}`}
                  {p.price !== 0 && <span className="text-sm text-muted-foreground">/mo</span>}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="mb-6 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-electric">→</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant={p.highlight ? "challenger" : "default"} className="w-full">
                <Link href={p.href}>{p.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
