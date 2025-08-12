"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Save, Download, Copy, Sparkles, Type, AlignJustify } from "lucide-react";

type Letter = {
  id: string;
  title?: string;
  company?: string;
  jobUrl?: string;
  content: string;
  createdAt?: string;
  style?: string;
  status?: string;
  cvFileName?: string;
};

export default function EditorCanvas({ id }: { id: string }) {
  const [letter, setLetter] = useState<Letter | null>(null);

  // simple styling controls (MVP, expandable later)
  const [fontSize, setFontSize] = useState<number>(14);
  const [lineHeight, setLineHeight] = useState<number>(22);
  const [font, setFont] = useState<"Inter" | "Georgia" | "Monospace">("Inter");
  const [tone, setTone] = useState<"Confident" | "Warm" | "Direct">("Confident");
  const [saving, setSaving] = useState(false);

  // load from localStorage (mock DB)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`letter:${id}`);
      if (raw) setLetter(JSON.parse(raw));
      else {
        setLetter({
          id,
          content:
            "Dear Hiring Manager,\n\nThanks for considering my application. This is a placeholder draft.\n\nBest,\nYour Name",
        });
      }
    } catch {}
  }, [id]);

  // persist to localStorage
  async function handleSave() {
    if (!letter) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 350)); // pretend network latency
    try {
      localStorage.setItem(`letter:${id}`, JSON.stringify(letter));
    } catch {}
    setSaving(false);
  }

  function handleCopy() {
    if (!letter) return;
    navigator.clipboard.writeText(letter.content).catch(() => {});
  }

  // simple text export (txt for MVP; swap to PDF later)
  function handleExport() {
    if (!letter) return;
    const blob = new Blob([letter.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (letter.title || "cover-letter") + ".txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  const previewStyle = useMemo(
    () => ({
      fontFamily:
        font === "Inter"
          ? "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif"
          : font === "Georgia"
          ? "Georgia, Times New Roman, serif"
          : "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
      fontSize: `${fontSize}px`,
      lineHeight: `${lineHeight / fontSize}`,
    }),
    [font, fontSize, lineHeight]
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="rounded-2xl bg-white/85 backdrop-blur border shadow-lg p-3 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-xl border bg-white shadow-sm px-3 py-2">
          <Type className="h-4 w-4" />
          <select
            value={font}
            onChange={(e) => setFont(e.target.value as any)}
            className="text-sm bg-transparent focus:outline-none"
          >
            <option>Inter</option>
            <option>Georgia</option>
            <option>Monospace</option>
          </select>

          <span className="mx-2 h-5 w-px bg-foreground/10" />
          <label className="text-xs text-foreground/60">Size</label>
          <input
            type="range"
            min={12}
            max={20}
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.currentTarget.value, 10))}
            className="w-24"
            />
          <span className="text-xs w-6 text-right">{fontSize}</span>

          <span className="mx-2 h-5 w-px bg-foreground/10" />
          <AlignJustify className="h-4 w-4" />
          <label className="text-xs text-foreground/60">Line</label>
          <input
            type="range"
            min={18}
            max={28}
            value={lineHeight}
            onChange={(e) => setLineHeight(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-xs w-6 text-right">{lineHeight}</span>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border bg-white shadow-sm px-3 py-2">
          <Sparkles className="h-4 w-4" />
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as any)}
            className="text-sm bg-transparent focus:outline-none"
          >
            <option>Confident</option>
            <option>Warm</option>
            <option>Direct</option>
          </select>
          <button
            type="button"
            onClick={() =>
              // tiny demo nudge based on tone
              letter &&
              setLetter({
                ...letter,
                content:
                  tone === "Warm"
                    ? letter.content.replace("Dear Hiring Manager", "Hello Hiring Manager")
                    : tone === "Direct"
                    ? letter.content.replace("I’m excited to apply for", "I’m applying for")
                    : letter.content,
              })
            }
            className="text-xs rounded-full border px-2 py-1 hover:bg-foreground/[0.04]"
          >
            Apply tone
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-full border bg-white px-3 py-2 text-sm shadow hover:shadow-md hover:scale-[1.02] transition"
          >
            <Copy className="h-4 w-4 inline mr-1" />
            Copy
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="rounded-full border bg-white px-3 py-2 text-sm shadow hover:shadow-md hover:scale-[1.02] transition"
          >
            <Download className="h-4 w-4 inline mr-1" />
            Export .txt
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition"
            disabled={saving}
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Editor panel */}
        <div className="rounded-2xl border bg-white/85 backdrop-blur shadow-xl p-4 md:p-5">
          <div className="text-sm font-semibold mb-2">Editor</div>
          <textarea
            value={letter?.content ?? ""}
            onChange={(e) =>
              setLetter((l) => (l ? { ...l, content: e.target.value } : l))
            }
            rows={18}
            className="w-full h-[60vh] rounded-xl border bg-white px-3 py-2 text-sm leading-relaxed shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            style={{
              fontFamily: previewStyle.fontFamily as string,
              fontSize: previewStyle.fontSize as string,
              lineHeight: previewStyle.lineHeight as string,
            }}
          />
        </div>

        {/* Preview panel */}
        <div className="rounded-2xl border bg-white/85 backdrop-blur shadow-xl p-4 md:p-5">
          <div className="text-sm font-semibold mb-2">Preview</div>
          <div className="relative">
            <div className="absolute -left-3 top-8 bottom-8 w-1.5 rounded-full bg-emerald-400/80" />
            <div className="rounded-2xl border p-5 bg-white shadow-sm">
              <pre
                className="whitespace-pre-wrap text-foreground/90"
                style={previewStyle as any}
              >
                {letter?.content ?? ""}
              </pre>
              <div className="mt-5 h-2 w-40 rounded-full bg-foreground/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
