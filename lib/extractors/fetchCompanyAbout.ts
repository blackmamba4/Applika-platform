// lib/extractors/fetchCompanyAbout.ts
import * as cheerio from "cheerio";
import { sanitizeToText } from "@/lib/html/sanitize";

/** ==== Logging (toggle via env) ==== */
const DEBUG_CA = process.env.COMPANYABOUT_LOG === "1";
const logCA = (msg: string, meta: Record<string, any> = {}) => {
  if (!DEBUG_CA) return;
  try { console.info(JSON.stringify({ scope: "company-about", msg, ...meta })); }
  catch { console.info(`[company-about] ${msg}`, meta); }
};

/** ==== HTTP (direct only) ==== */
const UA =
  process.env.SCRAPER_UA ||
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function collapse(s?: string) {
  return (s || "").replace(/\s+/g, " ").trim();
}

function swapProtocol(u: string, to: "http" | "https") {
  try { const url = new URL(u); url.protocol = to + ":"; return url.toString(); }
  catch { return u; }
}

function blockedReason(html: string): string | null {
  const h = (html || "").toLowerCase();
  if (!html) return "empty";
  if (html.length < 800) return "tiny";
  if (/(captcha|cloudflare|access denied|are you a robot|verify you are human)/i.test(h)) return "botwall";
  if (/please enable javascript/i.test(h)) return "needs-js";
  return null;
}

async function fetchDirectOnce(url: string, signal: AbortSignal) {
  const t0 = Date.now();
  const res = await fetch(url, {
    headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml" },
    cache: "no-store",
    redirect: "follow",
    signal,
  });
  const html = res.ok ? await res.text() : "";
  logCA("fetch.direct", { url, status: res.status, ms: Date.now() - t0, ok: res.ok, htmlLen: html.length });
  return html;
}

async function fetchHtml(url: string, timeoutMs = 45_000): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    // try original scheme
    try {
      const html = await fetchDirectOnce(url, ctrl.signal);
      const reason = blockedReason(html);
      if (!reason) return html;
      logCA("direct.blocked_or_tiny", { url, reason });
    } catch (e: any) {
      logCA("direct.throw", { url, err: e?.message || String(e) });
    }

    // try protocol downgrade/upgrade
    const isHttps = url.startsWith("https://");
    const flipped = swapProtocol(url, isHttps ? "http" : "https");
    if (flipped !== url) {
      try {
        logCA("direct.try_flipped", { from: url, to: flipped });
        const html2 = await fetchDirectOnce(flipped, ctrl.signal);
        const reason2 = blockedReason(html2);
        if (!reason2) return html2;
        logCA("direct.flipped.blocked_or_tiny", { url: flipped, reason: reason2 });
      } catch (e2: any) {
        logCA("direct.flipped.throw", { url: flipped, err: e2?.message || String(e2) });
      }
    }

    return "";
  } finally {
    clearTimeout(timer);
  }
}

/** ==== DOM helpers ==== */
function stripNoise($: cheerio.CheerioAPI) {
  $(
    [
      "script,style,noscript,iframe,svg,canvas,form,button,input,textarea,select",
      "[aria-hidden='true']",
      "[role='dialog']",
      "[id*='cookie' i],[class*='cookie' i],[data-testid*='cookie' i]",
      "[id*='consent' i],[class*='consent' i]",
      ".sr-only,.visually-hidden",
    ].join(",")
  ).remove();
}

function toCleanText(html: string): string {
  return collapse(sanitizeToText(html)); // your sanitizer returns plain text
}

function extractAboutishHtml($: cheerio.CheerioAPI): string {
  const picks: string[] = [];
  const obvious = [
    "[id*='about' i]",
    "[class*='about' i]",
    "section:contains('About')",
    "section:contains('Who We Are')",
    "section:contains('Our Mission')",
    "section:contains('Our Story')",
    "main",
    "article",
  ];

  for (const sel of obvious) {
    const el = $(sel).first();
    if (el && el.length) {
      const html = el.html() || "";
      if (collapse(el.text()).length > 120) picks.push(html);
      if (picks.length >= 2) break;
    }
  }

  if (picks.length === 0) {
    // fallback: biggest text container
    let bestHtml = "";
    let bestLen = 0;
    $("section, div").each((_, el) => {
      const c = $(el);
      const t = collapse(c.text());
      if (t.length > bestLen) { bestLen = t.length; bestHtml = c.html() || ""; }
    });
    if (bestHtml) picks.push(bestHtml);
  }

  const metaDesc =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    $('meta[name="twitter:description"]').attr("content") ||
    "";

  return [metaDesc, ...picks].filter(Boolean).join("\n\n");
}

