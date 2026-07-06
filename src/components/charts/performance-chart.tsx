"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export interface PerformancePoint {
  match: string;
  kda: number;
  cs: number;
  vision: number;
}

export function PerformanceChart({ data }: { data: PerformancePoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <XAxis dataKey="match" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="kda" stroke="hsl(var(--electric))" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="cs" stroke="hsl(var(--challenger))" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="vision" stroke="#f59e0b" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
