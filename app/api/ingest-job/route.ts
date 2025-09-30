// app/api/ingest-job/route.ts
import { NextRequest, NextResponse } from "next/server";
import { resolveCompanyHomepage } from "@/lib/extractors/resolveCompanyHomepage";
import { sanitizeToText } from "@/lib/html/sanitize"; // <-- use this
import { fetchCompanyAbout } from "@/lib/extractors/fetchCompanyAbout";
import { summarizeCompanyAbout } from "@/lib/extractors/summarizeCompanyAbout";
import { validateRequest, schemas, createValidationErrorResponse } from "@/lib/validation";
import { RateLimiter } from "@/lib/error-handler";
import { resolveCvText } from "@/lib/extractors/resolveCvText";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body =
  | { mode: "url"; jobUrl: string; cvMode: "auto" | "manual"; cvText?: string }
  | {
      mode: "manual";
      jobTitle: string;
      jobDesc?: string;       // plain text or html (legacy)
      jobDescHtml?: string;   // preferred
      cvMode: "auto" | "manual";
      cvText?: string;
    };

type Via = "hasdata";

type CachedPayload = {
  jobTitle: string;
  jobDescHtml: string;       // NOTE: we store PLAIN TEXT now
  companyName: string;
  companyHomepage: string;
  companyAbout: string;
  confidence: "low" | "medium" | "high";
  via: Via;
  cached: true;
};

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const HASDATA_KEY = (process.env.HASDATA_API_KEY || "").trim() || "07c87260-e9d0-4565-a5fe-6bb9a3793437";

/* ---------------- tiny cache & usage guard ---------------- */

const CACHE_TTL_MS = Number(process.env.INGEST_CACHE_TTL_MS || 6 * 60 * 60 * 1000);
const CACHE_MAX = Number(process.env.INGEST_CACHE_MAX || 500);
const cache = new Map<string, { value: CachedPayload; exp: number }>();

const DAILY_CAP = Number(process.env.INGEST_DAILY_CAP || 300);
const COOLDOWN_STREAK = Number(process.env.INGEST_COOLDOWN_STREAK || 3);
const COOLDOWN_WINDOW_MS = Number(process.env.INGEST_COOLDOWN_WINDOW_MS || 60_000);
const usage = new Map<string, { date: string; count: number; streak: number; lastAt: number }>();

// Additional rate limiter for job ingestion (web scraping is expensive)
const ingestionRateLimiter = new RateLimiter(10, 60000); // 10 requests per minute

/* ---------------- utils ---------------- */

const collapse = (s?: string) => (s || "").replace(/\s+/g, " ").trim();

function todayKeyUTC() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate()
  ).padStart(2, "0")}`;
}

function getClientKey(req: NextRequest) {
  const uid = req.headers.get("x-user-id");
  if (uid) return `uid:${uid}`;
  const fwd = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  if (fwd) return `ip:${fwd}`;
  return "ip:unknown";
}

function normalizeJobUrl(raw: string) {
  try {
    const u = new URL(raw);
    ["utm_source","utm_medium","utm_campaign","utm_content","utm_term","from","fbclid","gclid"].forEach((p) =>
      u.searchParams.delete(p)
    );
    u.hash = "";
    return u.toString();
  } catch {
    return raw.trim();
  }
}

function pickCountryFromUrl(url: string): "US" | "GB" {
  try {
    const host = new URL(url).host.toLowerCase();
    if (host.endsWith("indeed.com")) return "US";
    if (host.endsWith("indeed.co.uk") || host.endsWith("indeed.uk")) return "GB";
    return "GB";
  } catch {
    return "GB";
  }
}

/* ---------------- LLM Company Name Extraction ---------------- */

async function suggestCompanyDomain(companyName: string, jobDescText: string, jobTitle: string): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const systemPrompt = `You are a domain name predictor. Given a company name, predict the most likely website domain.

