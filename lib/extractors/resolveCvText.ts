// lib/extractors/resolveCvText.ts
import { createClient } from "@/lib/supabase/server";
import { extractTextFromFile } from "@/lib/extractors/cv";

const collapse = (s: string) => (s || "").replace(/\s+/g, " ").trim();
const BUCKET = "cvs";

function isHttpUrl(s: string) {
  return /^https?:\/\//i.test(s);
}
function guessNameFromUrl(url: string | undefined) {
  if (!url) return "cv.pdf";
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).pop() || "cv";
    return last.includes(".") ? last : `${last}.pdf`;
  } catch {
    return "cv.pdf";
  }
}
async function fetchWithTimeout(url: string, ms = 15000): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, {
      redirect: "follow",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari",
        accept: "*/*",
      },
      signal: ctrl.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(t);
  }
}

export async function resolveCvText(): Promise<string> {
  try {
    const supabase = await createClient();
    const { data: auth, error: authErr } = await supabase.auth.getUser();
    if (authErr) {
      console.error("[resolveCvText] auth error:", authErr.message);
      return "";
    }
    const user = auth?.user;
    if (!user) {
      console.error("[resolveCvText] no user in session");
      return "";
    }

    // 1) read cv_url
    const { data, error } = await supabase
      .from("profiles")
      .select("cv_url")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("[resolveCvText] profiles select error:", error.message);
      return "";
    }

    let cvUrl = collapse((data?.cv_url as string) || "");
    if (!cvUrl) {
      console.warn("[resolveCvText] cv_url empty for user:", user.id);
      return "";
    }

    // 2) sign storage path like "users/.../file.pdf"
    if (!isHttpUrl(cvUrl)) {
      let objectPath = cvUrl;
      if (cvUrl.startsWith(BUCKET + "/")) {
        objectPath = cvUrl.slice(BUCKET.length + 1);
      }
      const { data: signed, error: signErr } = await supabase
        .storage
        .from(BUCKET)
        .createSignedUrl(objectPath, 600); // 10 minutes

      if (signErr || !signed?.signedUrl) {
        console.error("[resolveCvText] createSignedUrl error:", signErr?.message, { objectPath });
        return "";
      }
      cvUrl = signed.signedUrl;
    }

    

    // 3) download
    const res = await fetchWithTimeout(cvUrl);
    if (!res.ok) {
      console.error("[resolveCvText] fetch not ok:", res.status, res.statusText);
      return "";
    }

    const contentType = res.headers.get("content-type") || "application/octet-stream";
    const ab = await res.arrayBuffer();
    const file = new File([ab], guessNameFromUrl(cvUrl), { type: contentType });

    // 4) extract text using your extractor
    let text = "";
    try {
      text = await extractTextFromFile(file);
    } catch (e: any) {
      console.error("[resolveCvText] extractTextFromFile error:", e?.message || e);
      text = "";
    }
    

    // 5) collapse & fallback decode if empty
    let out = collapse(text || "");
    if (!out) {
      try {
        const fallbackTxt = new TextDecoder("utf-8", { fatal: false }).decode(new Uint8Array(ab));
        out = collapse(fallbackTxt);
        if (!out) console.warn("[resolveCvText] extracted text empty after fallback", { contentType });
      } catch {
        console.warn("[resolveCvText] fallback decode failed");
      }
    }

    return out;
  } catch (e: any) {
    console.error("[resolveCvText] exception:", e?.message || e);
    return "";
  }
}
