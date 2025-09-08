// app/api/fetch-company-about/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchCompanyAbout } from "@/lib/extractors/fetchCompanyAbout";
import { summarizeCompanyAbout } from "@/lib/extractors/summarizeCompanyAbout";

/** Logs (quiet unless enabled) */
const DEBUG_FETCH_ABOUT =
  process.env.DEBUG_FETCH_ABOUT === "1" || process.env.COMPANYABOUT_LOG === "1";
const log = (level: "info" | "warn" | "error", msg: string, meta: Record<string, any> = {}) => {
  if (!DEBUG_FETCH_ABOUT && level === "info") return;
  const line = { scope: "fetch-company-about", level, msg, ...meta };
  (level === "error" ? console.error : level === "warn" ? console.warn : console.info)(
    JSON.stringify(line)
  );
};

// defaults (env-overridable)
const MAX_PAGES = Math.min(Math.max(Number(process.env.COMPANYABOUT_MAX_PAGES || 6), 2), 12);
const CONCURRENCY = Math.min(Math.max(Number(process.env.COMPANYABOUT_CONCURRENCY || 4), 1), 6);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const t0 = Date.now();
  try {
    const body = await req.json().catch(() => ({} as any));
    const { homepageUrl, companyName = "", jobTitle = "", jobDescHtml = "" } = body || {};

    if (!homepageUrl || typeof homepageUrl !== "string") {
      return NextResponse.json({ error: "homepageUrl is required" }, { status: 400 });
    }

    // normalize to origin
    let normalized = homepageUrl;
    try {
      const u = new URL(homepageUrl);
      normalized = `${u.protocol}//${u.host}`;
    } catch {}

    log("info", "start", {
      homepageUrl,
      normalized,
      companyName: companyName || undefined,
      jobTitle: jobTitle || undefined,
      maxPages: MAX_PAGES,
      concurrency: CONCURRENCY,
    });

    // crawl (returns { text, visited })
    const tCrawl = Date.now();
    const about = await fetchCompanyAbout(normalized, {
      maxPages: MAX_PAGES,
      concurrency: CONCURRENCY,
    });
    log("info", "crawl.ok", {
      ms: Date.now() - tCrawl,
      visitedCount: about.visited?.length || 0,
      visited: about.visited,
      aboutLen: (about.text || "").length,
      aboutPreview: (about.text || "").slice(0, 220),
    });

    // summarize (same behavior as ingest-job):
    // - if OPENAI key present -> 4 short paragraphs
    // - else -> sensible fallback from the raw text
    let companyAbout = "";
    try {
      const tSum = Date.now();
      companyAbout = await summarizeCompanyAbout({
        companyName,
        jobTitle,
        jobDescHtml,     // you can pass empty; the summarizer handles it
        aboutText: about.text || "",
      });
      log("info", "summarize.ok", {
        ms: Date.now() - tSum,
        outLen: companyAbout.length,
        outPreview: companyAbout.slice(0, 220),
      });
    } catch (e: any) {
      log("warn", "summarize.fail", { err: e?.message || String(e) });
      companyAbout = about.text || "";
    }

    log("info", "done", { totalMs: Date.now() - t0 });

    // keep the same response shape the UI expects
    return NextResponse.json({
      companyHomepage: normalized,
      companyAbout, // summarized (or raw fallback)
    });
  } catch (e: any) {
    log("error", "unhandled", { err: e?.message || String(e) });
    return NextResponse.json(
      { error: e?.message || "failed to fetch company about" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    hint: "POST { homepageUrl: string, companyName?: string, jobTitle?: string, jobDescHtml?: string }",
  });
}
