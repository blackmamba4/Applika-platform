import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // parse multipart
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const key = `users/${user.id}/${randomUUID()}.${ext}`;

  const { error: upErr } = await supabase.storage.from("cvs").upload(key, bytes, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  // save path to profile
  const { error: profErr } = await supabase
    .from("profiles")
    .update({ cv_url: key })
    .eq("id", user.id);
  if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, path: key, filename: file.name });
}
