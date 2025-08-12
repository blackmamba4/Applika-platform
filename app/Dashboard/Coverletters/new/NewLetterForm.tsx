"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Link2, Loader2, Upload, X } from "lucide-react";

export default function NewLetterForm() {
  const router = useRouter();
  const qs = useSearchParams();

  const [mode, setMode] = useState<"text" | "url">(
    (qs.get("mode") as "text" | "url") || "text"
  );
  const [jobDesc, setJobDesc] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [style, setStyle] = useState<"Professional" | "Modern" | "Creative">(
    "Professional"
  );
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const onPickFile = () => inputRef.current?.click();
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setCvFile(f);
  };

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 650)); // mock

    const id = String(Date.now());
    const payload = {
      id,
      title: "Marketing Manager",
      company: "ACME",
      jobUrl: mode === "url" ? jobUrl : undefined,
      content:
        "Dear Hiring Manager,\n\nI’m excited to apply for the position at ACME. Based on the job description, my background aligns well...\n\nBest regards,\nYour Name",
      style,
      createdAt: new Date().toISOString(),
      status: "Generated",
      cvFileName: cvFile?.name,
    };
    try {
      localStorage.setItem(`letter:${id}`, JSON.stringify(payload));
    } catch {}

    setLoading(false);
    router.push(`/dashboard/coverletters/${id}`);
  }

  const disabled =
    loading ||
    !cvFile ||
    (mode === "text" ? jobDesc.trim().length < 20 : jobUrl.trim().length < 8);

  return (
    <form onSubmit={handleGenerate} className="space-y-8">
      {/* segmented control */}
      <div className="inline-flex rounded-full bg-white/80 border shadow-sm p-1 backdrop-blur">
        {[
          { key: "text", label: "Paste description" },
          { key: "url", label: "From URL" },
        ].map((tab) => {
          const active = mode === (tab.key as "text" | "url");
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setMode(tab.key as any)}
              className={[
                "px-4 py-1.5 rounded-full text-sm transition shadow-sm",
                active
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                  : "text-foreground/80 hover:bg-foreground/[0.04]",
              ].join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* CV upload */}
      <div>
        <label className="block text-sm font-medium mb-2">Upload your CV (PDF or DOCX)</label>
        <div
          onClick={onPickFile}
          className={[
            "group flex items-center justify-between gap-3 rounded-2xl border-2 border-dashed p-5",
            "bg-white/85 backdrop-blur hover:bg-white",
            cvFile ? "border-emerald-300" : "border-foreground/15",
            "shadow-sm hover:shadow-lg transition",
          ].join(" ")}
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl border p-2 bg-white shadow-sm">
              <Upload className="h-5 w-5 text-foreground/70" />
            </div>
            <div className="text-sm">
              <div className="font-medium">
                {cvFile ? "File selected" : "Drop your CV here or click to browse"}
              </div>
              <div className="text-foreground/60 text-xs">
                Accepted: .pdf, .docx • Max ~10MB
              </div>
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={onFile}
          />
          {cvFile ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCvFile(null);
              }}
              className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs bg-white hover:shadow"
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </button>
          ) : (
            <button
              type="button"
              className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-xs font-medium text-white shadow hover:shadow-md"
            >
              Choose file
            </button>
          )}
        </div>
        {cvFile && (
          <div className="mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs bg-white shadow-sm">
            <span className="truncate max-w-[260px]">{cvFile.name}</span>
          </div>
        )}
      </div>

      {/* Job inputs */}
      {mode === "url" ? (
        <div>
          <label className="block text-sm font-medium mb-2">Job posting URL</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://indeed.co.uk/viewjob?jk=..."
              className="flex-1 rounded-xl border bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            />
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm text-white shadow hover:shadow-md hover:scale-[1.02] transition"
            >
              <Link2 className="h-4 w-4" />
              Fetch
            </button>
          </div>
          <p className="mt-2 text-xs text-foreground/60">
            If a site blocks fetching, just paste the full description instead.
          </p>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium mb-2">Job description</label>
          <textarea
            rows={8}
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            placeholder="Paste the full job description…"
            className="w-full rounded-2xl border bg-white px-3 py-2 text-sm leading-relaxed shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          />
        </div>
      )}

      {/* Style picker */}
      <div>
        <label className="block text-sm font-medium mb-2">Letter style</label>
        <div className="flex flex-wrap gap-2">
          {(["Professional", "Modern", "Creative"] as const).map((s) => {
            const active = style === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStyle(s)}
                className={[
                  "rounded-xl px-3 py-2 text-sm border shadow-sm transition",
                  active
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700 shadow"
                    : "bg-white hover:bg-foreground/[0.04]",
                ].join(" ")}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Link
          href="/dashboard"
          className="rounded-full border bg-white px-4 py-2 text-sm shadow hover:shadow-md hover:scale-[1.02] transition"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Generate & edit
        </button>
      </div>

      <p className="text-xs text-foreground/60">
        Generating a letter uses <b>1 token</b>. You can refine everything on the next screen.
      </p>
    </form>
  );
}