/** ==== Natural link discovery (homepage only) ==== */
const EXCLUDE = [
  /login|signin|sign-in|signup|sign-up/i,
  /cart|checkout|basket|status|press|privacy|terms|legal|support|help|docs|documentation|developer/i,
  /blog|news|events|careers|jobs|pricing|plans|contact|forum|community/i,
  /\.pdf$/i, /^mailto:/i, /^tel:/i,
];

const ABOUT_TEXT_KEYWORDS = [
  "about", "about us", "who we are", "our story", "mission", "values",
  "what we do", "company", "leadership", "team"
];

const ABOUT_PATH_KEYWORDS = [
  "about", "about-us", "company", "our-story", "mission", "values", "who-we-are", "what-we-do", "team", "leadership"
];

function normalizeUrl(u: string): string {
  try {
    const url = new URL(u);
    url.hash = "";
    const params = url.searchParams;
    // drop common trackers
    ["utm_source","utm_medium","utm_campaign","utm_content","utm_term","gclid","fbclid","ref"].forEach((k) => params.delete(k));
    url.search = params.toString();
    // rm trailing slash on path (except root)
    if (url.pathname.endsWith("/") && url.pathname !== "/") url.pathname = url.pathname.slice(0, -1);
    return url.toString();
  } catch { return u; }
}

function scoreLink(anchorText: string, path: string, inNav: boolean, inHeader: boolean, inFooter: boolean): number {
  const t = anchorText.toLowerCase().trim();
  const p = path.toLowerCase();

  let s = 0;

  // big boost for anchor text that screams "about"
  for (const k of ABOUT_TEXT_KEYWORDS) {
    if (t.includes(k)) s += 40;
  }

  // smaller boost for path keywords
  for (const k of ABOUT_PATH_KEYWORDS) {
    if (p.includes(k)) s += 20;
  }

  // context boosts
  if (inNav || inHeader) s += 10; // primary nav
  if (inFooter) s += 6;           // footer often has About

  // penalties
  if (/careers|jobs|blog|news|pricing|plans|login|signin|signup|contact/i.test(p)) s -= 15;
  if (p.split("/").length > 6) s -= 4; // very deep path? meh

  // tiny preference to shorter paths
  s -= Math.max(0, p.length - 40) * 0.2;

  return s;
}

function discoverFromHomepage(html: string, origin: string) {
  const $ = cheerio.load(html); // RAW — don't strip nav/footer here
  const anchors = $("a[href]");
  const totalAnchors = anchors.length;
  const candidates: { url: string; path: string; text: string; score: number }[] = [];

  anchors.each((_, a) => {
    const hrefRaw = String($(a).attr("href") || "");
    if (!hrefRaw) return;
    if (EXCLUDE.some((re) => re.test(hrefRaw))) return;
    let abs = "";
    try { abs = new URL(hrefRaw, origin).toString(); } catch { return; }
    if (!abs.startsWith(origin)) return;

    const url = normalizeUrl(abs);
    const path = new URL(url).pathname;
    if (EXCLUDE.some((re) => re.test(path))) return;

    const text = collapse($(a).text() || $(a).attr("title") || "");
    const inNav = $(a).closest("nav").length > 0;
    const inHeader = $(a).closest("header").length > 0;
    const inFooter = $(a).closest("footer").length > 0;

    const score = scoreLink(text, path, inNav, inHeader, inFooter);
    candidates.push({ url, path, text, score });
  });

  // dedupe by URL
  const unique = new Map<string, { url: string; path: string; text: string; score: number }>();
  for (const c of candidates) if (!unique.has(c.url)) unique.set(c.url, c);

  const list = Array.from(unique.values()).sort((a, b) => b.score - a.score);
  logCA("discover.natural", {
    totalAnchors,
    internalCandidates: list.length,
    topSamples: list.slice(0, 10).map(x => ({ url: x.url, score: x.score, text: x.text.slice(0, 60) })),
  });
  return list;
}

