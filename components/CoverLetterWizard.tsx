"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Sparkles, PencilLine, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ToastGlobal";
import TemplateSelector from "./TemplateSelector";
import { CoverLetterTemplate, TemplateData } from "@/lib/templates/coverLetterTemplates";
import { trackCoverLetterEvent, trackUserJourney } from "@/components/GoogleAnalytics";

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
type ProfileData = {
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  desiredRole: string | null;
  toneDefault: string | null;
};

const FALLBACK_NAME = "Friend";
const FALLBACK_ROLE = "this role";
const SAVE_ROLE_ON_EDIT = true;

export default function CoverLetterWizard({ profile }: { profile: ProfileData }) {
  const router = useRouter();
  const supabase = createClient();
  const toast = useToast();

  // Profile - initialize from props immediately
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [userName, setUserName] = useState(() => {
    const firstName = profile?.firstName?.trim();
    return firstName || FALLBACK_NAME;
  });
  const [defaultRole, setDefaultRole] = useState(() => {
    return profile?.desiredRole?.trim() || FALLBACK_ROLE;
  });
  const [letterLength, setLetterLength] = useState<"short" | "medium" | "long">("medium");
  
  // No more wizard loading - instant initialization
  const [wizardLoading, setWizardLoading] = useState(false);

  // Editable role
  const [role, setRole] = useState(() => {
    return profile?.desiredRole?.trim() || FALLBACK_ROLE;
  });
  const [roleEdited, setRoleEdited] = useState(false);

  // UI / steps
  const [glow, setGlow] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [indeedInstructionsOpen, setIndeedInstructionsOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  // Template system
  const [selectedTemplate, setSelectedTemplate] = useState<CoverLetterTemplate | undefined>();
  const [selectedTone, setSelectedTone] = useState<string>(() => {
    const profileTone = profile?.toneDefault?.trim()?.toLowerCase();
    return profileTone || "professional";
  });

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

  // CV detection and upload
  const [hasUploadedCv, setHasUploadedCv] = useState<boolean | null>(null);
  const [cvUploading, setCvUploading] = useState(false);

  // Check if user has uploaded CV
  useEffect(() => {
    async function checkCvStatus() {
      try {
        const res = await fetch("/api/cv/resolve");
        setHasUploadedCv(res.ok);
      } catch {
        setHasUploadedCv(false);
      }
    }
    checkCvStatus();
  }, []);

  // CV upload function
  async function uploadCv(file: File) {
    setCvUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/cv/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const msg = await res.text();
        toast.show({ message: `Upload failed: ${msg}` });
        return;
      }
      setHasUploadedCv(true);
      toast.show({ message: "CV uploaded successfully!" });
    } catch (e: any) {
      toast.show({ message: e?.message || "Upload failed" });
    } finally {
      setCvUploading(false);
    }
  }

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
    
    // Validate Indeed URL
    if (jobMode === "auto" && jobUrl.trim()) {
      const url = jobUrl.trim();
      if (!url.includes("indeed.com") || (!url.includes("viewjob") && !url.includes("jobs"))) {
        setFetchError("Please enter a valid Indeed job posting URL (e.g., https://www.indeed.com/viewjob?jk=...)");
        return;
      }
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
      const errorMessage = e?.message || "Could not fetch company information";
      if (errorMessage.includes("404") || errorMessage.includes("not found")) {
        setResolveErr("Company website not found. Please check the URL or try a different one.");
      } else if (errorMessage.includes("timeout") || errorMessage.includes("network")) {
        setResolveErr("Network error. Please check your connection and try again.");
      } else if (errorMessage.includes("invalid") || errorMessage.includes("malformed")) {
        setResolveErr("Invalid URL format. Please enter a valid website address.");
      } else {
        setResolveErr("Failed to fetch company information. Please check the URL or enter details manually.");
      }
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

    // Track generation start
    trackCoverLetterEvent('generation_started', template.id);
    trackUserJourney('cover_letter_generation', 'started', { templateId: template.id });

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

      // Track successful generation
      trackCoverLetterEvent('generation_completed', template.id, {
        generationTime: Date.now() - Date.now(), // Will be calculated properly
        success: true,
        tokensUsed: 0
      });
      trackUserJourney('cover_letter_generation', 'completed', { 
        templateId: template.id,
        success: true 
      });

      // Navigate to the editor
      router.push(`/Dashboard/Coverletters/${insertData.id}`);
      
    } catch (error: any) {
      console.error("Template generation error:", error);
      setGenerateError(error?.message || "Failed to generate cover letter");
      
      // Track failed generation
      trackCoverLetterEvent('generation_failed', template.id, {
        error: error?.message,
        success: false
      });
      trackUserJourney('cover_letter_generation', 'failed', { 
        templateId: template.id,
        error: error?.message 
      });
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
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            {profileLoading ? "Loading…" : <>Hi, {userName} 👋</>}
          </h2>
          {profileError && <div className="mt-1 text-xs text-red-600">{profileError}</div>}

          {step === 1 ? (
            <div className="mt-1 text-lg md:text-xl font-medium leading-snug text-gray-700 dark:text-gray-300">
              Ready to apply for a{" "}
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ${glow ? "animate-pulse bg-emerald-50 dark:bg-emerald-900/20" : ""}`}
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
                <PencilLine className="h-3 w-3 opacity-40" />
              </span>
              {" "}position?
            </div>
          ) : (
            <div className="mt-1 text-lg md:text-xl font-medium leading-snug text-gray-700 dark:text-gray-300">
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
        <div className="mt-8 space-y-8">
          {/* Job Section - More conversational */}
          <div className="bg-gradient-to-r from-emerald-50 to-violet-50 rounded-2xl p-6 border border-emerald-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                <span className="text-white text-sm font-semibold">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Tell us about the job</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                {jobMode === "auto" 
                  ? "Paste the Indeed job posting URL and we'll extract everything automatically" 
                  : "Or tell us about the role manually"
                }
              </p>
              
              {/* Mode toggle - more elegant */}
              <div className="flex bg-white rounded-xl p-1 border border-gray-200">
                <button 
                  type="button" 
                  onClick={() => setJobMode("auto")} 
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    jobMode === "auto" 
                      ? "bg-emerald-500 text-white shadow-sm" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Auto Extract
                </button>
                <button 
                  type="button" 
                  onClick={() => setJobMode("manual")} 
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    jobMode === "manual" 
                      ? "bg-emerald-500 text-white shadow-sm" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Manual Entry
                </button>
              </div>

              {/* Input area */}
              {jobMode === "auto" ? (
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setIndeedInstructionsOpen(!indeedInstructionsOpen)}
                      className="w-full flex items-center justify-between p-3 hover:bg-blue-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">i</span>
                        </div>
                        <p className="text-xs font-medium text-blue-800">How to get the Indeed job link</p>
                      </div>
                      {indeedInstructionsOpen ? (
                        <ChevronUp className="h-4 w-4 text-blue-700" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-blue-700" />
                      )}
                    </button>
                    {indeedInstructionsOpen && (
                      <div className="px-3 pb-3 pt-0">
                        <ol className="list-decimal list-inside space-y-1 text-xs text-blue-700">
                          <li>Go to the job posting on Indeed.com</li>
                          <li>Click the <strong>link button</strong> (🔗) next to "Apply on company site"</li>
                          <li>Copy the URL that appears in your clipboard</li>
                          <li>Paste it here</li>
                        </ol>
                      </div>
                    )}
                  </div>
                  <input 
                    placeholder="https://www.indeed.com/viewjob?jk=..." 
                    value={jobUrl} 
                    onChange={(e) => setJobUrl(e.target.value)} 
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" 
                  />
                  {fetchError && <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{fetchError}</div>}
                </div>
              ) : (
                <div className="space-y-3">
                  <input 
                    placeholder="e.g. Senior Software Engineer" 
                    value={jobTitle} 
                    onChange={(e) => setJobTitle(e.target.value)} 
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" 
                  />
                  <textarea 
                    rows={4} 
                    placeholder="Paste the job description here..." 
                    value={jobDescHtml} 
                    onChange={(e) => setJobDescHtml(e.target.value)} 
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none" 
                  />
                </div>
              )}

              {/* Action button */}
              <div className="flex justify-end">
                {fetching ? (
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-full text-sm text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Extracting details...
                  </div>
                ) : (
                  <button 
                    onClick={handleFetch} 
                    disabled={fetching || (jobMode === "auto" ? !jobUrl.trim() : !jobTitle.trim())} 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-full text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                  >
                    <Sparkles className="h-4 w-4" />
                    {jobMode === "auto" ? "Extract Job Details" : "Continue"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* CV Section - More conversational */}
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center">
                <span className="text-white text-sm font-semibold">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Your background</h3>
            </div>
            
            <div className="space-y-4">
              {/* CV status and content */}
              {hasUploadedCv === null ? (
                <div className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                  <span>Checking CV status...</span>
                </div>
              ) : hasUploadedCv ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    {cvMode === "auto" 
                      ? "We'll use your uploaded CV to personalize the cover letter" 
                      : "Or paste your CV content directly"
                    }
                  </p>
                  
                  {/* Mode toggle */}
                  <div className="flex bg-white rounded-xl p-1 border border-gray-200 mb-3">
                    <button 
                      type="button" 
                      onClick={() => setCvMode("auto")} 
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                        cvMode === "auto" 
                          ? "bg-violet-500 text-white shadow-sm" 
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Use Uploaded CV
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setCvMode("manual")} 
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                        cvMode === "manual" 
                          ? "bg-violet-500 text-white shadow-sm" 
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Paste CV Content
                    </button>
                  </div>

                  {/* CV content */}
                  {cvMode === "auto" ? (
                    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Using your uploaded CV from profile</span>
                    </div>
                  ) : (
                    <textarea 
                      rows={4} 
                      placeholder="Paste your CV content here..." 
                      value={cvText} 
                      onChange={(e) => setCvText(e.target.value)} 
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all resize-none" 
                    />
                  )}
                </>
              ) : (
                /* No CV uploaded - show upload option */
                <div className="space-y-3">
                  <div className="bg-amber-50 rounded-xl border border-amber-200 px-4 py-3 text-sm text-amber-700 flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span>No CV uploaded yet</span>
                  </div>
                  
                  {/* Show text area if user clicked "Paste Instead" */}
                  {cvMode === "manual" ? (
                    <div className="space-y-3">
                      <textarea 
                        rows={8} 
                        placeholder="Paste your CV content here... (This will be used to personalize your cover letter)" 
                        value={cvText} 
                        onChange={(e) => setCvText(e.target.value)} 
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all resize-none" 
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Or upload a file instead</span>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) uploadCv(file);
                            }}
                            className="hidden"
                            disabled={cvUploading}
                          />
                          <div className={`px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors ${
                            cvUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          }`}>
                            {cvUploading ? 'Uploading...' : '📄 Upload File'}
                          </div>
                        </label>
                      </div>
                    </div>
                  ) : (
                    /* Show upload area and paste button */
                    <div className="flex gap-3">
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadCv(file);
                          }}
                          className="hidden"
                          disabled={cvUploading}
                        />
                        <div className={`w-full rounded-xl border-2 border-dashed border-gray-300 px-4 py-6 text-center text-sm transition-all hover:border-violet-400 hover:bg-violet-50 ${
                          cvUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}>
                          {cvUploading ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-violet-600">Uploading...</span>
                            </div>
                          ) : (
                            <div className="text-gray-600">
                              <div className="font-medium">📄 Upload your CV</div>
                              <div className="text-xs mt-1">PDF, DOC, DOCX, or TXT</div>
                            </div>
                          )}
                        </div>
                      </label>
                      <button 
                        type="button" 
                        onClick={() => setCvMode("manual")} 
                        className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Paste Instead
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Next step hint */}
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">
              Once you've added the job details, we'll help you review and customize everything ✨
            </p>
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
              <div className="flex-1 relative">
                <input 
                  value={companyHomepage} 
                  onChange={(e) => setCompanyHomepage(e.target.value)} 
                  className={`w-full rounded-xl border px-3 py-2 text-sm shadow-sm transition-colors ${
                    resolveErr ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500'
                  }`} 
                  placeholder="https://company.com" 
                />
                {resolveErr && (
                  <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-red-50 border border-red-200 rounded-lg shadow-sm z-10">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-red-600 text-xs font-bold">!</span>
                      </div>
                      <div className="text-xs text-red-700">
                        <div className="font-medium">Failed to fetch company information</div>
                        <div className="mt-1">{resolveErr}</div>
                        <div className="mt-1 text-red-600">Please check the URL or enter company details manually</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button type="button" onClick={handleFetchCompanyAbout} disabled={resolvingHomepage} className="shrink-0 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium hover:shadow disabled:opacity-50" title="Fetch About from homepage">
                {resolvingHomepage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Fetch
              </button>
            </div>
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
              <p className="text-sm text-gray-600 mb-2">Select the tone that best matches your personality and the company culture.</p>
              {selectedTone && (
                <div className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full inline-flex items-center gap-1 mb-6">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  Using your default tone: <span className="font-medium capitalize">{selectedTone}</span>
                </div>
              )}
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
