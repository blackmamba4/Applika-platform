// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
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

  if (!sig) {
    console.error("❌ Missing stripe-signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("❌ STRIPE_WEBHOOK_SECRET environment variable not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", {
      error: err.message,
      stack: err.stack,
      bodyPreview: body.substring(0, 200) + (body.length > 200 ? "..." : ""),
      signature: sig?.substring(0, 20) + "..."
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Use service role key for webhook operations (bypasses RLS)
  let supabase;
  try {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    // Supabase client initialized
  } catch (err: any) {
    console.error("❌ Failed to initialize Supabase client:", err.message);
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
  }

  try {
    
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Pull metadata we set in checkout
        const md = session.metadata || {};
        const userId = md.user_id;
        const kind = md.kind; // 'plan' | 'pack'
        const mode = md.mode as "payment" | "subscription" | undefined;


        if (!userId) {
          console.warn("⚠️ No user_id in session metadata, skipping");
          break;
        }

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
            const { error: rpcErr } = await supabase.rpc("credit_topup_tokens", {
              p_user_id: userId,
              p_amount: amount,
              p_reason: `stripe:pack_${md.pack_code || "unknown"}`,
              p_meta: { session_id: session.id, price_id: md.pack_price_id || "" },
            } as any);
            if (rpcErr) {
              console.error("❌ credit_topup_tokens error:", rpcErr.message, rpcErr);
            } else {
            }
          }
        }

        // --- Handle plans (subscription start)
        if (kind === "plan" || mode === "subscription") {
          
          // Resolve plan code & quota
          let planCode = md.plan_code || "";
          let quota = Number(md.plan_quota || 0);

          if (!planCode || !quota) {
            console.error("❌ Plan data missing from checkout metadata");
            return NextResponse.json({ error: "Plan data missing from checkout metadata" }, { status: 400 });
          }

          if (planCode) {
            // Check if this is a plan switch (has old_subscription_id in metadata)
            const oldSubscriptionId = md.old_subscription_id;
            
            if (oldSubscriptionId) {
              
              // Cancel the old subscription
              try {
                const stripe = getStripe();
                await stripe.subscriptions.cancel(oldSubscriptionId);
              } catch (cancelError) {
                console.error("❌ Error cancelling old subscription:", cancelError);
                // Continue with plan update even if cancellation fails
              }
            }
            
            const planUpdate = {
              plan: planCode.charAt(0).toUpperCase() + planCode.slice(1), // e.g., 'regular' -> 'Regular'
              plan_quota: quota,
              plan_quota_remaining: quota,
              plan_cycle_anchor: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              // Store Stripe customer and subscription IDs for future use
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
            };
            
            
            const { data: updateData, error: updErr } = await supabase
              .from("profiles")
              .update(planUpdate)
              .eq("id", userId)
              .select();
              
            if (updErr) {
              console.error("❌ profiles update (plan) error:", updErr.message, updErr);
            }
          } else {
            console.error("❌ No plan code available to update user profile");
          }
        }

        break;
      }

      // Handle subscription updates (plan changes)
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;

      // Check if this is a plan switch
      if (subscription.metadata?.switched_at && subscription.metadata?.user_id) {
        const userId = subscription.metadata.user_id;
        const planCode = subscription.metadata.plan_code;
        const quota = Number(subscription.metadata.plan_quota || 0);


        if (planCode && quota > 0) {
          const { error: updErr } = await supabase
            .from("profiles")
            .update({
              plan: planCode.charAt(0).toUpperCase() + planCode.slice(1),
              plan_quota: quota,
              plan_quota_remaining: quota,
              plan_cycle_anchor: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              // Store Stripe customer and subscription IDs for future use
              stripe_customer_id: subscription.customer as string,
              stripe_subscription_id: subscription.id,
            })
            .eq("id", userId);

          if (updErr) {
            console.error("❌ Plan switch update error:", updErr.message, updErr);
          } else {
            console.log("✅ Successfully updated plan switch to:", planCode);
          }
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      // Check if this is part of a plan switch (don't set to free if user is switching plans)
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, plan, stripe_subscription_id")
        .eq("stripe_customer_id", subscription.customer)
        .single();

      if (profileError) {
        console.error("❌ Error finding user for cancelled subscription:", profileError);
      } else if (profile) {
        // Only set to free if this was the user's current subscription
        // AND they don't have a new subscription (meaning it's a real cancellation, not a plan switch)
        if (profile.stripe_subscription_id === subscription.id) {
          // Check if user has a newer subscription (plan switch scenario)
          const { data: newerProfile } = await supabase
            .from("profiles")
            .select("stripe_subscription_id")
            .eq("stripe_customer_id", subscription.customer)
            .single();
          
          // If the profile still has a subscription ID, it means they switched plans
          if (newerProfile?.stripe_subscription_id && newerProfile.stripe_subscription_id !== subscription.id) {
          } else {
            
            const { error: updateError } = await supabase
              .from("profiles")
              .update({
                plan: "Free",
                plan_quota: 3,
                plan_quota_remaining: 3,
                plan_cycle_anchor: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                stripe_customer_id: null,
                stripe_subscription_id: null,
              })
              .eq("id", profile.id);

            if (updateError) {
              console.error("❌ Error updating user to free plan:", updateError);
            }
          }
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
        break;
      }

      default:
        // Ignore other events
        break;
    }
  } catch (err) {
    console.error("❌ Webhook handler failed:", {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      eventType: event?.type,
      eventId: event?.id
    });
    // Don't fail the webhook unless it's a signature/parse error
  }

  return NextResponse.json({ received: true });
}