Rules:
- Return ONLY the domain name without .com (e.g., "bachysoletanche"), nothing else
- No "https://", "www.", or ".com" suffix
- Use common domain patterns (companyname, company-name, etc.)
- If unsure, return "UNKNOWN"

Common patterns:
- "Bachy Soletanche" → "bachysoletanche"
- "Microsoft Corporation" → "microsoft"
- "Johnson & Johnson" → "jnj" or "johnsonandjohnson"
- "AT&T" → "att"
- "SmoothCart" → "smoothcart"`;

  const userPrompt = `Company Name: ${companyName}
Job Title: ${jobTitle}

Job Description Context:
${jobDescText.slice(0, 1000)}

Predict the most likely website domain:`;

  try {
    console.info("[suggestCompanyDomain:start]", {
      companyName,
      jobTitle,
      jobDescLength: jobDescText.length
    });
    
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      max_tokens: 30,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    const suggested = response.choices?.[0]?.message?.content?.trim();
    
    // Clean up the response - remove .com, https://, www. if present
    let cleanedDomain = suggested;
    if (cleanedDomain) {
      cleanedDomain = cleanedDomain
        .replace(/^https?:\/\//, '') // Remove https:// or http://
        .replace(/^www\./, '') // Remove www.
        .replace(/\.com$/, '') // Remove .com suffix
        .replace(/\.org$/, '') // Remove .org suffix
        .replace(/\.net$/, '') // Remove .net suffix
        .toLowerCase(); // Convert to lowercase
    }
    
    console.info("[suggestCompanyDomain:response]", {
      raw: suggested,
      cleaned: cleanedDomain,
      isUnknown: cleanedDomain === "unknown",
      isValid: cleanedDomain && cleanedDomain !== "unknown"
    });
    
    return cleanedDomain && cleanedDomain !== "unknown" ? cleanedDomain : null;
  } catch (error) {
    console.warn("[suggestCompanyDomain:error]", error);
    return null;
  }
}

/* ---------------- Google Search Fallback ---------------- */

async function searchCompanyWebsite(companyName: string): Promise<string | null> {
  if (!process.env.GOOGLE_SEARCH_API_KEY || !process.env.GOOGLE_SEARCH_ENGINE_ID) {
    console.warn("[searchCompanyWebsite] Missing Google API credentials");
    return null;
  }

  try {
    const searchQuery = `"${companyName}" company website`;
    const url = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(searchQuery)}&num=3`;
    
    console.info("[searchCompanyWebsite:start]", { companyName, searchQuery });
    
    const response = await fetch(url, { 
      cache: "no-store",
      signal: AbortSignal.timeout(10000) // 10s timeout
    });
    
    if (!response.ok) {
      console.warn("[searchCompanyWebsite:api-error]", { status: response.status });
      return null;
    }
    
    const data = await response.json();
    const items = data.items || [];
    
    console.info("[searchCompanyWebsite:results]", { 
      totalResults: items.length,
      results: items.map((item: any) => ({ title: item.title, url: item.link }))
    });
    
    // Look for the most likely company website
    for (const item of items) {
      const url = item.link;
      const title = item.title?.toLowerCase() || "";
      
      // Skip job boards and aggregators
      if (url.includes('indeed.com') || url.includes('linkedin.com') || 
          url.includes('glassdoor.com') || url.includes('monster.com') ||
          url.includes('ziprecruiter.com') || url.includes('careerbuilder.com')) {
        continue;
      }
      
      // Prefer URLs that look like company websites
      if (url.match(/^https?:\/\/(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}\/?$/)) {
        console.info("[searchCompanyWebsite:found]", { url, title });
        return url;
      }
    }
    
    // Fallback: return first non-job-board result
    for (const item of items) {
      const url = item.link;
      if (!url.includes('indeed.com') && !url.includes('linkedin.com') && 
          !url.includes('glassdoor.com') && !url.includes('monster.com')) {
        console.info("[searchCompanyWebsite:fallback]", { url });
        return url;
      }
    }
    
    return null;
  } catch (error) {
    console.warn("[searchCompanyWebsite:error]", error);
    return null;
  }
}

