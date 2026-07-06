import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Developers — RiotGraphs API",
  description: "Public API access, docs, and rate limits for RiotGraphs data.",
  alternates: { canonical: "/developers" },
};

export default function DevelopersPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gradient-electric">Developers</h1>
      <p className="mt-2 text-muted-foreground">
        Build on top of RiotGraphs. REST API with generous free tier, higher limits on Team plan.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <Card className="glass">
          <CardHeader><CardTitle>Base URL</CardTitle></CardHeader>
          <CardContent>
            <pre className="rounded bg-black/50 p-4 text-xs num-mono">https://riotgraphs.com/api</pre>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader><CardTitle>Authentication</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Include your API key as a bearer token.</p>
            <pre className="mt-2 rounded bg-black/50 p-4 text-xs num-mono">Authorization: Bearer YOUR_KEY</pre>
          </CardContent>
        </Card>
      </div>

      <Card className="glass mt-6">
        <CardHeader><CardTitle>Endpoints</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm num-mono">
            <li>GET /api/tier-list?patch=14.10&role=MIDDLE&tier=PLATINUM_PLUS</li>
            <li>POST /api/ai/insights  {`{ puuid, region }`}</li>
            <li>POST /api/players/:puuid/sync  {`{ region, routing, count }`}</li>
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
