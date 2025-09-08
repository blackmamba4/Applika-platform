// app/Dashboard/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "../../components/DashboardClient";

export default async function Page() {
  const supabase = await createClient();

  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes?.user) redirect("/auth/login");
  const user = userRes.user;

  await supabase
    .from("profiles")
    .upsert({ id: user.id, email: user.email ?? "" }, { onConflict: "id" });

  // ✅ Correct: no .catch after await
  {
    const { error } = await supabase.rpc("ensure_plan_cycle", {
      p_user_id: user.id,
    });
    // ignore or log
    if (error) console.warn("ensure_plan_cycle failed:", error.message);
  }

  const { data: prof } = await supabase
    .from("profiles")
    .select("plan, plan_quota_remaining, tokens_remaining, plan_quota")
    .eq("id", user.id)
    .single();

  const plan = prof?.plan ?? "Free";
  const tokensLeft =
    (prof?.plan_quota_remaining ?? 0) + (prof?.tokens_remaining ?? 0);

  return (
    <DashboardClient
      user={{
        email: user.email ?? null,
        name: (user.user_metadata as any)?.full_name ?? null,
        avatarUrl: (user.user_metadata as any)?.avatar_url ?? null,
      }}
      tokensLeft={tokensLeft}
      plan={plan}
    />
  );
}
