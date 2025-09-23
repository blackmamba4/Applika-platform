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
    console.log("🔄 Switch plan API called");
    
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      console.log("❌ No authenticated user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    console.log("✅ User authenticated:", auth.user.id);

    const { newPlanCode } = (await req.json()) as { newPlanCode: string };
    if (!newPlanCode) {
      console.log("❌ Missing newPlanCode");
      return NextResponse.json({ error: "Missing newPlanCode" }, { status: 400 });
    }
    
    console.log("📋 Switching to plan:", newPlanCode);

    // Validate the new plan exists
    const newPlan = PLANS[newPlanCode as keyof typeof PLANS];
    if (!newPlan) {
      console.log("❌ Invalid plan code:", newPlanCode);
      return NextResponse.json({ error: "Invalid plan code" }, { status: 400 });
    }
    
    console.log("✅ New plan config:", { name: newPlan.name, quota: newPlan.quota });

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
    
    console.log("✅ Current profile:", { plan: profile.plan, plan_quota: profile.plan_quota });

    // Check if user is already on this plan
    if (profile.plan?.toLowerCase() === newPlan.name.toLowerCase()) {
      return NextResponse.json({ error: "Already on this plan" }, { status: 400 });
    }

    // Handle free plan switching (cancel Stripe subscription)
    if (newPlanCode === "free") {
      console.log("📝 Switching to free plan - will cancel Stripe subscription");
      
      // Cancel Stripe subscription if it exists
      if (profile.stripe_subscription_id) {
        try {
          const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
          console.log("🔄 Cancelling Stripe subscription:", profile.stripe_subscription_id);
          
          await stripe.subscriptions.cancel(profile.stripe_subscription_id);
          console.log("✅ Successfully cancelled Stripe subscription");
        } catch (stripeError) {
          console.error("❌ Error cancelling Stripe subscription:", stripeError);
          // Continue with plan update even if Stripe cancellation fails
        }
      } else {
        console.log("ℹ️ No Stripe subscription found to cancel");
      }
    } else {
      // For paid plan switches, create new checkout session first
      // The old subscription will be cancelled by the webhook after successful payment
      console.log("📝 Switching between paid plans - creating new checkout session");
      
      try {
        const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
        
        // Create new checkout session for the new plan
        console.log("🔄 Creating new checkout session for plan:", newPlanCode);
        
        const checkoutSession = await stripe.checkout.sessions.create({
          mode: "subscription",
          payment_method_types: ["card"],
          line_items: [
            {
              price: newPlan.stripePriceId,
              quantity: 1,
            },
          ],
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
        
        console.log("✅ Created new checkout session:", checkoutSession.id);
        
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
      console.error("Failed to update user profile:", updateError);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully switched to ${newPlan.name} plan`,
      newPlan: newPlan.name,
      newQuota: newPlan.quota,
    });

  } catch (e: any) {
    console.error("Plan switch error:", e);
    return NextResponse.json({ error: e?.message || "Plan switch failed" }, { status: 500 });
  }
}
