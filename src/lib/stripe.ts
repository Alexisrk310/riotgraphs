import Stripe from "stripe";
import { env } from "@/lib/env";

let _stripe: Stripe | null = null;
export function stripe(): Stripe {
  if (!_stripe) {
    if (!env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY missing");
    _stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" as any });
  }
  return _stripe;
}

export const STRIPE_PRICE_IDS: Record<string, string | undefined> = {
  PRO: process.env.STRIPE_PRICE_PRO,
  TEAM: process.env.STRIPE_PRICE_TEAM,
};
