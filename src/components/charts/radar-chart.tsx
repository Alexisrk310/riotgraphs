"use client";

import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from "recharts";

export interface RadarPoint {
  metric: string;
  value: number;
  fullMark?: number;
}

export function RadarPerfChart({ data }: { data: RadarPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="80%">
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
          <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" tick={false} />
          <Radar
            name="Player"
            dataKey="value"
            stroke="hsl(var(--electric))"
            fill="hsl(var(--electric))"
            fillOpacity={0.3}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
