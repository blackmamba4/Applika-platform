import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LengthChoice = "short" | "medium" | "long";

type Payload = {
  jobTitle: string;
  companyName: string;
  companyHomepage?: string;
  companyAbout?: string;
  jobDescHtml?: string;      // plain text OK
  cvText?: string;


  // optional user-facing defaults
  userName?: string;         // prefer this name for headers/signature
  contactPhone?: string;     // for contactLine
  contactCity?: string;      // for contactLine

  length?: LengthChoice;     // "short" | "medium" | "long"
};

type Meta = {
  template: "letterhead" | "sidebar" | "minimalPro" | "creative";
  accent: string;
  font: "inter" | "georgia" | "serif" | "system";
  density: "compact" | "normal" | "roomy";
  headerStyle: "nameBlock" | "centered" | "compact";
  footerStyle: "none" | "page" | "initials";
  showDivider: boolean;
  showRecipientBlock: boolean;
  showSignature: boolean;
  logoUrl?: string;
  signatureUrl?: string;
  yourName: string;
  yourInitials: string;
  contactLine: string;
  recipient: string;
  company: string;
  companyAddress: string;
  dateLine: string;
};

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const IS_DEV = process.env.NODE_ENV !== "production";

/* ---------------- length presets ---------------- */
const LENGTH_PRESETS: Record<
  LengthChoice,
  { wordsMin: number; wordsMax: number; maxTokens: number }
> = {
  short:  { wordsMin: 120, wordsMax: 180, maxTokens: 450 },
  medium: { wordsMin: 200, wordsMax: 480, maxTokens: 800 },
  long:   { wordsMin: 650, wordsMax: 800, maxTokens: 1200 },
};

/* ---------------- token helpers ---------------- */
async function spendOneMixed(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("spend_token_mixed", {
    p_user_id: userId,
    p_amount: 1,
    p_reason: "generate",
    p_meta: {},
  });
  if (error) throw new Error(error.message);
  return (data as any) ?? { ok: false };
}
async function creditTopupOne(userId: string, reason = "refund:generate_failed") {
  const supabase = await createClient();
  const { error } = await supabase.rpc("credit_topup_tokens", {
    p_user_id: userId,
    p_amount: 1,
    p_reason: reason,
    p_meta: {},
  });
  if (error) throw new Error(error.message);
}

/* ---------------- text utils ---------------- */
const collapse = (s?: string) => (s || "").replace(/\s+/g, " ").trim();
function htmlToCompactText(html?: string) {
  if (!html) return "";
  let t = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  t = t.replace(/<li[^>]*>\s*/gi, " - ").replace(/<\/li>/gi, " ");
  t = t.replace(/<\/?(p|div|section|article|ul|ol|br|h[1-6]|tr|td|th)[^>]*>/gi, " ");
  t = t.replace(/<[^>]+>/g, " ");
  t = t.replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;|&mdash;|&ndash;/gi, " ");
  return t.replace(/\s+/g, " ").trim();
}
function normalizeLetter(s?: string) {
  if (!s) return "";
  let t = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  t = t.replace(/^\s+|\s+$/g, "");
  t = t.replace(/\n{3,}/g, "\n\n");
  return t;
}

/* ---------------- LLM prompt ---------------- */
function buildMessages(args: {
  userName: string;
  jobTitle: string;
  companyName: string;
  companyHomepage?: string;
  companyAbout?: string;
  jobDescCompact?: string;
  cvText?: string;
  wordsMin: number;
  wordsMax: number;
}) {
  const system = [
    "You are an expert cover-letter writer.",
    "Write in first person, tailored and specific.",
    "Output rules:",
    `- Aim for ${args.wordsMin}–${args.wordsMax} words.`,
    "- Plain text only.",
    "- Separate paragraphs with a blank line.",
    "- You may use short dash bullets ('- ') if helpful.",
    "- Tie claims to the job description and CV; do not fabricate.",
    "- Professional, warm tone.",
    "- End with a concise call-to-action.",
  ].join("\n");

  const user = [
    `Candidate: ${args.userName}`,
    `Company: ${args.companyName}`,
    `Role: ${args.jobTitle}`,
    args.companyHomepage ? `Company site: ${args.companyHomepage}` : "",
    args.companyAbout ? `About the company: ${args.companyAbout}` : "",
    args.jobDescCompact ? `Job description (compressed): ${args.jobDescCompact}` : "",
    args.cvText ? `Relevant experience (from CV): ${args.cvText}` : "",
    "",
    "Produce the letter now following the format rules.",
  ].filter(Boolean).join("\n");

  return [
    { role: "system" as const, content: system },
    { role: "user" as const, content: user },
  ];
}

