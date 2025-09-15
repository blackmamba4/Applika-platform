import * as cheerio from "cheerio";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36 ApplikaBot/1.0";
const TIMEOUT = Number(process.env.SCRAPE_FETCH_TIMEOUT_MS || 9000);

export type FetchResult = { $: cheerio.CheerioAPI; html: string; url: string };

export async function fetchWithTimeout(url: string): Promise<string> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const res = await fetch(url, { headers: { "user-agent": UA }, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

export async function loadCheerio(url: string): Promise<FetchResult> {
  const html = await fetchWithTimeout(url);
  const $ = cheerio.load(html);
  return { $, html, url };
}

export async function loadWithPlaywright(url: string): Promise<FetchResult> {
  // Only use if explicitly enabled; requires Node runtime (not Edge).
  if (process.env.SCRAPE_USE_PLAYWRIGHT !== "true") {
    throw new Error("Playwright disabled - set SCRAPE_USE_PLAYWRIGHT=true to enable");
  }
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ userAgent: UA });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: TIMEOUT });
    // small wait for client scripts to inject content (if needed)
    await page.waitForTimeout(400);
    const html = await page.content();
    const $ = cheerio.load(html);
    return { $, html, url };
  } finally {
    await browser.close();
  }
}

export function textify(s?: string | null, max = 10000) {
  return (s || "").replace(/\s+/g, " ").replace(/\u00a0/g, " ").trim().slice(0, max);
}

export function sameOrigin(href: string, base: string) {
  try {
    const a = new URL(href, base);
    const b = new URL(base);
    return a.origin === b.origin;
  } catch { return false; }
}

export function absoluteUrl(href: string, base: string) {
  try { return new URL(href, base).toString(); } catch { return href; }
}

/** Extract JobPosting from JSON-LD if present. */
export function extractJobPostingJSONLD($: cheerio.CheerioAPI) {
  const found: any[] = [];
  $("script[type='application/ld+json']").each((_: any, el: any) => {
    const raw = $(el).contents().text();
    try {
      const json = JSON.parse(raw);
      const arr = Array.isArray(json) ? json : [json];
      for (const node of arr) {
        if (node && (node["@type"] === "JobPosting" || (Array.isArray(node["@type"]) && node["@type"].includes("JobPosting")))) {
          found.push(node);
        }
      }
    } catch {}
  });
  if (!found.length) return null;
  const jp = found[0]; // prefer first
  const title = jp.title || "";
  const company = jp.hiringOrganization?.name || "";
  const companySite =
    jp.hiringOrganization?.sameAs ||
    jp.hiringOrganization?.url ||
    "";
  const desc = jp.description || "";
  const location =
    jp.jobLocation?.address?.addressLocality ||
    jp.jobLocation?.address?.addressRegion ||
    jp.jobLocation?.address?.addressCountry ||
    "";
  return {
    title: textify(title, 200),
    company: textify(company, 200),
    description: textify(stripHtml(desc), 20000),
    companySite: textify(companySite, 500),
    location: textify(location, 200),
  };
}

/** Remove tags; keep list bullets as text. */
export function stripHtml(html: string) {
  // convert <li> to bullet-like lines
  const replaced = html
    .replace(/<\/li>\s*<li>/gi, "\n• ")
    .replace(/<li>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n");
  return cheerio.load(replaced).text();
}

/** Heuristic title: h1 first, fallback og:title or <title>. */
export function heuristicTitle($: cheerio.CheerioAPI) {
  const h1 = textify($("h1").first().text(), 200);
  if (h1) return h1;
  const og = textify($("meta[property='og:title']").attr("content") || "", 200);
  if (og) return og;
  return textify($("title").text(), 200);
}

/** Heuristic company: look for ids/classes containing company/employer/org. */
export function heuristicCompany($: cheerio.CheerioAPI) {
  const need = ["company", "employer", "organization", "org", "hiring"];
  let result = "";
  $("*[id], *[class]").each((_: any, el: any) => {
    if (result) return;
    const id = ($(el).attr("id") || "").toLowerCase();
    const cls = ($(el).attr("class") || "").toLowerCase();
    if (need.some(k => id.includes(k) || cls.includes(k))) {
      const t = textify($(el).text(), 200);
      if (t && t.length <= 120) result = t;
    }
  });
  return result;
}

/** Heuristic description: pick the longest meaningful text block in main/article/section. */
export function heuristicDescription($: cheerio.CheerioAPI) {
  const scopes = ["main", "article", "section", "[role='main']"];
  let best = "";
  for (const s of scopes) {
    $(s).each((_: any, el: any) => {
      const block = textify($(el).text(), 40000);
      if (block && block.length > best.length) best = block;
    });
  }
  // fall back to body if those were empty
  if (best.length < 500) {
    const body = textify($("body").text(), 40000);
    if (body.length > best.length) best = body;
  }
  // Trim boilerplate: try to cut navigation/footers by looking for repetitions
  return best;
}

/** Lightweight keyword extraction from a description. */
export function extractKeywords(text: string, max = 25) {
  const stop = new Set([
    "the","and","for","with","you","your","our","are","will","this","that","from","not",
    "to","of","in","on","a","an","as","at","by","be","is","or","we","it","their","they",
    "have","has","but","if","so","can","us","per","about","more","across","within"
  ]);
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9+.#/ -]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !stop.has(w));
  const freq: Record<string, number> = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  // Prefer words that look like skills/tech (contain +, ., #) or appear often
  const entries = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  const out: string[] = [];
  for (const [w, c] of entries) {
    if (out.length >= max) break;
    if (c >= 2 || /[+#./]/.test(w)) out.push(w);
  }
  return out;
}

/** Find likely “About” link on same origin. */
export function findAboutLinks($: cheerio.CheerioAPI, base: string) {
  const labels = ["about", "about-us", "aboutus", "who-we-are", "our-story", "mission", "values", "company"];
  const links: string[] = [];
  $("a[href]").each((_: any, el: any) => {
    const href = ($(el).attr("href") || "").trim();
    const text = ($(el).text() || "").toLowerCase().trim();
    if (!href) return;
    const abs = absoluteUrl(href, base);
    if (!sameOrigin(abs, base)) return;
    if (labels.some(l => href.toLowerCase().includes(l) || text.includes(l))) {
      links.push(abs);
    }
  });
  // De-dup and cap
  return Array.from(new Set(links)).slice(0, 3);
}

/** Summarise first few paragraphs from a page’s text. */
export function firstGoodParagraphs($: cheerio.CheerioAPI, maxChars = 1200) {
  const chunks: string[] = [];
  $("p").each((_: any, el: any) => {
    const t = textify($(el).text(), 2000);
    if (t && t.length > 40) chunks.push(t);
  });
  const joined = chunks.slice(0, 6).join("\n\n");
  return textify(joined, maxChars);
}
