import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractTextFromFile } from "@/lib/extractors/cv";
import { Buffer } from "node:buffer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // read profile.cv_url (should be the object path in the 'cvs' bucket)
  const { data: prof, error: pErr } = await supabase
    .from("profiles")
    .select("cv_url")
    .eq("id", user.id)
    .maybeSingle();

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });
  if (!prof?.cv_url) return NextResponse.json({ error: "no_cv" }, { status: 404 });

  // signed URL to download
  const { data: signed, error: sErr } = await supabase
    .storage
    .from("cvs")
    .createSignedUrl(prof.cv_url, 60 * 5); // 5 min

  if (sErr || !signed?.signedUrl) {
    return NextResponse.json({ error: sErr?.message || "signed url failed" }, { status: 500 });
  }

  // fetch file into bytes
  const res = await fetch(signed.signedUrl);
  if (!res.ok) {
    return NextResponse.json({ error: `download failed ${res.status}` }, { status: 500 });
  }

  const ab = await res.arrayBuffer();
  const buf = Buffer.from(ab);
  const filename = prof.cv_url.split("/").pop() || "cv.bin";
  const mime = res.headers.get("content-type") || "application/octet-stream";

  // Build a real File instance for the extractor
  const file = new File([buf], filename, { type: mime });

  const text = await extractTextFromFile(file);

  return NextResponse.json({
    filename,
    signedUrl: signed.signedUrl,
    text,
  });
}
