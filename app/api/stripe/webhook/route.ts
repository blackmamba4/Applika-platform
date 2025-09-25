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
  console.log("🔔 Webhook received at:", new Date().toISOString());
  
  const body = await req.text(); // important: raw body
  const sig = req.headers.get("stripe-signature");
  
  console.log("📝 Request details:", {
    hasBody: !!body,
    bodyLength: body.length,
    hasSignature: !!sig,
    userAgent: req.headers.get("user-agent"),
    contentType: req.headers.get("content-type")
  });

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
    console.log("✅ Webhook signature verified successfully");
    console.log("📋 Event type:", event.type);
    console.log("🆔 Event ID:", event.id);
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
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    console.log("✅ Supabase client initialized successfully");
  } catch (err: any) {
    console.error("❌ Failed to initialize Supabase client:", err.message);
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
  }

  try {
    console.log("🔄 Processing event type:", event.type);
    
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("💳 Checkout session completed:", {
          sessionId: session.id,
          mode: session.mode,
          paymentStatus: session.payment_status,
          customerEmail: session.customer_email
        });

        // Pull metadata we set in checkout
        const md = session.metadata || {};
        const userId = md.user_id;
        const kind = md.kind; // 'plan' | 'pack'
        const mode = md.mode as "payment" | "subscription" | undefined;

        console.log("📊 Session metadata:", {
          userId,
          kind,
          mode,
          allMetadata: md
        });

        console.log("🔍 Detailed metadata check:", {
          hasUserId: !!userId,
          hasKind: !!kind,
          hasMode: !!mode,
          planCode: md.plan_code,
          planQuota: md.plan_quota,
          packCode: md.pack_code,
          packAmount: md.pack_amount
        });

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
            console.log("💰 Crediting tokens to user:", { userId, amount, reason: `stripe:pack_${md.pack_code || "unknown"}` });
            const { error: rpcErr } = await supabase.rpc("credit_topup_tokens", {
              p_user_id: userId,
              p_amount: amount,
              p_reason: `stripe:pack_${md.pack_code || "unknown"}`,
              p_meta: { session_id: session.id, price_id: md.pack_price_id || "" },
            } as any);
            if (rpcErr) {
              console.error("❌ credit_topup_tokens error:", rpcErr.message, rpcErr);
            } else {
              console.log("✅ Successfully credited", amount, "tokens to user");
            }
          }
        }

        // --- Handle plans (subscription start)
        if (kind === "plan" || mode === "subscription") {
          console.log("📋 Processing plan subscription for user:", userId);
          
          // Resolve plan code & quota
          let planCode = md.plan_code || "";
          let quota = Number(md.plan_quota || 0);

          console.log("📊 Initial plan data from metadata:", { planCode, quota });

          if (!planCode || !quota) {
            console.log("🔍 Plan data missing from metadata, fetching from Stripe...");
            // Fallback: infer from price id (but this won't work in live mode with lookup keys)
            const stripe = getStripe();
            const s = await stripe.checkout.sessions.retrieve(session.id, { expand: ["line_items", "subscription"] });
            const priceId = s.line_items?.data?.[0]?.price?.id;
            console.log("💰 Retrieved price ID from Stripe:", priceId);
            
            // Try to find plan by price ID (works in test mode)
            const plan = Object.values(PLANS).find((p) => p.stripePriceId === priceId);
            if (plan) {
              planCode = plan.code;
              quota = plan.quota ?? 0;
              console.log("✅ Found plan from price ID:", { planCode, quota, planName: plan.name });
            } else {
              console.error("❌ No plan found for price ID:", priceId);
              console.error("❌ This is expected in live mode when using lookup keys");
              console.error("❌ The checkout session should include plan metadata");
              return NextResponse.json({ error: "Plan data missing from checkout metadata" }, { status: 400 });
            }
          }

          if (planCode) {
            // Check if this is a plan switch (has old_subscription_id in metadata)
            const oldSubscriptionId = md.old_subscription_id;
            
            if (oldSubscriptionId) {
              console.log("🔄 This is a plan switch, will cancel old subscription:", oldSubscriptionId);
              
              // Cancel the old subscription
              try {
                const stripe = getStripe();
                await stripe.subscriptions.cancel(oldSubscriptionId);
                console.log("✅ Successfully cancelled old subscription:", oldSubscriptionId);
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
            
            console.log("🔄 Updating user profile with plan:", { userId, planUpdate });
            
            const { data: updateData, error: updErr } = await supabase
              .from("profiles")
              .update(planUpdate)
              .eq("id", userId)
              .select();
            
            if (updErr) {
              console.error("❌ profiles update (plan) error:", updErr.message, updErr);
            } else {
              console.log("✅ Successfully updated user plan to:", planCode);
              console.log("📊 Update result:", updateData);
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
      console.log("🔄 Subscription updated:", {
        subscriptionId: subscription.id,
        status: subscription.status,
        metadata: subscription.metadata
      });

      // Check if this is a plan switch
      if (subscription.metadata?.switched_at && subscription.metadata?.user_id) {
        const userId = subscription.metadata.user_id;
        const planCode = subscription.metadata.plan_code;
        const quota = Number(subscription.metadata.plan_quota || 0);

        console.log("📋 Processing plan switch:", { userId, planCode, quota });

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
      console.log("🗑️ Subscription cancelled:", {
        subscriptionId: subscription.id,
        customerId: subscription.customer
      });

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
            console.log("ℹ️ Subscription cancellation was part of plan switch, not updating to free plan");
          } else {
            console.log("📋 Updating user to free plan after subscription cancellation:", profile.id);
            
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
            } else {
              console.log("✅ Successfully updated user to free plan after cancellation");
            }
          }
        } else {
          console.log("ℹ️ Subscription cancellation was not the user's current subscription, ignoring");
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
  } catch (err: any) {
    console.error("❌ Webhook handler failed:", {
      error: err?.message || String(err),
      stack: err?.stack,
      eventType: event?.type,
      eventId: event?.id,
      name: err?.name,
      code: err?.code
    });
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  console.log("✅ Webhook processing completed successfully");
  return NextResponse.json({ received: true });
}
