"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Sparkles, PencilLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ToastGlobal";
import TemplateSelector from "./TemplateSelector";
import { CoverLetterTemplate, TemplateData } from "@/lib/templates/coverLetterTemplates";

// Inline skeleton components to avoid import issues
function WizardStepSkeleton() {
  return (
    <div className="mt-6 space-y-4">
      {/* Job Section */}
      <div>
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="flex gap-6 mb-2">
          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-10 w-full bg-gray-200 rounded-2xl animate-pulse" />
        <div className="mt-2 flex justify-end">
          <div className="h-10 w-32 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>

      {/* CV Section */}
      <div>
        <div className="h-4 w-12 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="flex gap-6 mb-2">
          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-20 w-full bg-gray-200 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

function ButtonSkeleton() {
  return (
    <div className="h-10 w-32 bg-gray-200 rounded-full animate-pulse" />
  );
}

type Mode = "auto" | "manual";
type ProfileRow = { 
  first_name: string | null; 
  last_name: string | null; 
  full_name: string | null; 
  desired_role: string | null 
};

const FALLBACK_NAME = "Friend";
const FALLBACK_ROLE = "this role";
const SAVE_ROLE_ON_EDIT = true;

export default function CoverLetterWizard() {
  const router = useRouter();
  const supabase = createClient();
  const toast = useToast();

  // Profile
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [userName, setUserName] = useState(FALLBACK_NAME);
  const [defaultRole, setDefaultRole] = useState(FALLBACK_ROLE);
  const [letterLength, setLetterLength] = useState<"short" | "medium" | "long">("medium");
  
  // Progressive loading states
  const [wizardLoading, setWizardLoading] = useState(true);

  // Editable role
  const [role, setRole] = useState(FALLBACK_ROLE);
  const [roleEdited, setRoleEdited] = useState(false);

  // UI / steps
  const [glow, setGlow] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fetching, setFetching] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  // Template system
  const [selectedTemplate, setSelectedTemplate] = useState<CoverLetterTemplate | undefined>();
  const [selectedTone, setSelectedTone] = useState<string>("professional");

  // Inputs
  const [jobMode, setJobMode] = useState<Mode>("auto");
  const [jobUrl, setJobUrl] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescHtml, setJobDescHtml] = useState<string>("");
  const [cvMode, setCvMode] = useState<Mode>("auto");
  const [cvText, setCvText] = useState("");

  // Step 2 fields
  const [companyName, setCompanyName] = useState("");
  const [companyHomepage, setCompanyHomepage] = useState("");
  const [jobSummary, setJobSummary] = useState("");
  const [companyAbout, setCompanyAbout] = useState("");

  // Step 2 fetch states
  const [resolvingHomepage, setResolvingHomepage] = useState(false);
  const [resolveErr, setResolveErr] = useState<string | null>(null);

  // Errors
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateStage, setGenerateStage] = useState<string | null>(null);
  const [tokenInfo, setTokenInfo] = useState<{ planRemaining: number | null; topupRemaining: number | null } | null>(null);

  // Dirty tracking for step 1
  const getStep1State = () => ({ jobMode, jobUrl, jobTitle, jobDescHtml, cvMode, cvText });
  const [step1Baseline, setStep1Baseline] = useState(getStep1State());
  const [cameFromStep2, setCameFromStep2] = useState(false);

  const isStep1Dirty = useMemo(() => {
    const a = step1Baseline;
    const b = getStep1State();
    return (
      a.jobMode !== b.jobMode ||
      a.jobUrl !== b.jobUrl ||
      a.jobTitle !== b.jobTitle ||
      a.jobDescHtml !== b.jobDescHtml ||
      a.cvMode !== b.cvMode ||
      a.cvText !== b.cvText
    );
  }, [jobMode, jobUrl, jobTitle, jobDescHtml, cvMode, cvText, step1Baseline]);

  // intro glow
  useEffect(() => {
    const t = setTimeout(() => setGlow(false), 800);
    return () => clearTimeout(t);
  }, []);

  // load profile
  useEffect(() => {
    (async () => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth?.user;
        if (!user) {
          router.push("/login");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("first_name, last_name, full_name, desired_role")
          .eq("id", user.id)
          .single<ProfileRow>();

        if (error) setProfileError(error.message);

        const name = data?.full_name?.trim() || 
                     [data?.first_name?.trim(), data?.last_name?.trim()].filter(Boolean).join(' ') || 
                     FALLBACK_NAME;
        const roleVal = data?.desired_role?.trim() || FALLBACK_ROLE;

        setUserName(name);
        setDefaultRole(roleVal);
        if (!roleEdited) setRole(roleVal);
      } catch (e: any) {
        setProfileError(e?.message || "Could not load profile");
      } finally {
        setProfileLoading(false);
        // Delay wizard loading to show progressive loading
        setTimeout(() => setWizardLoading(false), 300);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // optional: persist role edits
  async function persistRoleEdit(nextRole: string) {
    if (!SAVE_ROLE_ON_EDIT) return;
    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({ desired_role: nextRole || null })
        .eq("id", user.id);
      if (error) throw error;
    } catch {
      // ignore
    }
  }

  async function handleFetch() {
    if (cameFromStep2 && !isStep1Dirty) {
      setStep(2);
      return;
    }
    if (jobMode === "auto" && !jobUrl.trim()) {
      setFetchError("Please paste a job URL (or switch to Manual).");
      return;
    }
    if (jobMode === "manual" && (!jobTitle.trim() || !jobDescHtml.trim())) {
      setFetchError("Please enter a job title and description (HTML/text) for Manual mode.");
      return;
    }

    setFetchError(null);
    setFetching(true);

    const payload =
      jobMode === "auto"
        ? ({ mode: "url", jobUrl, cvMode, cvText } as const)
        : ({ mode: "manual", jobTitle, jobDescHtml, jobDesc: jobDescHtml, cvMode, cvText } as const);

    try {
      const res = await fetch("/api/ingest-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null as any);
      if (!res.ok) throw new Error(data?.error || `Failed with status ${res.status}`);

      setJobTitle(data?.jobTitle || "");
      setCompanyName(data?.companyName || "");
      setCompanyHomepage(data?.companyHomepage || "");
      setCompanyAbout(data?.companyAbout || "");

      const fullHtml = data?.jobDescHtml || "";
      setJobDescHtml(fullHtml);
      setJobSummary(fullHtml);

      if (data?.cvTextResolved && cvMode === "auto") setCvText(data.cvTextResolved);

      setStep1Baseline(getStep1State());
      setStep(2);
    } catch (e: any) {
      setFetchError(e?.message || "Something went wrong");
    } finally {
      setFetching(false);
    }
  }

  async function handleFetchCompanyAbout() {
    setResolveErr(null);
    const homepage = companyHomepage.trim();
    if (!homepage) {
      setResolveErr("Please enter the company homepage URL first.");
      return;
    }
    setResolvingHomepage(true);
    try {
      const res = await fetch("/api/fetch-company-about", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homepageUrl: homepage, companyName, jobTitle, jobDescHtml }),
      });
      const data = await res.json().catch(() => null as any);
      if (!res.ok) throw new Error(data?.error || `Failed with status ${res.status}`);
      if (data?.companyAbout) setCompanyAbout(data.companyAbout);
      if (data?.companyHomepage) setCompanyHomepage(data.companyHomepage);
    } catch (e: any) {
      setResolveErr(e?.message || "Could not fetch company about");
    } finally {
      setResolvingHomepage(false);
    }
  }

  const missingRequired = !jobTitle.trim() || !jobDescHtml.trim() || !companyAbout.trim();

  // Prepare template data
  const templateData: TemplateData = {
    userName,
    userRole: role,
    companyName: companyName || "the company",
    jobTitle: jobTitle || "this position",
    jobDescription: jobDescHtml,
    companyAbout: companyAbout || "innovation and excellence",
    letterLength
  };

  // Generate cover letter directly
  async function handleGenerate() {
    if (generating) return;
    
    setGenerating(true);
    setGenerateError(null);
    setGenerateStage("Generating cover letter...");

    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        throw new Error("Not authenticated");
      }

      const payload = {
        jobTitle: jobTitle.trim(),
        companyName: companyName.trim(),
        companyHomepage: companyHomepage.trim() || undefined,
        companyAbout: companyAbout.trim(),
        jobDescHtml: jobDescHtml.trim(),
        cvText: cvText.trim() || undefined,
        userName: userName,
        length: letterLength,
        tone: selectedTone
      };

      const res = await fetch("/api/generate-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Failed with status ${res.status}`);

      toast.show({
        message: "Cover letter generated successfully!",
        confetti: true
      });

      // Navigate to the editor
      router.push(`/Dashboard/Coverletters/${data.id}`);
      
    } catch (error: any) {
      console.error("Generation error:", error);
      setGenerateError(error?.message || "Failed to generate cover letter");
    } finally {
      setGenerating(false);
      setGenerateStage(null);
    }
  }

  // Template generation handler
  async function handleTemplateGenerate(template: CoverLetterTemplate, data: TemplateData) {
    if (generating) return;
    
    setGenerating(true);
    setGenerateError(null);
    setGenerateStage("Generating cover letter...");

    try {
      const generatedLetter = template.generate(data);
      
      // Create meta data for the letter
      const meta = {
        template: template.id,
        templateName: template.name,
        templateCategory: template.category,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        letterLength: data.letterLength,
        generatedAt: new Date().toISOString()
      };

      // Save to database
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        throw new Error("Not authenticated");
      }

      const title = `${data.companyName} — ${data.jobTitle}`;
      
      const { data: insertData, error } = await supabase
        .from("cover_letters")
        .insert({
          user_id: auth.user.id,
          title,
          company: data.companyName,
          content: generatedLetter,
          meta
        })
        .select("id")
        .single();

      if (error) throw error;

      toast.show({
        message: "Cover letter generated successfully!",
        confetti: true
      });

      // Navigate to the editor
      router.push(`/Dashboard/Coverletters/${insertData.id}`);
      
    } catch (error: any) {
      console.error("Template generation error:", error);
      setGenerateError(error?.message || "Failed to generate cover letter");
    } finally {
      setGenerating(false);
      setGenerateStage(null);
    }
  }

  if (wizardLoading) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="h-8 w-48 bg-foreground/10 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-foreground/10 rounded animate-pulse" />
          </div>
        </div>
        <WizardStepSkeleton />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm hover-lift">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            {profileLoading ? "Loading…" : <>Hi, {userName} 👋</>}
          </h2>
          {profileError && <div className="mt-1 text-xs text-red-600">{profileError}</div>}

          {step === 1 ? (
            <div className="mt-1 text-2xl md:text-3xl font-semibold leading-snug">
              Ready to apply for{" "}
              <span
                className={`inline-flex items-center gap-1 px-1 rounded ${glow ? "animate-pulse bg-emerald-50" : ""}`}
                contentEditable
                suppressContentEditableWarning
                onBlur={async (e) => {
                  const val = (e.currentTarget.innerText || "").trim() || FALLBACK_ROLE;
                  setRole(val);
                  setRoleEdited(true);
                  await persistRoleEdit(val);
                }}
              >
                {role}
                <PencilLine className="h-4 w-4 opacity-50" />
              </span>
              ?
            </div>
          ) : (
            <div className="mt-1 text-2xl md:text-3xl font-semibold leading-snug">
              Review details for <span className="px-1">{jobTitle || role}</span>
              {companyName && (<> at <span className="px-1">{companyName}</span></>)}
            </div>
          )}
        </div>

        {/* Step indicator */}
        <div className="text-right pt-1">
          <span className="rounded-full border px-3 py-1 text-xs font-medium">Step {step} of 3</span>
          <div className="mt-2 h-1 w-28 bg-gray-100 rounded-full">
            <div className="h-1 bg-emerald-500 rounded-full" style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }} />
          </div>
          <div className="mt-1 text-[11px] text-gray-500">
            {step === 1 ? "Next: Review" : step === 2 ? "Next: Tone" : "Ready to Generate"}
          </div>
        </div>
      </div>

      {/* Step content */}
      {step === 1 ? (
        <div className="mt-6 space-y-4">
          {/* JOB */}
          <div>
            <label className="block text-sm font-medium mb-2">Job</label>
            <div className="flex items-center gap-6 text-sm mb-2">
              <button type="button" onClick={() => setJobMode("auto")} className={`pb-1 transition ${jobMode === "auto" ? "text-foreground font-semibold border-b-2 border-emerald-500" : "text-foreground/60 hover:text-foreground"}`}>Auto</button>
              <button type="button" onClick={() => setJobMode("manual")} className={`pb-1 transition ${jobMode === "manual" ? "text-foreground font-semibold border-b-2 border-emerald-500" : "text-foreground/60 hover:text-foreground"}`}>Manual</button>
            </div>
            {jobMode === "auto" ? (
              <input placeholder="https://" value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} className="w-full rounded-2xl border px-4 py-3 text-sm shadow-sm" />
            ) : (
              <div className="space-y-2">
                <input placeholder="Job title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm shadow-sm" />
                <textarea rows={6} placeholder="Paste job description (HTML or plain text)" value={jobDescHtml} onChange={(e) => setJobDescHtml(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm shadow-sm" />
              </div>
            )}
            {fetchError && <div className="mt-1 text-xs text-red-600">{fetchError}</div>}
            <div className="mt-2 flex justify-end">
              {fetching ? (
                <ButtonSkeleton />
              ) : (
                <button onClick={handleFetch} disabled={fetching} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:shadow-lg hover:shadow-indigo-500/25 hover:border-indigo-500/50 transition-all duration-200 disabled:opacity-50">
                  <Sparkles className="h-4 w-4" />
                  Fetch details
                </button>
              )}
            </div>
          </div>

          {/* CV */}
          <div>
            <label className="block text-sm font-medium mb-2">CV</label>
            <div className="flex items-center gap-6 text-sm mb-2">
              <button type="button" onClick={() => setCvMode("auto")} className={`pb-1 transition ${cvMode === "auto" ? "text-foreground font-semibold border-b-2 border-emerald-500" : "text-foreground/60 hover:text-foreground"}`}>Auto</button>
              <button type="button" onClick={() => setCvMode("manual")} className={`pb-1 transition ${cvMode === "manual" ? "text-foreground font-semibold border-b-2 border-emerald-500" : "text-foreground/60 hover:text-foreground"}`}>Manual</button>
            </div>
            {cvMode === "auto" ? (
              <div className="rounded-xl border px-3 py-2 text-sm bg-gray-50 text-gray-600">
                Using your uploaded CV from profile
              </div>
            ) : (
              <textarea rows={4} placeholder="Paste your CV content here..." value={cvText} onChange={(e) => setCvText(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm shadow-sm" />
            )}
          </div>
        </div>
      ) : step === 2 ? (
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Job Title</label>
            <input className="w-full rounded-xl border px-3 py-2 text-sm shadow-sm" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Company Name</label>
            <input className="w-full rounded-xl border px-3 py-2 text-sm shadow-sm" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Job Summary</label>
            <textarea rows={3} value={jobSummary} onChange={(e) => { const v = e.target.value; setJobSummary(v); setJobDescHtml(v); }} className="w-full rounded-xl border px-3 py-2 text-sm shadow-sm" placeholder="Short summary or full HTML — we'll use whatever is here." />
          </div>
          <div>
            <label className="text-sm font-medium">Company Homepage</label>
            <div className="flex gap-2">
              <input value={companyHomepage} onChange={(e) => setCompanyHomepage(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm shadow-sm" placeholder="https://company.com" />
              <button type="button" onClick={handleFetchCompanyAbout} disabled={resolvingHomepage} className="shrink-0 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium hover:shadow disabled:opacity-50" title="Fetch About from homepage">
                {resolvingHomepage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Fetch
              </button>
            </div>
            {resolveErr && <div className="mt-1 text-xs text-red-600">{resolveErr}</div>}
          </div>
          <div>
            <label className="text-sm font-medium">Company About</label>
            <textarea rows={3} value={companyAbout} onChange={(e) => setCompanyAbout(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm shadow-sm" placeholder="About the company (mission, products, scale)…" />
          </div>

          {/* Letter length */}
          <div>
            <label className="text-sm font-medium">Cover Letter Length</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {[
                { key: "short", label: "Short", hint: "≈120–180 words" },
                { key: "medium", label: "Medium", hint: "≈180–280 words" },
                { key: "long", label: "Long (A4)", hint: "≈450–600 words" },
              ].map((opt) => (
                <button key={opt.key} type="button" onClick={() => setLetterLength(opt.key as "short" | "medium" | "long")} className={`rounded-full border px-3 py-1.5 text-sm transition ${letterLength === opt.key ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "text-foreground/70 hover:text-foreground"}`} title={opt.hint}>
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-foreground/60">
              {letterLength === "short" && "Crisp & direct (≈120–180 words)."}
              {letterLength === "medium" && "Balanced detail (≈200–480 words)."}
              {letterLength === "long" && "Full A4-style page (≈650–800 words)."}
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button onClick={() => { setStep(1); setCameFromStep2(true); }} className="px-4 py-2 rounded-full border text-sm bg-white hover:shadow">Back</button>
            <div className="flex items-center gap-3">
              {generateError && (
                <div className="text-xs text-red-600">
                  {generateError} {generateError.toLowerCase().includes("credit") && (<a className="underline" href="/pricing">Buy more</a>)}
                </div>
              )}
              <button onClick={() => setStep(3)} disabled={missingRequired} className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white shadow hover:scale-[1.02] transition disabled:opacity-50 ${missingRequired ? "bg-gray-400" : "bg-gradient-to-r from-emerald-500 to-violet-500"}`} title={missingRequired ? "Fill Job Title, Job Description (HTML), and Company About first" : "Next: Choose Tone"}>
                <Sparkles className="h-4 w-4" />
                Next: Choose Tone
              </button>
            </div>
          </div>
        </div>
      ) : step === 3 ? (
        <div className="mt-6">
          <div className="mb-6">
            <button onClick={() => setStep(2)} className="px-4 py-2 rounded-full border text-sm bg-white hover:shadow">
              Back
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Choose Your Tone & Style</h3>
              <p className="text-sm text-gray-600 mb-6">Select the tone that best matches your personality and the company culture.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: "professional",
                  name: "Professional",
                  description: "Formal, polished, and traditional",
                  icon: "👔",
                  example: "I am writing to express my strong interest in the position..."
                },
                {
                  id: "modern",
                  name: "Modern",
                  description: "Contemporary, confident, and dynamic",
                  icon: "🚀",
                  example: "I'm excited about the opportunity to join your team..."
                },
                {
                  id: "creative",
                  name: "Creative",
                  description: "Innovative, passionate, and expressive",
                  icon: "🎨",
                  example: "Your innovative approach to [industry] resonates with my creative vision..."
                },
                {
                  id: "direct",
                  name: "Direct",
                  description: "Straightforward, concise, and impactful",
                  icon: "⚡",
                  example: "I want to contribute to [Company]'s success in [role]..."
                }
              ].map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => setSelectedTone(tone.id)}
                  className={`p-4 rounded-xl border text-left transition-all hover:shadow-md ${
                    selectedTone === tone.id
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{tone.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{tone.name}</div>
                      <div className="text-sm text-gray-600 mb-2">{tone.description}</div>
                      <div className="text-xs text-gray-500 italic">"{tone.example}"</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button onClick={() => setStep(2)} className="px-4 py-2 rounded-full border text-sm bg-white hover:shadow">
                Back
              </button>
              <div className="flex items-center gap-3">
                {generateError && (
                  <div className="text-xs text-red-600">
                    {generateError} {generateError.toLowerCase().includes("credit") && (<a className="underline" href="/pricing">Buy more</a>)}
                  </div>
                )}
                <button onClick={handleGenerate} disabled={generating} className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white shadow hover:scale-[1.02] transition disabled:opacity-50 bg-gradient-to-r from-emerald-500 to-violet-500`}>
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {generating ? "Generating..." : "Generate Cover Letter"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
