import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: prof } = await supabase.from("profiles").select("cv_url").eq("id", user.id).maybeSingle();
  if (prof?.cv_url) {
    await supabase.storage.from("cvs").remove([prof.cv_url]);
  }
  await supabase.from("profiles").update({ cv_url: null }).eq("id", user.id);

  return NextResponse.json({ ok: true });
}
