// app/api/billing/switch-plan/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PLANS } from "@/lib/billing/config";

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
    if (!auth?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { newPlanCode } = (await req.json()) as { newPlanCode: string };
    if (!newPlanCode) {
      return NextResponse.json({ error: "Missing newPlanCode" }, { status: 400 });
    }

    // Validate the new plan exists
    const newPlan = PLANS[newPlanCode as keyof typeof PLANS];
    if (!newPlan) {
      return NextResponse.json({ error: "Invalid plan code" }, { status: 400 });
    }

    // Use service role client for database operations
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get current user profile
    console.log("🔍 Fetching user profile...");
    const { data: profile, error: profileError } = await serviceSupabase
      .from("profiles")
      .select("plan, plan_quota, stripe_customer_id, stripe_subscription_id")
      .eq("id", auth.user.id)
      .single();

    if (profileError) {
      console.error("❌ Profile fetch error:", profileError);
      return NextResponse.json({ error: "Failed to get user profile" }, { status: 500 });
    }
    

    // Check if user is already on this plan
    if (profile.plan?.toLowerCase() === newPlan.name.toLowerCase()) {
      return NextResponse.json({ error: "Already on this plan" }, { status: 400 });
    }

    // Handle free plan switching (cancel Stripe subscription)
    if (newPlanCode === "free") {
      
      // Cancel Stripe subscription if it exists
      if (profile.stripe_subscription_id) {
        try {
          const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
          await stripe.subscriptions.cancel(profile.stripe_subscription_id);
        } catch (stripeError) {
          console.error("❌ Error cancelling Stripe subscription:", stripeError);
          // Continue with plan update even if Stripe cancellation fails
        }
      }
    } else {
      // For paid plan switches, create new checkout session first
      // The old subscription will be cancelled by the webhook after successful payment
      
      try {
        const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
        
        // Create new checkout session for the new plan
        
        // Use lookup_key for live mode, priceId for test mode
        const isLiveMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_');
        const lookupKey = isLiveMode ? newPlan.lookupKey : null;
        
        // If using lookup key, retrieve the actual price ID first
        let finalPriceId = newPlan.stripePriceId;
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
        
        const checkoutSession = await stripe.checkout.sessions.create({
          mode: "subscription",
          payment_method_types: ["card"],
          line_items: [{ price: finalPriceId, quantity: 1 }],
          success_url: `${process.env.NEXT_PUBLIC_STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: process.env.NEXT_PUBLIC_STRIPE_CANCEL_URL,
          customer_email: auth.user.email,
          metadata: {
            user_id: auth.user.id,
            kind: "plan",
            mode: "subscription",
            plan_code: newPlanCode,
            plan_quota: newPlan.quota.toString(),
            plan_price_id: newPlan.stripePriceId,
            is_plan_switch: "true",
            old_subscription_id: profile.stripe_subscription_id || "",
          },
        });
        
        
        // Return the checkout URL for the user to complete payment
        return NextResponse.json({
          success: true,
          message: `Please complete payment to switch to ${newPlan.name} plan`,
          checkoutUrl: checkoutSession.url,
          requiresPayment: true,
        });
        
      } catch (stripeError) {
        console.error("❌ Error creating checkout session:", stripeError);
        return NextResponse.json({ 
          error: "Failed to create checkout session. Please try again or contact support." 
        }, { status: 500 });
      }
    }

    // Update the user's profile immediately with the new plan
    const updateData: any = {
      plan: newPlan.name,
      plan_quota: newPlan.quota,
      plan_quota_remaining: newPlan.quota, // Reset quota for new plan
      plan_cycle_anchor: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Clear Stripe data when switching to free plan
    if (newPlanCode === "free") {
      updateData.stripe_customer_id = null;
      updateData.stripe_subscription_id = null;
    }

    const { error: updateError } = await serviceSupabase
      .from("profiles")
      .update(updateData)
      .eq("id", auth.user.id);

    if (updateError) {
      console.error("❌ Failed to update user profile:", updateError);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully switched to ${newPlan.name} plan`,
      newPlan: newPlan.name,
      newQuota: newPlan.quota,
    });

  } catch (e: any) {
    console.error("❌ Plan switch error:", e);
    return NextResponse.json({ error: e?.message || "Plan switch failed" }, { status: 500 });
  }
}
