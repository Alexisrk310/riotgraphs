"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export interface ChampionPoolPoint {
  champion: string;
  games: number;
  winrate: number;
}

export function ChampionPoolChart({ data }: { data: ChampionPoolPoint[] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <XAxis
            dataKey="champion"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            angle={-30}
            textAnchor="end"
          />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
            }}
          />
          <Bar dataKey="games" fill="hsl(var(--electric))" radius={[6, 6, 0, 0]} />
          <Bar dataKey="winrate" fill="hsl(var(--challenger))" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
