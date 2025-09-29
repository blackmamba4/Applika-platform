// app/Dashboard/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "@/components/DashboardClient";

export default async function Page() {
  const supabase = await createClient();

  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes?.user) redirect("/auth/login");
  const user = userRes.user;

  // Ensure profile exists
  await supabase
    .from("profiles")
    .upsert({ id: user.id, email: user.email ?? "" }, { onConflict: "id" });

  // Call ensure_plan_cycle to initialize plan quotas for new users
  await supabase.rpc("ensure_plan_cycle", { p_user_id: user.id });

  // Fetch user profile
  const profileResult = await supabase
    .from("profiles")
    .select("plan, plan_quota_remaining, tokens_remaining, plan_quota, first_name, last_name, full_name, desired_role, tone_default")
    .eq("id", user.id)
    .single();

  // Handle profile fetch errors (critical)
  if (profileResult.error) {
    console.error("Profile query failed:", profileResult.error.message);
    redirect("/auth/login");
  }

  const prof = profileResult.data;
  const plan = prof?.plan ?? "Free";
  const planQuotaRemaining = prof?.plan_quota_remaining ?? 0;
  const topupRemaining = prof?.tokens_remaining ?? 0;
  const planQuota = prof?.plan_quota ?? 0;

  return (
    <DashboardClient
      user={{
        email: user.email ?? null,
        name: (user.user_metadata as any)?.full_name ?? null,
        avatarUrl: (user.user_metadata as any)?.avatar_url ?? null,
      }}
      profile={{
        firstName: prof?.first_name,
        lastName: prof?.last_name,
        fullName: prof?.full_name,
        desiredRole: prof?.desired_role,
        toneDefault: prof?.tone_default,
      }}
      plan={plan}
      planQuotaRemaining={planQuotaRemaining}
      topupRemaining={topupRemaining}
      planQuota={planQuota}
    />
  );
}
