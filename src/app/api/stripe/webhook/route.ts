import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { env } from "@/lib/env";
import type Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error({ err }, "invalid stripe signature");
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const userId = s.client_reference_id;
        const plan = (s.metadata?.plan ?? "PREMIUM") as "PREMIUM" | "PRO";
        const stripeSubscriptionId = (s.subscription as string) ?? "";
        if (userId && stripeSubscriptionId) {
          await prisma.user.update({ where: { id: userId }, data: { plan } });
          await prisma.subscription.upsert({
            where: { stripeSubscriptionId },
            update: { status: "ACTIVE", plan },
            create: {
              userId,
              status: "ACTIVE",
              stripeSubscriptionId,
              stripePriceId: (s.metadata?.priceId as string) ?? "",
              plan,
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          });
        }
        break;
      }
      case "customer.subscription.deleted":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: sub.status === "active" ? "ACTIVE" : sub.status === "past_due" ? "PAST_DUE" : "CANCELED" },
        });
        break;
      }
      default:
        logger.info({ type: event.type }, "stripe event ignored");
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    logger.error({ err }, "stripe webhook handler failed");
    return NextResponse.json({ error: "handler_failed" }, { status: 500 });
  }
}
