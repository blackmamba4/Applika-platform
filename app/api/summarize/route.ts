// app/api/summarize/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { jobTitle, jobDesc, companyText } = await req.json();

  const prompt = `
Summarize the following company research in 250–400 words.
Focus ONLY on values, culture, mission, benefits, and signals relevant to this role.
Ignore navigation, disclaimers, duplicate text, and generic boilerplate.

Role:
${jobTitle}
${jobDesc}

Company Research:
${companyText}
`.trim();

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    }),
  });

  if (!r.ok) {
    const t = await r.text().catch(() => "");
    return new Response(JSON.stringify({ error: "summarize-failed", details: t }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }

  const data = await r.json();
  const summary = data?.choices?.[0]?.message?.content ?? "";
  return new Response(JSON.stringify({ summary }), {
    status: 200, headers: { "Content-Type": "application/json" },
  });
}