/* ---------------- HasData fetchers ---------------- */

async function fetchViaHasData(
  url: string,
  ms = 70000
): Promise<{ html: string; origin: string; via: Via; structured?: any }> {
  if (!HASDATA_KEY) throw new Error("Missing HASDATA_API_KEY");

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);

  const u = new URL(url);
  const origin = u.origin;
  const isIndeed = /(^|\.)indeed\./i.test(u.host);
  const country = pickCountryFromUrl(url);

  try {
    if (isIndeed) {
      const ep = new URL("https://api.hasdata.com/scrape/indeed/job");
      ep.searchParams.set("url", url);

      const res = await fetch(ep.toString(), {
        method: "GET",
        signal: ctrl.signal,
        headers: {
          "x-api-key": HASDATA_KEY,
          "Content-Type": "application/json",
          "User-Agent": UA,
          Accept: "application/json",
        },
      });

      const data = await res.json().catch(() => ({}));

      const descHtml =
        data?.job?.description_full_html ??
        data?.job?.descriptionFullHtml ??
        data?.job?.description_html ??
        data?.job?.descriptionHtml ??
        null;

      const html =
        (typeof descHtml === "string" && descHtml) ||
        (typeof data?.job?.description === "string" ? data.job.description : "") ||
        (typeof data?.html === "string" ? data.html : "") ||
        (typeof data?.content === "string" ? data.content : "") ||
        "";

      return { html, origin, via: "hasdata", structured: data };
    }

    const ep = "https://api.hasdata.com/scrape/web";
    const body = { url, outputFormat: ["html"], proxyCountry: country, proxyType: "residential" };

    const res = await fetch(ep, {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "x-api-key": HASDATA_KEY,
        "Content-Type": "application/json",
        "User-Agent": UA,
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    const html = (data?.content as string) || (data?.html as string) || "";
    return { html, origin, via: "hasdata" };
  } finally {
    clearTimeout(timer);
  }
}

/* ---------------- cache & usage helpers ---------------- */

function getCache(url: string): CachedPayload | null {
  const key = normalizeJobUrl(url);
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.exp) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}

function setCache(url: string, payload: Omit<CachedPayload, "cached">) {
  if (cache.size >= CACHE_MAX) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  const key = normalizeJobUrl(url);
  cache.set(key, { value: { ...payload, cached: true }, exp: Date.now() + CACHE_TTL_MS });
}

function checkAndBumpUsage(req: NextRequest): { ok: boolean; reason?: string } {
  const k = getClientKey(req);
  const day = todayKeyUTC();
  const now = Date.now();
  const row = usage.get(k) || { date: day, count: 0, streak: 0, lastAt: 0 };

  if (row.date !== day) { row.date = day; row.count = 0; row.streak = 0; row.lastAt = 0; }
  row.streak = row.lastAt && (now - row.lastAt <= COOLDOWN_WINDOW_MS) ? row.streak + 1 : 1;
  row.lastAt = now; row.count += 1;
  usage.set(k, row);

  if (row.count > DAILY_CAP) return { ok: false, reason: "cap" };
  if (row.streak > COOLDOWN_STREAK) return { ok: false, reason: "cooldown" };
  return { ok: true };
}

/* ---------------- route handlers ---------------- */

