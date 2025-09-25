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
    const lookupKey = isLiveMode ? (planEntry?.lookupKey || packEntry?.lookupKey) : null;

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
    
    // If using lookup key, retrieve the actual price ID first
    let finalPriceId = priceId;
    if (lookupKey) {
      try {
        const prices = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 });
        if (prices.data.length > 0) {
          finalPriceId = prices.data[0].id;
          console.log(`✅ Found price ID ${finalPriceId} for lookup key ${lookupKey}`);
        } else {
          console.error(`❌ No price found for lookup key: ${lookupKey}`);
          return NextResponse.json({ error: `Price not found for lookup key: ${lookupKey}` }, { status: 400 });
        }
      } catch (error) {
        console.error(`❌ Error retrieving price for lookup key ${lookupKey}:`, error);
        return NextResponse.json({ error: "Failed to retrieve price" }, { status: 500 });
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: finalPriceId, quantity: 1 }],
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
