import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // refresh cycle (idempotent)
   try {
    await supabase.rpc("ensure_plan_cycle", { p_user_id: user.id });
  } catch {
    // ignore if RPC not deployed yet
  }
  const { data, error } = await supabase
    .from("profiles")
    .select("plan, plan_quota, plan_quota_remaining, tokens_remaining")
    .eq("id", user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const plan = data?.plan ?? "Free";
  const planQuota = data?.plan_quota ?? 0;
  const planRemaining = data?.plan_quota_remaining ?? 0;
  const topup = data?.tokens_remaining ?? 0;

  return NextResponse.json({
    plan,
    planQuota,
    planRemaining,
    topup,
    totalAvailable: planRemaining + topup,
  });
}
