import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Live Game",
  description: "Live spectator analytics.",
  robots: { index: false },
};

export default async function LivePage({
  params,
}: {
  params: Promise<{ region: string; slug: string }>;
}) {
  const { region, slug } = await params;
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Live Game — {decodeURIComponent(slug)}</h1>
      <p className="text-muted-foreground">Region: {region.toUpperCase()}</p>
      <Card className="glass mt-6">
        <CardHeader><CardTitle>Spectator</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Live game feature is available for Pro users. Data is streamed from the Riot Spectator API.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
