// lib/extractors/summarizeCompanyAbout.ts
import OpenAI from "openai";

const MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

/** Logging toggle */
const DEBUG_SUM = process.env.DEBUG_SUMMARY === "1";
const logSum = (msg: string, meta: Record<string, any> = {}) => {
  if (!DEBUG_SUM) return;
  try {
    console.info(JSON.stringify({ scope: "summary", msg, ...meta }));
  } catch {
    console.info(`[summary] ${msg}`, meta);
  }
};

function collapse(s?: string) {
  return (s || "").replace(/\s+/g, " ").trim();
}

/**
 * Summarize company 'about' text in the context of the job.
 * Produces ~4 paragraphs, detailed.
 */
export async function summarizeCompanyAbout(args: {
  companyName: string;
  jobTitle: string;
  jobDescHtml?: string;   // may already be plain text
  aboutText: string;      // plain text, deduped
}): Promise<string> {
  const companyName = collapse(args.companyName);
  const jobTitle = collapse(args.jobTitle);
  const aboutText = collapse(args.aboutText);
  const jdCompact = collapse(args.jobDescHtml || "");

  logSum("input", {
    companyName,
    jobTitle,
    aboutLen: aboutText.length,
    jdLen: jdCompact.length,
    aboutPreview: aboutText.slice(0, 220),
    jdPreview: jdCompact.slice(0, 180),
  });

  if (!aboutText) return "";

  // Fallback if no OpenAI key: heuristic 4 paragraphs
  if (!process.env.OPENAI_API_KEY) {
    const lines = aboutText.split(/\n+/).map(collapse).filter(Boolean);
    const chunks: string[] = [];
    let buf: string[] = [];
    for (const l of lines) {
      buf.push(l);
      const cur = buf.join(" ");
      if (cur.length > 400) {
        chunks.push(cur);
        buf = [];
      }
      if (chunks.length >= 4) break;
    }
    if (buf.length && chunks.length < 4) chunks.push(buf.join(" "));
    const fallback = chunks.slice(0, 4).join("\n\n").slice(0, 2000);
    logSum("fallback.no_api_key", { outLen: fallback.length });
    return fallback;
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const system = [
    "You are a precise *but thorough* company profiler for recruiting.",
    "Write a **detailed, factual** summary in **four short paragraphs**.",
    "Paragraph 1: What the company does overall — category, mission, high-level value.",
    "Paragraph 2: Products/platform/technology — how it works, notable features; be concrete.",
    "Paragraph 3: Customers/markets/scale — industries, segments, regions, traction if present.",
    "Paragraph 4: Culture/values/working style — and why those matter to the role.",
    "Tie relevant aspects to the role when obvious. Do *not* invent facts.",
    "Style: Plain text. Concise but informative. Avoid marketing fluff.",
    "Target length: ~320–520 words total.",
  ].join("\n");

  const user = [
    companyName ? `Company: ${companyName}` : "",
    jobTitle ? `Role: ${jobTitle}` : "",
    jdCompact ? `Job context (compact): ${jdCompact}` : "",
    `About text (deduped, plain): ${aboutText}`,
  ]
    .filter(Boolean)
    .join("\n");

  const t0 = Date.now();
  const res = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.5,
    max_tokens: 900,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  const summary = (res.choices?.[0]?.message?.content || "").trim();
  logSum("openai.ok", { ms: Date.now() - t0, outLen: summary.length, preview: summary.slice(0, 220) });

  // Safety fallback to ensure we return something sizable
  return summary || aboutText.slice(0, 2000);
}
