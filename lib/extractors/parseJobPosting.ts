// lib/extractors/parseJobPosting.ts
import * as cheerio from "cheerio";

export type JobPosting = {
  company: string | undefined;
  title?: string;
  description?: string;         // plain text
  descriptionHtml?: string;     // original HTML if present
  hiringOrganization?: {
    name?: string;
    sameAs?: string;
    url?: string;
  };
  employmentType?: string[];
  datePosted?: string;
  validThrough?: string;
  jobLocationType?: string;
  locations?: Array<{
    addressLocality?: string;
    addressRegion?: string;
    addressCountry?: string;
    postalCode?: string;
    streetAddress?: string;
  }>;
  baseSalary?: {
    currency?: string;
    unitText?: string;          // HOUR/YEAR/etc.
    value?: number;
    minValue?: number;
    maxValue?: number;
  };
  identifier?: { name?: string; value?: string };
  extras?: Record<string, unknown>;
};

export function parseJobPosting(html: string, pageUrl?: string): JobPosting {
  const $ = cheerio.load(html || "");
  const out: JobPosting = {
    extras: {},
    company: undefined
  };

  // ---- 1) JSON-LD (preferred)
  const jsonld: any[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text();
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) jsonld.push(...parsed);
      else if (parsed?.["@graph"]) jsonld.push(...parsed["@graph"]);
      else jsonld.push(parsed);
    } catch {}
  });
  const jobNodes = jsonld.filter((n) =>
    toArray(n?.["@type"]).some((t) => String(t).toLowerCase() === "jobposting")
  );
  if (jobNodes.length) {
    const node = jobNodes.find((n) => n.title || n.description) || jobNodes[0];
    hydrateFromJsonLd(out, node);
  }

  // ---- 2) Microdata fallback
  if (!out.title || !out.descriptionHtml) {
    $('[itemscope][itemtype*="JobPosting"]').each((_, el) => {
      const scope = $(el);
      out.title = out.title || txt(scope.find('[itemprop="title"]').first().text());
      const descHtml = scope.find('[itemprop="description"]').first().html();
      if (descHtml && !out.descriptionHtml) {
        out.descriptionHtml = String(descHtml).trim();
        out.description = stripHtml(out.descriptionHtml);
      }
      if (!out.hiringOrganization?.name) {
        const orgName = scope
          .find('[itemprop="hiringOrganization"] [itemprop="name"]')
          .first()
          .text();
        if (orgName) {
          out.hiringOrganization = { ...(out.hiringOrganization || {}), name: txt(orgName) };
        }
      }
    });
  }

  // ---- 3) OG/meta + heuristics
  if (!out.title) {
    const ogt = $('meta[property="og:title"]').attr("content");
    const twt = $('meta[name="twitter:title"]').attr("content");
    const titleTag = $("title").first().text();
    out.title = cleanTitle(ogt || twt || titleTag);
  }
  if (!out.descriptionHtml && !out.description) {
    const metaDesc =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="twitter:description"]').attr("content") ||
      "";
    if (metaDesc) {
      out.description = collapse(metaDesc);
    } else {
      const body = $("main").text() || $("article").text() || $("body").text();
      out.description = collapse(body).slice(0, 4000);
    }
  }
  if (!out.hiringOrganization?.name) {
    const ogSite = $('meta[property="og:site_name"]').attr("content");
    if (ogSite) {
      out.hiringOrganization = { ...(out.hiringOrganization || {}), name: ogSite.trim() };
    } else if (pageUrl) {
      const host = new URL(pageUrl).hostname.replace(/^www\./, "");
      out.hiringOrganization = { ...(out.hiringOrganization || {}), name: host.split(".")[0] };
    }
  }
  if (!out.hiringOrganization?.url && pageUrl) {
    const { protocol, host } = new URL(pageUrl);
    out.hiringOrganization = { ...(out.hiringOrganization || {}), url: `${protocol}//${host}` };
  }

  // ---- final normalize
  if (out.descriptionHtml && !out.description) out.description = stripHtml(out.descriptionHtml);
  out.employmentType = normEmployment(out.employmentType || []);
  out.datePosted = normDate(out.datePosted);
  out.validThrough = normDate(out.validThrough);

  return out;
}

/* ---------------- helpers ---------------- */

function hydrateFromJsonLd(out: JobPosting, n: any) {
  out.title = out.title || n.title;
  if (n.description && !out.descriptionHtml) {
    out.descriptionHtml = String(n.description);
    out.description = stripHtml(out.descriptionHtml);
  }
  const org = n.hiringOrganization || n.organization;
  if (org) {
    out.hiringOrganization = {
      name: org.name || out.hiringOrganization?.name,
      sameAs: org.sameAs || out.hiringOrganization?.sameAs,
      url: org.url || out.hiringOrganization?.url,
    };
  }
  out.employmentType = normEmployment(toArray(n.employmentType));
  out.datePosted = n.datePosted || out.datePosted;
  out.validThrough = n.validThrough || out.validThrough;
  out.jobLocationType = n.jobLocationType || out.jobLocationType;

  // locations
  const locs = toArray(n.jobLocation).map((loc: any) => {
    const addr = loc?.address || {};
    return {
      addressLocality: addr.addressLocality || addr.city,
      addressRegion: addr.addressRegion || addr.region,
      addressCountry: addr.addressCountry || addr.country,
      postalCode: addr.postalCode,
      streetAddress: addr.streetAddress,
    };
    });
  if (locs.length) (out.locations ||= []).push(...locs);

  // baseSalary
  const bs = n.baseSalary;
  if (bs) {
    const value = bs.value || {};
    out.baseSalary = {
      currency: bs.currency || value.currency,
      unitText: bs.unitText || value.unitText,
      value: num(value.value),
      minValue: num(value.minValue ?? value.min),
      maxValue: num(value.maxValue ?? value.max),
    };
  }

  // identifier
  if (n.identifier) {
    out.identifier = { name: n.identifier.name, value: n.identifier.value };
  }
}

function stripHtml(html: string) {
  return collapse(
    String(html)
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  );
}
function collapse(s?: string) {
  return (s || "").replace(/\s+/g, " ").trim();
}
function txt(s: string) {
  return collapse(s);
}
function toArray(v: any) {
  return Array.isArray(v) ? v : v ? [v] : [];
}
function num(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
function normEmployment(vals: string[]) {
  const map: Record<string, string> = {
    fulltime: "FULL_TIME",
    "full-time": "FULL_TIME",
    parttime: "PART_TIME",
    "part-time": "PART_TIME",
    contract: "CONTRACT",
    temporary: "TEMPORARY",
    intern: "INTERN",
    internship: "INTERN",
    volunteer: "VOLUNTEER",
    per_diem: "PER_DIEM",
    freelance: "CONTRACT",
  };
  return vals
    .map((v) => (v || "").toString().trim())
    .filter(Boolean)
    .map((v) => map[v.toLowerCase()] || v.toUpperCase());
}
function normDate(d?: string) {
  if (!d) return undefined;
  const dt = new Date(d);
  return isNaN(+dt) ? undefined : dt.toISOString();
}
function cleanTitle(t?: string) {
  if (!t) return undefined;
  return t.replace(/\s*[-–|]\s*[^-–|]+$/, "").trim();
}
