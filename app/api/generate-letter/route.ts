import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import { validateRequest, schemas, createValidationErrorResponse } from "@/lib/validation";
import { withErrorHandler, RateLimiter } from "@/lib/error-handler";
import { getTemplateDefaultAccentColor } from "@/lib/color-system";

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
  tone?: string;            // "professional" | "modern" | "creative" | "direct"
};

type Meta = {
  template: "modernGradient" | "professionalAccent" | "defaultBasic";
  accent: string;
  font: "inter" | "georgia" | "serif" | "system" | "poppins" | "montserrat" | "playfair";
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
  // Parsed content components
  greeting?: string; // "Dear Red Sift Hiring Team,"
  closing?: string; // "Warm regards,"
  signatureName?: string; // "James"
  gradientColor?: string; // Custom gradient color
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

/* ---------------- content parsing ---------------- */
function parseGeneratedContent(content: string): { greeting: string; closing: string; signatureName: string } {
  // Extract greeting (Dear...)
  const greetingMatch = content.match(/Dear\s+([^,\n]+),?\s*/i);
  const greeting = greetingMatch ? greetingMatch[0].trim() : '';
  
  // Extract closing (Warm regards, Best regards, etc.) - more flexible matching
  const closingPatterns = [
    /(Warm regards),?\s*$/im,
    /(Best regards),?\s*$/im,
    /(Sincerely),?\s*$/im,
    /(Kind regards),?\s*$/im,
    /(Yours truly),?\s*$/im,
    /(Thank you),?\s*$/im,
    /(Respectfully),?\s*$/im
  ];
  
  let closing = '';
  for (const pattern of closingPatterns) {
    const match = content.match(pattern);
    if (match) {
      closing = match[1] + ',';
      break;
    }
  }
  
  // Extract signature name (last non-empty line)
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  let signatureName = '';
  
  if (lines.length > 0) {
    const lastLine = lines[lines.length - 1];
    // If last line doesn't contain common closing words, it's likely the signature
    if (!lastLine.match(/^(Warm regards|Best regards|Sincerely|Kind regards|Yours truly|Thank you|Respectfully),?\s*$/i)) {
      signatureName = lastLine;
    }
  }
  
  // Fallback: try to extract from pattern after closing
  if (!signatureName && closing) {
    const signatureMatch = content.match(new RegExp(`${closing.replace(',', '')}\\s*\\n\\s*([A-Za-z\\s]+)\\s*$`, 'im'));
    if (signatureMatch) {
      signatureName = signatureMatch[1].trim();
    }
  }
  
  return { 
    greeting: greeting || `Dear ${content.match(/Dear\s+([^,\n]+)/i)?.[1] || 'Hiring Manager'},`,
    closing: closing || 'Sincerely,',
    signatureName: signatureName || 'Your Name'
  };
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
  tone?: string;
}) {
  const toneInstructions = {
    professional: "Use formal, polished language. Start with 'I am writing to express my strong interest in...' or 'I would like to apply for...'. Be respectful and traditional.",
    modern: "Use contemporary, confident language. Start with 'I'm excited about the opportunity to...' or 'I'm thrilled to join...'. Be dynamic and forward-thinking.",
    creative: "Use innovative, passionate language. Start with 'Your innovative approach to [industry] resonates with my creative vision...' or 'I'm passionate about contributing to...'. Be expressive and visionary.",
    direct: "Use straightforward, concise language. Start with 'I want to contribute to [Company]'s success in [role]...' or 'I'm applying because...'. Be impactful and to the point."
  };

  const toneInstruction = args.tone ? toneInstructions[args.tone as keyof typeof toneInstructions] || toneInstructions.professional : toneInstructions.professional;

  const system = [
    "You are an expert cover-letter writer.",
    "Write in first person, tailored and specific.",
    `Tone: ${toneInstruction}`,
    "",
    "🚨 CRITICAL ACCURACY REQUIREMENT:",
    "- ONLY use information explicitly provided in the job description and CV",
    "- Do NOT invent, make up, or fabricate any details, experiences, skills, achievements, or facts",
    "- If specific information is missing, use general professional language instead of creating specifics",
    "- Never claim experience with technologies, companies, or projects not mentioned in the CV",
    "- Never invent specific metrics, numbers, or results not provided",
    "",
    "Output rules:",
    `- Aim for ${args.wordsMin}–${args.wordsMax} words.`,
    "- Plain text only.",
    "- Separate paragraphs with a blank line.",
    "- You may use short dash bullets ('- ') if helpful.",
    "- Professional, warm tone.",
    "- End with a concise call-to-action.",
    "",
    "CRITICAL FORMAT REQUIREMENTS:",
    "- Generate ONLY the main body content (no greeting, no closing, no signature)",
    "- Do NOT include 'Dear [Company]' or any greeting",
    "- Do NOT include 'Warm regards' or any closing",
    "- Do NOT include your name at the end",
    "- Start directly with your opening paragraph about the role",
    "- End with your call-to-action paragraph",
    "",
    "IMPORTANT: The greeting 'Dear [Company] Team,' will be added separately, so:",
    "- Do NOT start with phrases like 'I'm thrilled to apply' or 'I'm excited about'",
    "- Start with content that flows naturally AFTER the greeting",
    "- Use phrases like 'I am writing to express my interest...' or 'Your company's mission...'",
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
  tone?: string;
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
    tone: payload.tone,
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
  generatedContent?: string; // Add this parameter
}) : Promise<Meta> {
  const { supabase, userId, userEmail, userNameFromPayload, payload, generatedContent } = opts;

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
    "Your Name";

  const yourInitials = initialsFromName(yourName);
  const contactLine = composeContactLine(
    profileEmail ?? userEmail,
    payload.contactPhone,
    payload.contactCity
  );

  return {
    // tasteful defaults for the UI look & feel
    template: "defaultBasic",
    accent: getTemplateDefaultAccentColor("defaultBasic"), // Use template-specific default
    font: "inter",
    density: "normal",
    headerStyle: "centered",
    footerStyle: "none",
    showDivider: true,
    showRecipientBlock: true,
    showSignature: false,

    logoUrl: "",
    signatureUrl: "",

    // letter "chrome"
    yourName,
    yourInitials,
    contactLine,
    recipient: "Hiring Manager",
    company: collapse(payload.companyName),
    companyAddress: "",
    dateLine: new Date().toLocaleDateString(),
    date: new Date().toLocaleDateString(),

    // Parsed content components - set clean defaults since we generate only body content
    greeting: `Dear ${collapse(payload.companyName) || 'Company'} Team,`,
    closing: "Sincerely,",
    signatureName: yourName,
    gradientColor: getTemplateDefaultAccentColor("modernGradient"), // Use template-specific default

    // Header element visibility controls - will be overridden by client-side localStorage preferences
    showContactInfo: false,
    showRecipientInfo: false,
    showCompanyInfo: false,
    showDate: false,
  };
}

/* ---------------- route ---------------- */
// Rate limiter for AI generation (expensive operation)
const generationRateLimiter = new RateLimiter(5, 60000); // 5 requests per minute

async function POSTHandler(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  const user = auth.user;

  // Rate limiting check
  const userIdentifier = user.id;
  if (!generationRateLimiter.isAllowed(userIdentifier)) {
    const resetTime = generationRateLimiter.getResetTime(userIdentifier);
    return NextResponse.json(
      {
        error: "Rate limit exceeded. Please wait before generating another cover letter.",
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

  // Validate request body
  const validation = await validateRequest(req, schemas.generateLetter);
  if (!validation.isValid) {
    return NextResponse.json(
      createValidationErrorResponse(validation.errors),
      { status: 400 }
    );
  }

  const body = validation.data as Payload;

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
              tone: body.tone,
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
            generatedContent: letter, // Pass the generated content
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

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  try {
    // Use the already parsed body from validation
    const body = validation.data as Payload;

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
        tone: body.tone,
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
      generatedContent: letter, // Pass the generated content
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

export const POST = withErrorHandler(POSTHandler);
