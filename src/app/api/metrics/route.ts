import { NextResponse } from "next/server";
import { register, collectDefaultMetrics, Counter } from "prom-client";

const g = globalThis as unknown as { __prom_init__?: boolean; __prom_reqs__?: Counter<string> };
if (!g.__prom_init__) {
  collectDefaultMetrics({ prefix: "riotgraphs_" });
  g.__prom_reqs__ = new Counter({
    name: "riotgraphs_http_requests_total",
    help: "HTTP requests",
    labelNames: ["route", "method", "status"] as const,
  });
  g.__prom_init__ = true;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const text = await register.metrics();
  return new NextResponse(text, { headers: { "content-type": register.contentType } });
}
