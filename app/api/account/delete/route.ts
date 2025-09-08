import { NextResponse } from "next/server";
import { createClient as createSSRClient } from "@/lib/supabase/server"; // your server SSR client that handles cookies
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  // 1) verify session
  const supabase = await createSSRClient();
  const { data: { user }, error: getUserErr } = await supabase.auth.getUser();
  if (getUserErr || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const admin = createAdminClient();

  // 2) delete app data first (RPC) — optional but recommended
  // If you didn't create the function, you can comment this out.
  try {
    await admin.rpc("app.delete_user_data", { p_uid: user.id });
  } catch (e: any) {
    // If the RPC doesn't exist or fails, surface a helpful message
    return NextResponse.json(
      { error: e?.message || "Failed deleting user data" },
      { status: 500 }
    );
  }

  // 3) delete auth user (irreversible)
  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
  if (delErr) {
    return NextResponse.json(
      { error: delErr.message || "Failed deleting auth user" },
      { status: 400 }
    );
  }

  // 4) sign out to clear cookies on this client (best-effort)
  await supabase.auth.signOut();

  return NextResponse.json({ ok: true });
}
