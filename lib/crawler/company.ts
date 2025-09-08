import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import * as cheerio from "cheerio";
import psl from "psl";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36 ApplikaBot/1.0";
const TIMEOUT = Number(process.env.SCRAPE_FETCH_TIMEOUT_MS || 9000);

/** Normalize any URL to https:// + keep original protocol if provided. */
export function ensureHttp(u: string) {
  const v = (u || "").trim();
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

/** Get the main registrable domain (eTLD+1), e.g. careers.foo.co.uk -> foo.co.uk */
export function baseOrigin(inputUrl: string) {
  const u = new URL(ensureHttp(inputUrl));
  return `${u.protocol}//${u.hostname}`; // 👈 keep full subdomain, no PSL collapse
}

/** Same site means exact hostname match (keeps subdomains separate) */
export function sameSite(a: string, b: string) {
  const A = new URL(a);
  const B = new URL(b);
  return A.hostname === B.hostname && A.protocol === B.protocol; // 👈 strict match
}

export async function fetchHtml(url: string) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT);
  try {
    const res = await fetch(url, { headers: { "user-agent": UA }, signal: ctl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

export function textify(s?: string | null, max = 20000) {
  return (s || "").replace(/\s+/g, " ").replace(/\u00a0/g, " ").trim().slice(0, max);
}
function cleanLegalNoise(input: string) {
  let t = input.replace(/\s+/g, " ");
  // drop very common disclaimers/noise
  const badBits = [
    /\b(cookies?|cookie settings|accept all cookies|manage cookies)\b/gi,
    /\bprivacy (notice|policy)|terms of (use|service)|legal\b/gi,
    /\bsee (each|the) product page\b/gi,
    /\bmay vary by (country|region|product)\b/gi,
    /\b(this website uses cookies)\b/gi
  ];
  for (const re of badBits) t = t.replace(re, " ");
  return t;
}
export function looksLikeJunk(text: string) {
  const lower = text.toLowerCase();
  const cookieHits = (lower.match(/cookie/g) || []).length;
  const legalHits = (lower.match(/privacy|terms|legal/g) || []).length;
  // very short or dominated by cookie/legal → junk
  if (text.length < 200) return true;
  if (cookieHits + legalHits >= 4) return true;
  return false;
}
/** Use Readability to extract the main content; fallback to <main>/<article> or body text. */
export function extractReadable(html: string, url: string) {
  const dom = new JSDOM(html, { url });
  const doc = dom.window.document;

  // 🔧 remove junk before Readability runs
  const kill = (sel: string) => doc.querySelectorAll(sel).forEach((n) => n.remove());
  // common cookie/consent overlays & layout chrome
  kill("[id*='cookie' i]");
  kill("[class*='cookie' i]");
  kill("[id*='consent' i]");
  kill("[class*='consent' i]");
  kill("[id*='gdpr' i]");
  kill("[class*='gdpr' i]");
  kill("script, style, noscript");
  kill("nav, header, footer, aside");
  // big popups/offcanvas
  kill("[class*='modal' i], [class*='popup' i], [class*='banner' i]");

  const reader = new Readability(doc);
  const article = reader.parse();
  let text = article?.textContent || "";

  // fallback if still empty
  if (!text || text.length < 200) {
    const $ = cheerio.load(html);
    const main = $("main, article").text();
    if (main && main.length > 200) text = main;
    else {
      const meta =
        $('meta[name="description"]').attr("content") ||
        $('meta[property="og:description"]').attr("content") ||
        "";
      text = `${meta}\n${$("body").text()}`;
    }
  }

  return textify(cleanLegalNoise(text), 20000);
}

/** Guess site/display name. */
export function guessNameFrom(html: string, origin: string) {
  const $ = cheerio.load(html);
  const raw =
    $("meta[property='og:site_name']").attr("content") ||
    $("title").text() ||
    new URL(origin).hostname.replace(/^www\./, "");
  return textify(raw.replace(/\|.*/, "").replace(/-.*/, ""), 120);
}

/** Rank links on a page for "about-ish" relevance; return absolute URLs (same site only). */
export function discoverRelevantLinks(html: string, baseUrl: string, limit = 12) {
  const $ = cheerio.load(html);
  const base = new URL(baseUrl);
  const scores: Array<{ url: string; score: number }> = [];

  $("a[href]").each((_, a) => {
    const href = ($(a).attr("href") || "").trim();
    if (!href) return;

    let abs: string;
    try { abs = new URL(href, base).toString(); } catch { return; }

    // must be same "site" (eTLD+1) to avoid wandering the web
    if (!sameSite(abs, baseUrl)) return;

    const u = new URL(abs);
    const path = u.pathname.toLowerCase();
    const text = ($(a).text() || "").toLowerCase();

    // skip junk
    if (/\b(privacy|terms|cookie|login|signup|careers|job|support|contact|faq|sitemap)\b/.test(path)) return;

    // heuristic scoring by slug/text
    let s = 0;
    const hit = (re: RegExp, w: number) => { if (re.test(path) || re.test(text)) s += w; };

    hit(/\babout|about-us|who-we-are|our-story|company|overview|profile\b/, 8);
    hit(/\bmission|purpose|vision|why\b/, 7);
    hit(/\bvalues|principles|culture\b/, 7);
    hit(/\bwhat-we-do|capabilities|solutions|services|products\b/, 7);
    hit(/\bpress|news|media|insights|stories|updates|blog\b/, 6);

    if (s > 0) scores.push({ url: abs, score: s });
  });

  const unique = Array.from(new Map(scores.map(x => [x.url, x])).values());
  unique.sort((a, b) => b.score - a.score);
  return unique.slice(0, limit).map(x => x.url);
}

/** Split into sentences, keep informative ones; dedupe. */
export function keepGoodSentences(text: string, maxSentences = 30) {
  const sentences = text
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length >= 60); // drop very short fluff

  // dedupe near-duplicates
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of sentences) {
    const key = s.toLowerCase().slice(0, 80);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(s);
    }
    if (out.length >= maxSentences) break;
  }
  return out;
}

