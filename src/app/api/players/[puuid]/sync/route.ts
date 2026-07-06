import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getQueue, QUEUE_NAMES } from "@/workers/queue";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const paramsSchema = z.object({ puuid: z.string().min(10) });
const bodySchema = z.object({
  region: z.string().min(2),
  routing: z.enum(["americas", "europe", "asia", "sea"]),
  count: z.number().int().min(1).max(100).default(20),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ puuid: string }> }
) {
  try {
    const p = paramsSchema.safeParse(await params);
    if (!p.success) return NextResponse.json({ error: "invalid_params" }, { status: 400 });
    const body = bodySchema.safeParse(await req.json().catch(() => ({})));
    if (!body.success) return NextResponse.json({ error: "invalid_body", details: body.error.flatten() }, { status: 400 });

    const queue = getQueue(QUEUE_NAMES.syncPlayer);
    const job = await queue.add(
      "sync-player",
      { puuid: p.data.puuid, region: body.data.region, routing: body.data.routing, count: body.data.count },
      { removeOnComplete: 500, removeOnFail: 200, attempts: 3, backoff: { type: "exponential", delay: 5000 } }
    );
    return NextResponse.json({ jobId: job.id, status: "queued" }, { status: 202 });
  } catch (err) {
    logger.error({ err }, "sync route failed");
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
