import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractTextFromFile } from "@/lib/extractors/cv";
import { Buffer } from "node:buffer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
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
    let res: Response;
    try {
      res = await fetch(signed.signedUrl);
    } catch (fetchError: any) {
      console.error("[cv/resolve] fetch error:", fetchError?.message || fetchError);
      return NextResponse.json({ 
        error: `Failed to download CV: ${fetchError?.message || "Network error"}` 
      }, { status: 500 });
    }

    if (!res.ok) {
      console.error("[cv/resolve] download failed:", res.status, res.statusText);
      return NextResponse.json({ error: `download failed ${res.status}` }, { status: 500 });
    }

    let ab: ArrayBuffer;
    let buf: Buffer;
    try {
      ab = await res.arrayBuffer();
      buf = Buffer.from(ab);
    } catch (bufferError: any) {
      console.error("[cv/resolve] buffer conversion error:", bufferError?.message || bufferError);
      return NextResponse.json({ 
        error: `Failed to process CV file: ${bufferError?.message || "Buffer error"}` 
      }, { status: 500 });
    }

    const filename = prof.cv_url.split("/").pop() || "cv.bin";
    const mime = res.headers.get("content-type") || "application/octet-stream";

    // Build a real File instance for the extractor
    const file = new File([buf], filename, { type: mime });

    let text = "";
    try {
      text = await extractTextFromFile(file);
    } catch (extractError: any) {
      console.error("[cv/resolve] extractTextFromFile error:", extractError?.message || extractError);
      return NextResponse.json({ 
        error: `Text extraction failed: ${extractError?.message || "Unknown error"}` 
      }, { status: 500 });
    }

    return NextResponse.json({
      filename,
      signedUrl: signed.signedUrl,
      text,
    });
  } catch (error: any) {
    console.error("[cv/resolve] unexpected error:", error?.message || error);
    return NextResponse.json({ 
      error: `Unexpected error: ${error?.message || "Unknown error"}` 
    }, { status: 500 });
  }
}
