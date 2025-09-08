// lib/extractors/resolveCompanyHomepage.ts
import * as cheerio from "cheerio";

type Args = {
  html: string;
  companyHint?: string;   // e.g. "GE Aerospace"
  jobOrigin?: string;     // e.g. https://uk.indeed.com
  orgUrlHint?: string;    // JSON-LD hiringOrganization.sameAs/url
};

const AGGREGATOR_HOSTS = new Set([
  "indeed.com","uk.indeed.com","linkedin.com","www.linkedin.com","glassdoor.com","www.glassdoor.com",
  "google.com","jobs.google.com","boards.greenhouse.io","greenhouse.io","lever.co","workday.com",
  "myworkdayjobs.com","smartrecruiters.com","ashbyhq.com","bamboohr.com","personio.de","wellfound.com"
]);

export async function resolveCompanyHomepage(args: Args): Promise<string | null> {
  const { html, companyHint, jobOrigin, orgUrlHint } = args;
  const $ = cheerio.load(html || "");

  // helpers
  const hostOf = (u?: string) => {
    try { return new URL(String(u)).hostname.replace(/^www\./, ""); } catch { return ""; }
  };
  const originOf = (u?: string) => {
    try { const x = new URL(String(u)); return `${x.protocol}//${x.host}`; } catch { return null; }
  };
  const isAggregator = (u?: string) => {
    const h = hostOf(u);
    if (!h) return false;
    return [...AGGREGATOR_HOSTS].some(a => h === a || h.endsWith(`.${a}`));
  };

  // 1) trust JSON-LD org URL if it’s not an aggregator
  if (orgUrlHint && !isAggregator(orgUrlHint)) {
    return originOf(orgUrlHint);
  }

  // 2) canonical / og:url → only if not an aggregator
  const canon = $('link[rel="canonical"]').attr("href") || $('meta[property="og:url"]').attr("content");
  if (canon && !isAggregator(canon)) {
    return originOf(canon);
  }

  // 3) Clearbit fallback: take first suggestion
  if (companyHint) {
    try {
      const resp = await fetch(
        `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(companyHint)}`,
        { cache: "no-store" }
      );
      if (resp.ok) {
        const arr = (await resp.json()) as Array<{ domain?: string }>;
        const domain = arr?.[0]?.domain;
        if (domain) return `https://${domain}`;
      }
    } catch {
      // ignore
    }
  }

  // 4) last resort: job origin ONLY if not an aggregator
  if (jobOrigin && !isAggregator(jobOrigin)) {
    return originOf(jobOrigin);
  }

  // give up
  return null;
}
