import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [users, summoners, matches, insights] = await Promise.all([
    prisma.user.count(),
    prisma.summoner.count(),
    prisma.match.count(),
    prisma.aIInsight.count(),
  ]);
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Users", value: users },
          { label: "Summoners", value: summoners },
          { label: "Matches", value: matches },
          { label: "Insights", value: insights },
        ].map((s) => (
          <Card key={s.label} className="glass">
            <CardHeader><CardTitle className="text-sm text-muted-foreground">{s.label}</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold num-mono">{s.value.toLocaleString()}</div></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