/** ==== Dedupe/squeeze text ==== */
function squeezeBoilerplate(text: string): string {
  const lines = text.split(/\n+/).map((l) => collapse(l)).filter(Boolean);
  const seen = new Set<string>();
  const keep: string[] = [];

  const NAV_LINE =
    /^(home|about|about us|learn more|learn about us|contact|careers|jobs|menu|subscribe|privacy|terms)$/i;

  let navDropped = 0, dedupShort = 0, dedupLong = 0;

  for (const line of lines) {
    const words = line.split(/\s+/).length;

    if (NAV_LINE.test(line)) { navDropped++; continue; }

    const key = line.toLowerCase();
    if (words <= 6) {
      if (seen.has(key)) { dedupShort++; continue; }
      seen.add(key); keep.push(line); continue;
    }
    if (seen.has(key)) { dedupLong++; continue; }
    seen.add(key); keep.push(line);
  }

  const out = collapse(keep.join("\n"));
  logCA("squeeze.stats", { linesIn: lines.length, kept: keep.length, navDropped, dedupShort, dedupLong, outLen: out.length });
  return out;
}

/**
 * Natural crawl: homepage → top internal "about-ish" links (no guesses),
 * fetch with direct HTTP(S) only (with protocol flip fallback),
 * sanitize + dedupe, and return one compact TEXT block + visited URLs.
 */
export async function fetchCompanyAbout(
  homepageUrl: string,
  opts?: { maxPages?: number; concurrency?: number } // concurrency is ignored in this natural strategy
): Promise<{ text: string; visited: string[] }> {
  let base: URL;
  try { base = new URL(homepageUrl); }
  catch { logCA("start.invalid_url", { homepageUrl }); return { text: "", visited: [] }; }

  const origin = `${base.protocol}//${base.host}`;
  const maxPages = Math.min(Math.max(opts?.maxPages ?? 6, 2), 8);

  logCA("start", { origin, maxPages, strategy: "homepage+top-links" });

  // 1) fetch homepage (raw)
  const homeHtml = await fetchHtml(origin);
  logCA("home.fetch", { ok: Boolean(homeHtml), htmlLen: homeHtml.length });

  // If homepage failed completely, we’re done
  if (!homeHtml) {
    logCA("fallback.no_home", { origin });
    return { text: "", visited: [origin] };
  }

  // 2) discover links naturally from homepage
  const discovered = discoverFromHomepage(homeHtml, origin);

  // 3) choose top K links (plus homepage as source-of-truth context)
  const top = discovered.slice(0, Math.max(0, maxPages - 1));
  const targets = [origin, ...top.map((x) => x.url)];
  logCA("targets", { picked: targets.length, urls: targets });

  // 4) fetch + extract each page sequentially (no need for concurrency here)
  const visited: string[] = [];
  const chunks: string[] = [];

  for (const url of targets) {
    const tFetch = Date.now();
    const html = url === origin ? homeHtml : await fetchHtml(url);
    const ms = Date.now() - tFetch;
    if (!html) {
      logCA("page.empty", { url, ms });
      continue;
    }
    logCA("page.fetched", { url, ms, htmlLen: html.length });

    const $ = cheerio.load(html);
    stripNoise($);
    const aboutish = extractAboutishHtml($);
    const text = toCleanText(aboutish);

    logCA("page.extracted", { url, textLen: text.length, preview: text.slice(0, 180) });

    if (text) {
      chunks.push(text);
      visited.push(url);
    }
  }

  // 5) fallback if nothing extracted
  if (chunks.length === 0) {
    const $ = cheerio.load(homeHtml || "");
    const metaDesc =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="twitter:description"]').attr("content") ||
      "";
    const hero = $("main").first().text() || $("header").first().text();
    const footer = $("footer").first().text();
    const combined = collapse([metaDesc, hero, footer].filter(Boolean).join(" • "));
    const text = sanitizeToText(combined).slice(0, 2000);
    logCA("fallback.home_only", { visited: [origin], len: text.length, preview: text.slice(0, 200) });
    return { text, visited: [origin] };
  }

  // 6) merge + squeeze
  const raw = collapse(chunks.join("\n"));
  const squozen = squeezeBoilerplate(raw);
  logCA("merge.done", { visitedCount: visited.length, rawLen: raw.length, finalLen: squozen.length, preview: squozen.slice(0, 220) });

  return { text: squozen, visited };
}