async function generateLetterLLM(payload: {
  userName: string;
  jobTitle: string;
  companyName: string;
  companyHomepage?: string;
  companyAbout?: string;
  jobDescHtml?: string;
  cvText?: string;
  length: LengthChoice;
}) {
  const hasKey = Boolean(process.env.OPENAI_API_KEY);
  const jobDescCompact = htmlToCompactText(payload.jobDescHtml);
  const { wordsMin, wordsMax, maxTokens } = LENGTH_PRESETS[payload.length];

  if (!hasKey) {
    const base = [
      `Dear ${payload.companyName} Hiring Team,`,
      ``,
      `I'm excited to apply for the ${payload.jobTitle} role. ${jobDescCompact ? "I was drawn to the role’s focus on " + jobDescCompact.slice(0, 120) + "…" : ""}`,
      `- Example bullet one`,
      `- Example bullet two`,
      ``,
      `Best regards,`,
      payload.userName,
    ].join("\n");
    return base;
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const messages = buildMessages({
    userName: payload.userName,
    jobTitle: payload.jobTitle,
    companyName: payload.companyName,
    companyHomepage: payload.companyHomepage,
    companyAbout: payload.companyAbout,
    jobDescCompact,
    cvText: payload.cvText,
    wordsMin,
    wordsMax,
  });

  const res = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.55,
    max_tokens: maxTokens,
    messages,
  });

  return res.choices?.[0]?.message?.content?.trim() || "";
}

/* ---------------- meta defaults ---------------- */

function initialsFromName(name?: string) {
  if (!name) return "YN";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "YN";
}
function composeContactLine(email?: string | null, phone?: string, city?: string) {
  return [email || "", phone || "", city || ""].filter(Boolean).join(" · ");
}

async function buildDefaultMeta(opts: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  userEmail?: string | null;
  userNameFromPayload?: string;
  payload: Payload;
}) : Promise<Meta> {
  const { supabase, userId, userEmail, userNameFromPayload, payload } = opts;

  // Try to enrich from profiles (email/full_name if you store them there)
  let profileEmail: string | null | undefined = undefined;
  let profileFullName: string | null | undefined = undefined;

  const { data: prof } = await supabase
    .from("profiles")
    .select("email, full_name, first_name, last_name")
    .eq("id", userId)
    .maybeSingle();

  if (prof) {
    profileEmail = (prof as any)?.email ?? null;
    profileFullName =
      (prof as any)?.full_name ||
      [ (prof as any)?.first_name, (prof as any)?.last_name ]
        .filter(Boolean)
        .join(" ")
        .trim();
  }

  const yourName =
    collapse(userNameFromPayload) ||
    collapse(profileFullName || "") ||
    (userEmail ? userEmail.split("@")[0] : "") ||
    "Your Name";

  const yourInitials = initialsFromName(yourName);
  const contactLine = composeContactLine(
    profileEmail ?? userEmail,
    payload.contactPhone,
    payload.contactCity
  );

  return {
    // tasteful defaults for the UI look & feel
    template: "letterhead",
    accent: "#10B981",
    font: "inter",
    density: "normal",
    headerStyle: "nameBlock",
    footerStyle: "page",
    showDivider: true,
    showRecipientBlock: true,
    showSignature: false,

    logoUrl: "",
    signatureUrl: "",

    // letter “chrome”
    yourName,
    yourInitials,
    contactLine,
    recipient: "Hiring Manager",
    company: collapse(payload.companyName),
    companyAddress: "",
    dateLine: new Date().toLocaleDateString(),
  };
}