export async function POST(req: NextRequest) {
  try {
    // Validate request body
    const validation = await validateRequest(req, schemas.ingestJob);
    if (!validation.isValid) {
      return NextResponse.json(
        createValidationErrorResponse(validation.errors),
        { status: 400 }
      );
    }

    const body = validation.data as Body;

    // Rate limiting check (in addition to existing usage tracking)
    const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    if (!ingestionRateLimiter.isAllowed(clientIP)) {
      const resetTime = ingestionRateLimiter.getResetTime(clientIP);
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please wait before making another request.",
          code: "RATE_LIMITED",
          retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: {
            "Retry-After": Math.ceil((resetTime - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    const gate = checkAndBumpUsage(req);
    if (!gate.ok) {
      const msg = gate.reason === "cap"
        ? `Daily fetch cap reached. Please try again tomorrow or paste the job description manually.`
        : `You’ve fetched several times in a row. Please wait a minute or paste the job description manually.`;
      return NextResponse.json({ error: msg, note: "manual_paste_recommended" }, { status: 429 });
    }

    // Manual mode -> turn whatever we receive into PLAIN TEXT
    if (body.mode === "manual") {
      const jobTitle = collapse(body.jobTitle);
      const raw = body.jobDescHtml ?? body.jobDesc ?? "";
      const jobDescText = sanitizeToText(raw);                   // <- TEXT
      console.info("[jobDesc:text]", jobDescText.slice(0, 600));

      const homepage =
        (await resolveCompanyHomepage({ html: "", companyHint: "", jobOrigin: undefined, orgUrlHint: undefined })) || "";

      let companyAbout = "";
      if (homepage) {
        try {
          const about = await fetchCompanyAbout(homepage, { maxPages: 6, concurrency: 4 });
          console.info("[companyAbout:visited]", about.visited);
          console.info("[companyAbout:rawTextPreview]", about.text.slice(0, 600));
          companyAbout = await summarizeCompanyAbout({
            companyName: "",
            jobTitle,
            jobDescHtml: jobDescText,                             // pass TEXT
            aboutText: about.text,
          });
        } catch {
          companyAbout = "";
        }
      }

      // Resolve CV text if in auto mode
      let cvTextResolved = "";
      if (body.cvMode === "auto") {
        try {
          cvTextResolved = await resolveCvText();
        } catch (error: any) {
          console.error("[ingest-job] CV resolution failed:", error?.message || error);
          cvTextResolved = "";
        }
      }

      return NextResponse.json({
        jobTitle,
        jobDescHtml: jobDescText,                                 // field name kept, value is TEXT
        companyName: "",
        companyHomepage: homepage || "",
        companyAbout,
        confidence: "low",
        via: "hasdata",
        cached: true,
        cvTextResolved,
      });
    }

    // URL mode
    const normalizedUrl = normalizeJobUrl(body.jobUrl);
    const cached = getCache(normalizedUrl);
    if (cached) return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } });

    const { html, origin, structured } = await fetchViaHasData(normalizedUrl, 70000);

    const j = structured?.job || {};
    const jobTitle: string = collapse(j.title || j.jobTitle || "");
    const companyName: string = collapse(
      j.company || j.hiring_organization?.name || j.hiringOrganization?.name || ""
    );
    
    console.info("[companyName:structured]", {
      original: j.company || j.hiring_organization?.name || j.hiringOrganization?.name || "",
      collapsed: companyName,
      length: companyName.length
    });
    
    // LLM-based website domain suggestion if we have a company name
    let suggestedDomain = "";
    if (companyName && companyName.length > 2) {
      console.info("[domain:llm-suggestion]", "Getting LLM suggestion for website domain");
      try {
        const jobDescText = sanitizeToText(html);
        suggestedDomain = await suggestCompanyDomain(companyName, jobDescText, jobTitle);
        if (suggestedDomain) {
          console.info("[domain:llm-suggested]", { companyName, suggestedDomain });
        } else {
          console.info("[domain:llm-failed]", "LLM domain suggestion failed");
        }
      } catch (error) {
        console.warn("[domain:llm-error]", error);
      }
    } else {
      console.info("[companyName:missing]", "No company name from structured data");
    }
    
    console.info("[companyName:final]", {
      name: companyName,
      length: companyName.length,
      suggestedDomain,
      willUseForClearbit: !!companyName
    });
    const orgUrlHint: string = collapse(
      j.company_url ||
        j.companyUrl ||
        j.hiring_organization?.sameAs ||
        j.hiringOrganization?.sameAs ||
        j.hiringOrganization?.url ||
        ""
    );

    const structuredDescHtml =
      j.description_full_html || j.descriptionFullHtml || j.description_html || j.descriptionHtml || null;

    const candidateHtml =
      (typeof structuredDescHtml === "string" && structuredDescHtml.trim())
        ? structuredDescHtml
        : html;

    const jobDescText = sanitizeToText(candidateHtml);            // <- TEXT
    console.info("[jobDesc:text]", jobDescText.slice(0, 600));

    let homepage =
      orgUrlHint ||
      (await resolveCompanyHomepage({
        html,
        companyHint: companyName,
        jobOrigin: origin,
        orgUrlHint,
      })) ||
      "";
    
    // Try Clearbit with LLM-suggested domain if available
    if (!homepage && suggestedDomain) {
      console.info("[homepage:clearbit-suggested]", "Trying Clearbit with LLM-suggested domain");
      try {
        const resp = await fetch(
          `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(suggestedDomain)}`,
          { cache: "no-store", signal: AbortSignal.timeout(5000) }
        );
        if (resp.ok) {
          const arr = (await resp.json()) as Array<{ domain?: string; name?: string }>;
          // Look for exact match with .com suffix
          const exactMatch = arr.find(c => c.domain === `${suggestedDomain}.com`);
          const match = exactMatch || arr[0];
          if (match?.domain) {
            homepage = `https://${match.domain}`;
            console.info("[homepage:clearbit-suggested-success]", { suggestedDomain, homepage });
          }
        }
      } catch (error) {
        console.warn("[homepage:clearbit-suggested-error]", error);
      }
    }
    
    // Google search fallback if Clearbit fails
    if (!homepage && companyName) {
      console.info("[homepage:google-fallback]", "Clearbit failed, trying Google search");
      try {
        const googleResult = await searchCompanyWebsite(companyName);
        if (googleResult) {
          homepage = googleResult;
          console.info("[homepage:google-success]", { companyName, homepage });
        } else {
          console.info("[homepage:google-failed]", "Google search found no results");
        }
      } catch (error) {
        console.warn("[homepage:google-error]", error);
      }
    }

    let companyAbout = "";
    if (homepage) {
      try {
        const about = await fetchCompanyAbout(homepage, { maxPages: 6, concurrency: 4 });
        console.info("[companyAbout:visited]", about.visited);
        console.info("[companyAbout:rawTextPreview]", about.text.slice(0, 600));
        companyAbout = await summarizeCompanyAbout({
          companyName,
          jobTitle,
          jobDescHtml: jobDescText,                                // pass TEXT
          aboutText: about.text,
        });
      } catch {
        companyAbout = "";
      }
    }

    const confidence: CachedPayload["confidence"] =
      companyName && homepage ? "high" : companyName || homepage ? "medium" : "low";

    // Resolve CV text if in auto mode
    let cvTextResolved = "";
    if (body.cvMode === "auto") {
      try {
        cvTextResolved = await resolveCvText();
      } catch (error: any) {
        console.error("[ingest-job] CV resolution failed:", error?.message || error);
        cvTextResolved = "";
      }
    }

    const payload: CachedPayload = {
      jobTitle,
      jobDescHtml: jobDescText,                                    // store TEXT
      companyName: companyName || "",
      companyHomepage: homepage || "",
      companyAbout,
      confidence,
      via: "hasdata",
      cached: true,
    };

    if ((payload.jobTitle || "").length > 1 && (payload.jobDescHtml || "").length > 100) {
      setCache(normalizedUrl, payload);
    }

    return NextResponse.json({ ...payload, cvTextResolved }, { headers: { "X-Cache": "MISS" } });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "ingest failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const jobUrl = new URL(req.url).searchParams.get("jobUrl");
  if (!jobUrl) return NextResponse.json({ error: "Missing jobUrl" }, { status: 400 });
  const body: Body = { mode: "url", jobUrl, cvMode: "auto" };
  return POST(new NextRequest(req.url, { method: "POST", body: JSON.stringify(body) }) as any);
}