/** Extract list items near headings that look like values/mission/services. */
export function extractSectionsFrom(html: string) {
  const $ = cheerio.load(html);
  const sections: Record<string, string[]> = {
    mission: [],
    values: [],
    services: [],
    products: [],
  };

  $("h1,h2,h3").each((_, h) => {
    const heading = ($(h).text() || "").trim().toLowerCase();

    // mission-like
    if (/\b(mission|purpose|vision)\b/.test(heading)) {
      // next paragraphs
      let cur = $(h).next();
      for (let i = 0; i < 8 && cur.length; i++) {
        if (/^h[1-3]$/i.test(cur[0].tagName || "")) break;
        if (["p"].includes((cur[0].tagName || "").toLowerCase())) {
          const t = textify(cur.text(), 400);
          if (t) sections.mission.push(t);
        }
        cur = cur.next();
      }
    }

    // values-like
    if (/\b(values?|principles?|culture)\b/.test(heading)) {
      let cur = $(h).next();
      for (let i = 0; i < 10 && cur.length; i++) {
        if (/^h[1-3]$/i.test(cur[0].tagName || "")) break;
        if (["ul", "ol"].includes((cur[0].tagName || "").toLowerCase())) {
          cur.find("li").each((_, li) => {
            const t = textify($(li).text(), 300);
            if (t) sections.values.push(t);
          });
        } else if ((cur[0].tagName || "").toLowerCase() === "p") {
          const t = textify(cur.text(), 300);
          if (t) sections.values.push(t);
        }
        cur = cur.next();
      }
    }

    // services/products-like
    if (/\b(services?|solutions?|capabilities|what we do)\b/.test(heading)) {
      let cur = $(h).next();
      for (let i = 0; i < 10 && cur.length; i++) {
        if (/^h[1-3]$/i.test(cur[0].tagName || "")) break;
        if (["ul", "ol"].includes((cur[0].tagName || "").toLowerCase())) {
          cur.find("li").each((_, li) => {
            const t = textify($(li).text(), 200);
            if (t) sections.services.push(t);
          });
        } else if ((cur[0].tagName || "").toLowerCase() === "p") {
          const t = textify(cur.text(), 300);
          if (t) sections.services.push(t);
        }
        cur = cur.next();
      }
    }

    if (/\b(products?)\b/.test(heading)) {
      let cur = $(h).next();
      for (let i = 0; i < 10 && cur.length; i++) {
        if (/^h[1-3]$/i.test(cur[0].tagName || "")) break;
        if (["ul", "ol"].includes((cur[0].tagName || "").toLowerCase())) {
          cur.find("li").each((_, li) => {
            const t = textify($(li).text(), 200);
            if (t) sections.products.push(t);
          });
        } else if ((cur[0].tagName || "").toLowerCase() === "p") {
          const t = textify(cur.text(), 300);
          if (t) sections.products.push(t);
        }
        cur = cur.next();
      }
    }
  });

  // de-dupe and cap
  for (const k of Object.keys(sections)) {
    const arr = sections[k];
    const seen = new Set<string>();
    sections[k] = arr.filter(x => {
      const key = x.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, k === "values" ? 7 : 10);
  }

  return sections;
}

/** Extract recent initiatives/news lines (from press/news pages), keep sentence-sized. */
export function extractRecentInitiatives(text: string, max = 6) {
  const lines = text
    .split(/[\r\n]+/)
    .map(s => s.trim())
    .filter(Boolean);

  const out: string[] = [];
  for (const line of lines) {
    if (/\b(202[0-9]|20[3-9][0-9]|Q[1-4]\s*20)\b/.test(line) || // dates/years/quarters
        /\b(launch|announce|partnership|acquire|opened|report|award|initiative|program|pilot|expansion)\b/i.test(line)) {
      const cleaned = textify(line, 220);
      if (cleaned.length >= 40) out.push(cleaned);
      if (out.length >= max) break;
    }
  }
  return out;
}

/** Lightweight keyword extraction (keeps domain/industry terms). */
export function extractIndustryKeywords(text: string, max = 12) {
  const stop = new Set([
    "the","and","for","with","you","your","our","are","will","this","that","from",
    "to","of","in","on","a","an","as","at","by","be","is","or","we","it","their","they",
    "have","has","but","if","so","can","us","per","about","more","across","within","into","over",
    "ltd","limited","plc","inc","llc","gmbh","sa","ag"
  ]);
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9+.#/\- ]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !stop.has(w));
  const freq: Record<string, number> = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  const entries = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w)
    .filter(w => !/^\d+$/.test(w));

  const out: string[] = [];
  for (const w of entries) {
    if (out.length >= max) break;
    if (/[+#./-]/.test(w) || w.length >= 4) out.push(w);
  }
  return out;
}
