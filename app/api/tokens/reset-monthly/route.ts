// app/api/tokens/reset-monthly/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // Use service role key for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );


    // Get all users with active plans (not free)
    const { data: profiles, error: fetchError } = await supabase
      .from("profiles")
      .select("id, plan, plan_quota, plan_cycle_anchor")
      .neq("plan", "Free")
      .not("plan_cycle_anchor", "is", null);

    if (fetchError) {
      console.error("❌ Error fetching profiles:", fetchError);
      return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
    }


    const now = new Date();
    const resetResults = [];

    for (const profile of profiles || []) {
      const cycleAnchor = new Date(profile.plan_cycle_anchor);
      const daysSinceLastReset = Math.floor((now.getTime() - cycleAnchor.getTime()) / (1000 * 60 * 60 * 24));

      // Reset if it's been 30+ days since last reset
      if (daysSinceLastReset >= 30) {

        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            plan_quota_remaining: profile.plan_quota,
            plan_cycle_anchor: now.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq("id", profile.id);

        if (updateError) {
          console.error(`❌ Error resetting tokens for user ${profile.id}:`, updateError);
          resetResults.push({ userId: profile.id, success: false, error: updateError.message });
        } else {
          resetResults.push({ userId: profile.id, success: true, plan: profile.plan, quota: profile.plan_quota });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Monthly token reset completed",
      results: resetResults,
      totalProcessed: profiles?.length || 0,
      totalReset: resetResults.filter(r => r.success).length,
    });

  } catch (error) {
    console.error("❌ Monthly reset error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
