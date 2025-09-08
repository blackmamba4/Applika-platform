import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Optional: read from env, fallback to "files"
const FILES_BUCKET =
  process.env.NEXT_PUBLIC_FILES_BUCKET?.trim() || "files";

function jlog(msg: string, meta: Record<string, any> = {}) {
  try { console.log(JSON.stringify({ scope: "coverletters", msg, ...meta })); }
  catch { console.log("[coverletters]", msg, meta); }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const t0 = Date.now();
  const { id } = await ctx.params;
  const rid = req.headers.get("x-request-id") || Math.random().toString(36).slice(2);

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  jlog("PATCH.start", { id, rid });

  try {
    const body = await req.json().catch(() => null as any);
    const title: unknown = body?.title;
    const content: unknown = body?.content;
    const meta: unknown = body?.meta;

    if (
      typeof title !== "string" &&
      typeof content !== "string" &&
      (typeof meta !== "object" || meta === null)  
    ) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: auth, error: authErr } = await supabase.auth.getUser();
    if (authErr || !auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = auth.user.id;

    // Build update payload
    const update: Record<string, any> = { updated_at: new Date().toISOString() };
    if (typeof title === "string")   update.title = title.trim().slice(0, 200);
    if (typeof content === "string") update.content = content;
    if (meta && typeof meta === "object") update.meta = meta;         // <— persist meta JSON


    const { data, error } = await supabase
      .from("cover_letters")
      .update(update)
      .eq("id", id)
      .eq("user_id", userId)
      .select("id, updated_at")
      .single();

    if (error) {
      jlog("PATCH.db.error", { id, rid, code: error.code, message: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    jlog("PATCH.ok", { id, rid, ms: Date.now() - t0 });
    return NextResponse.json({ ok: true, id: data.id, updated_at: data.updated_at });
  } catch (e: any) {
    jlog("PATCH.crash", { id, rid, err: e?.message || String(e) });
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

/** Optional tiny GET for debugging */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("cover_letters")
    .select("id, title, content, meta, cv_file_path, updated_at")
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
