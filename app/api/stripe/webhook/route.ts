// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { PLANS, TOKEN_PACKS } from "@/lib/billing/config";

export const runtime = "nodejs";

// Initialize Stripe only when needed to avoid build-time errors
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });
};

export async function POST(req: NextRequest) {
  const body = await req.text(); // important: raw body
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Pull metadata we set in checkout
        const md = session.metadata || {};
        const userId = md.user_id;
        const kind = md.kind; // 'plan' | 'pack'
        const mode = md.mode as "payment" | "subscription" | undefined;

        if (!userId) break;

        // --- Handle packs (one-time token credit)
        if (kind === "pack" || mode === "payment") {
          // Prefer explicit metadata amount; fallback to priceId mapping if missing
          let amount = Number(md.pack_amount || 0);
          if (!amount) {
            // fallback: look up price from the session (expand to get line item price id)
            const stripe = getStripe();
            const s = await stripe.checkout.sessions.retrieve(session.id, { expand: ["line_items"] });
            const priceId = s.line_items?.data?.[0]?.price?.id;
            const pack = Object.values(TOKEN_PACKS).find((p) => p.stripePriceId === priceId);
            amount = pack?.amount ?? 0;
          }

          if (amount > 0) {
            const { error: rpcErr } = await supabase.rpc("credit_tokens_profile", {
              p_user_id: userId,
              p_amount: amount,
              p_reason: `stripe:pack_${md.pack_code || "unknown"}`,
              p_meta: { session_id: session.id, price_id: md.pack_price_id || "" },
            } as any);
            if (rpcErr) console.error("credit_tokens_profile error:", rpcErr.message);
          }
        }

        // --- Handle plans (subscription start)
        if (kind === "plan" || mode === "subscription") {
          // Resolve plan code & quota
          let planCode = md.plan_code || "";
          let quota = Number(md.plan_quota || 0);

          if (!planCode || !quota) {
            // Fallback: infer from price id
            const stripe = getStripe();
            const s = await stripe.checkout.sessions.retrieve(session.id, { expand: ["line_items", "subscription"] });
            const priceId = s.line_items?.data?.[0]?.price?.id;
            const plan = Object.values(PLANS).find((p) => p.stripePriceId === priceId);
            if (plan) {
              planCode = plan.code;
              quota = plan.quota ?? 0;
            }
          }

          if (planCode) {
            const { error: updErr } = await supabase
              .from("profiles")
              .update({
                plan: planCode.charAt(0).toUpperCase() + planCode.slice(1), // e.g., 'regular' -> 'Regular'
                plan_quota: quota,
                plan_quota_remaining: quota,
                plan_cycle_anchor: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("id", userId);
            if (updErr) console.error("profiles update (plan) error:", updErr.message);
          }
        }

        break;
      }

      // Optional: when a subscription renews, reset monthly quota
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as any)?.subscription?.id ?? (typeof (invoice as any)?.subscription === "string" ? (invoice as any).subscription : undefined);

        // We usually need to map sub -> customer -> our user id via Stripe Customer metadata
        // If you also store user_id in Customer metadata, you can look up and reset here.
        // For now we skip; your ensure_plan_cycle RPC on page load will handle resets.
        console.log("invoice.payment_succeeded for subscription", subId);
        break;
      }

      default:
        // Ignore other events
        break;
    }
  } catch (err) {
    console.error("Webhook handler failed:", err);
    // Don't fail the webhook unless it's a signature/parse error
  }

  return NextResponse.json({ received: true });
}
