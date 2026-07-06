import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ matchId: string }>;
}): Promise<Metadata> {
  const { matchId } = await params;
  return {
    title: `Match ${matchId}`,
    description: `Detailed breakdown for match ${matchId}.`,
    alternates: { canonical: `/matches/${matchId}` },
  };
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      participants: { orderBy: { teamId: "asc" } },
      teams: true,
    },
  });
  if (!match) notFound();

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Match {match.id}</h1>
        <p className="text-muted-foreground">
          Patch {match.patch ?? "?"} · Queue {match.queueId} · {formatDuration(match.gameDurationS ?? 0)}
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {[100, 200].map((teamId) => (
          <Card key={teamId} className="glass">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Team {teamId === 100 ? "Blue" : "Red"}</span>
                <Badge variant={match.teams.find((t) => t.teamId === teamId)?.win ? "success" : "destructive"}>
                  {match.teams.find((t) => t.teamId === teamId)?.win ? "Victory" : "Defeat"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-xs">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="p-1">Player</th>
                    <th className="p-1">Champ</th>
                    <th className="p-1">KDA</th>
                    <th className="p-1">CS</th>
                    <th className="p-1">Gold</th>
                  </tr>
                </thead>
                <tbody>
                  {match.participants
                    .filter((p) => p.teamId === teamId)
                    .map((p) => (
                      <tr key={p.puuid} className="border-t border-border">
                        <td className="p-1">{p.puuid.slice(0, 8)}</td>
                        <td className="p-1">{p.championName}</td>
                        <td className="p-1 num-mono">{p.kills}/{p.deaths}/{p.assists}</td>
                        <td className="p-1 num-mono">{p.csTotal}</td>
                        <td className="p-1 num-mono">{(p.goldEarned / 1000).toFixed(1)}k</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
