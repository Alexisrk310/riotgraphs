import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe, STRIPE_PRICE_IDS } from "@/lib/stripe";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  const url = new URL(req.url);
  const plan = url.searchParams.get("plan") ?? "PRO";
  const priceId = STRIPE_PRICE_IDS[plan];
  if (!priceId) return NextResponse.json({ error: "unknown_plan" }, { status: 400 });

  const checkout = await stripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.NEXT_PUBLIC_APP_URL}/account?upgraded=1`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/pricing`,
    customer_email: session.user.email ?? undefined,
    client_reference_id: (session.user as { id?: string }).id,
    metadata: { plan },
  });
  return NextResponse.redirect(checkout.url ?? "/pricing", { status: 303 });
}
