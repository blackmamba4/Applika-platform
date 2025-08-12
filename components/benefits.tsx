// components/sections/Benefits.tsx
"use client";
import { Wand2, Sparkles, Gauge, ShieldCheck, FileText, Download } from "lucide-react";

const items = [
  {
    title: "Tailored to each job",
    desc: "We analyze the company’s site and the role to shape content that fits.",
    Icon: Wand2,
  },
  {
    title: "Your voice, not a robot",
    desc: "Tone-matching keeps phrasing natural and consistent with your CV.",
    Icon: Sparkles,
  },
  {
    title: "10× faster",
    desc: "From URL to polished letter in under a minute.",
    Icon: Gauge,
  },
  {
    title: "Private by default",
    desc: "Your inputs aren’t shared; delete any time.",
    Icon: ShieldCheck,
  },
  {
    title: "ATS-friendly structure",
    desc: "Keywords and clean formatting that pass automated scans.",
    Icon: FileText,
  },
  {
    title: "Export anywhere",
    desc: "Copy, PDF, or DOCX—ready to send.",
    Icon: Download,
  },
];

export default function Benefits() {
  return (
    <section className="relative w-full">
      <div className="mx-auto max-w-6xl px-5 ">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Why people{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-400">
            choose
          </span>{" "}
          Applika
        </h2>

        <p className="mt-4 text-foreground/70 max-w-2xl">
          Everything you need to go from blank page to a confident, job-ready
          cover letter—without sounding generic.
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(({ title, desc, Icon }) => (
            <div
              key={title}
              className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-white">
                  <Icon className="h-4 w-4 text-indigo-500" />
                </div>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-foreground/70">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
