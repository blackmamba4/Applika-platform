// app/api/billing/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { PLANS, TOKEN_PACKS } from "@/lib/billing/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Initialize Stripe only when needed to avoid build-time errors
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" });
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { mode, priceId } = (await req.json()) as { mode: "subscription" | "payment"; priceId: string };
    if (!mode || !priceId) return NextResponse.json({ error: "Missing mode/priceId" }, { status: 400 });

    // Figure out what this priceId is (plan or pack)
    const planEntry = Object.values(PLANS).find((p) => p.stripePriceId === priceId);
    const packEntry = Object.values(TOKEN_PACKS).find((p) => p.stripePriceId === priceId);

    if (mode === "subscription" && !planEntry) {
      return NextResponse.json({ error: "Unknown plan priceId" }, { status: 400 });
    }
    if (mode === "payment" && !packEntry) {
      return NextResponse.json({ error: "Unknown pack priceId" }, { status: 400 });
    }

    // Use lookup_key for live mode, priceId for test mode
    const isLiveMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_');
    const useLookupKey = isLiveMode && (planEntry?.lookupKey || packEntry?.lookupKey);

    // Rich metadata so the webhook knows exactly what to do
    const metadata: Record<string, string> = {
      user_id: auth.user.id,
      mode,
    };
    if (planEntry) {
      metadata.kind = "plan";
      metadata.plan_code = planEntry.code;
      metadata.plan_quota = String(planEntry.quota ?? 0);
      metadata.plan_price_id = planEntry.stripePriceId ?? "";
    }
    if (packEntry) {
      metadata.kind = "pack";
      metadata.pack_code = packEntry.code;
      metadata.pack_amount = String(packEntry.amount ?? 0);
      metadata.pack_price_id = packEntry.stripePriceId ?? "";
    }

    const stripe = getStripe();
    
    // Create line items based on whether we're using lookup keys or price IDs
    const lineItems = useLookupKey ? 
      [{ price_data: { lookup_key: planEntry?.lookupKey || packEntry?.lookupKey }, quantity: 1 }] :
      [{ price: priceId, quantity: 1 }];

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: lineItems,
      success_url: process.env.NEXT_PUBLIC_STRIPE_SUCCESS_URL || "http://localhost:3000/pricing/success",
      cancel_url: process.env.NEXT_PUBLIC_STRIPE_CANCEL_URL || "http://localhost:3000/pricing",
      customer_email: auth.user.email ?? undefined,
      metadata,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "checkout failed" }, { status: 500 });
  }
}