/* ---------------- route ---------------- */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  const user = auth.user;

  // Optional streaming (SSE) to provide progress updates
  const url = new URL(req.url);
  const wantsStream =
    url.searchParams.get("stream") === "1" ||
    (req.headers.get("accept") || "").includes("text/event-stream");
  if (wantsStream) {
    const encoder = new TextEncoder();
    const ev = (name: string, data: any) => encoder.encode(`event: ${name}\n` + `data: ${JSON.stringify(data)}\n\n`);

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (name: string, data: any) => controller.enqueue(ev(name, data));
        try {
          send("start", { ok: true });
          const body = (await req.json()) as Payload;

          const jobTitle = collapse(body?.jobTitle);
          const companyName = collapse(body?.companyName);
          const jobDescHtml = body?.jobDescHtml || "";
          const length: LengthChoice = (body?.length as LengthChoice) || "medium";
          if (!jobTitle || !companyName || !jobDescHtml.trim()) {
            send("error", { error: "Missing jobTitle/companyName/jobDescHtml" });
            controller.close();
            return;
          }

          // spend token
          try {
            const spend = await spendOneMixed(user.id);
            if (!spend?.ok) {
              send("error", { error: "NO_TOKENS", message: "No remaining allowance or top-ups." });
              controller.close();
              return;
            }
            send("tokens", {
              usedFrom: (spend as any)?.used_from ?? null,
              planRemaining: (spend as any)?.plan_remaining ?? null,
              topupRemaining: (spend as any)?.topup_remaining ?? null,
            });
          } catch (e: any) {
            send("error", { error: e?.message || "token_spend_failed" });
            controller.close();
            return;
          }

          const userName = collapse(body?.userName) || collapse((user.user_metadata as any)?.full_name) || undefined;
          send("stage", { message: "generating" });
          let letter = "";
          try {
            const letterRaw = await generateLetterLLM({
              userName: userName || "Applicant",
              jobTitle,
              companyName,
              companyHomepage: body.companyHomepage,
              companyAbout: body.companyAbout,
              jobDescHtml,
              cvText: body.cvText,
              length,
            });
            letter = normalizeLetter(letterRaw) || "(No content)";
          } catch (e: any) {
            try { await creditTopupOne(user.id, "refund:llm_error"); } catch {}
            send("error", { error: e?.message || "llm_error" });
            controller.close();
            return;
          }

          send("stage", { message: "saving" });
          const meta: Meta = await buildDefaultMeta({
            supabase,
            userId: user.id,
            userEmail: user.email,
            userNameFromPayload: body.userName,
            payload: body,
          });

          const title = `${companyName} — ${jobTitle}`;
          const insertRow = {
            user_id: user.id,
            title,
            company: companyName,
            content: letter,
            meta,
          };

          const { data, error } = await supabase
            .from("cover_letters")
            .insert(insertRow)
            .select("id")
            .single();

          if (error) {
            try { await creditTopupOne(user.id, "refund:db_error"); } catch {}
            send("error", { error: error.message || "DB insert failed" });
            controller.close();
            return;
          }

          send("done", { id: data.id, title, letter, meta });
          controller.close();
        } catch (e: any) {
          // generic failure
          controller.enqueue(ev("error", { error: e?.message || "generate failed" }));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  try {
    const body = (await req.json()) as Payload;

    const jobTitle = collapse(body?.jobTitle);
    const companyName = collapse(body?.companyName);
    const jobDescHtml = body?.jobDescHtml || ""; // plain text ok
    const length: LengthChoice = (body?.length as LengthChoice) || "medium";

    if (!jobTitle || !companyName || !jobDescHtml.trim()) {
      return NextResponse.json({ error: "Missing jobTitle/companyName/jobDescHtml" }, { status: 400 });
    }

    // Spend 1 token
    const spend = await spendOneMixed(user.id);
    if (!spend?.ok) {
      return NextResponse.json(
        { error: "No remaining monthly allowance or top-up balance.", code: "NO_TOKENS" },
        { status: 402 }
      );
    }

    // Prefer payload.userName as the signature name if provided
    const userName =
      collapse(body?.userName) ||
      collapse((user.user_metadata as any)?.full_name) ||
      undefined;

    // Generate the letter
    let letter = "";
    try {
      const letterRaw = await generateLetterLLM({
        userName: userName || "Applicant",
        jobTitle,
        companyName,
        companyHomepage: body.companyHomepage,
        companyAbout: body.companyAbout,
        jobDescHtml,
        cvText: body.cvText,
        length,
      });
      letter = normalizeLetter(letterRaw) || "(No content)";
    } catch (llmErr) {
      try { await creditTopupOne(user.id, "refund:llm_error"); } catch {}
      throw llmErr;
    }

    // Build meta defaults NOW (persist so it syncs across devices)
    const meta: Meta = await buildDefaultMeta({
      supabase,
      userId: user.id,
      userEmail: user.email,
      userNameFromPayload: body.userName,
      payload: body,
    });

    // Title used in dashboard/editor
    const title = `${companyName} — ${jobTitle}`;

    // Insert the letter row with meta + cv_file_path
    const insertRow = {
      user_id: user.id,
      title,
      company: companyName,
      content: letter,                 // plain text (editor will render as paragraphs)
      meta,                            
    };

    const { data, error } = await supabase
      .from("cover_letters")
      .insert(insertRow)
      .select("id")
      .single();

    if (error) {
      try { await creditTopupOne(user.id, "refund:db_error"); } catch {}
      return NextResponse.json({ error: error.message || "DB insert failed" }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      title,
      letter,
      meta,
      token: {
        usedFrom: (spend as any)?.used_from ?? null,
        planRemaining: (spend as any)?.plan_remaining ?? null,
        topupRemaining: (spend as any)?.topup_remaining ?? null,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: IS_DEV ? e?.message || "generate failed" : "generate failed" },
      { status: 500 }
    );
  }
}
