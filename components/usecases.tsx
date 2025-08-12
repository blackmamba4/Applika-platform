// components/sections/UseCases.tsx
"use client";
import { useState } from "react";
import {
  GraduationCap,
  Repeat,
  Clock,
  Globe2,
  Target,
  Briefcase,
} from "lucide-react";
import Link from "next/link";

const CASES = [
  {
    key: "students",
    title: "Students & recent grads",
    desc:
      "Turn projects and coursework into achievement-driven bullets that feel real, not fluffy.",
    points: [
      "Translate coursework to impact statements",
      "Frame internships & clubs as quantifiable wins",
      "Tone: confident, concise, friendly",
    ],
    Icon: GraduationCap,
    accent: "from-indigo-500 to-sky-400",
    cta: { label: "See sample for grads", href: "/samples/students" },
  },
  {
    key: "switchers",
    title: "Career switchers",
    desc:
      "Bridge your past roles to a new domain with crisp, JD-aligned language.",
    points: [
      "Map transferable skills to the job",
      "Mirror keywords without buzzword stuffing",
      "Tone: credible, focused, optimistic",
    ],
    Icon: Repeat,
    accent: "from-violet-500 to-fuchsia-400",
    cta: { label: "Switch career now", href: "/samples/switchers" },
  },
  {
    key: "busy",
    title: "Busy professionals",
    desc:
      "Batch-generate tailored letters for multiple roles in minutes.",
    points: [
      "Reusable intros & closers",
      "Company hooks pulled from URLs",
      "Tone: direct, senior, succinct",
    ],
    Icon: Clock,
    accent: "from-emerald-500 to-teal-400",
    cta: { label: "Generate faster", href: "/generate" },
  },
  {
    key: "international",
    title: "International applicants",
    desc:
      "Concise English with the right tone for each market and industry.",
    points: [
      "Cultural tone presets",
      "Clear, idiomatic phrasing",
      "Tone: polite, confident, natural",
    ],
    Icon: Globe2,
    accent: "from-blue-500 to-cyan-400",
    cta: { label: "See tone presets", href: "/presets" },
  },
  {
    key: "technical",
    title: "Niche & technical roles",
    desc:
      "Use domain-specific language without sounding like a jargon bot.",
    points: [
      "Context-aware terminology",
      "ATS-friendly structure",
      "Tone: expert, human, precise",
    ],
    Icon: Target,
    accent: "from-amber-500 to-orange-400",
    cta: { label: "View tech sample", href: "/samples/technical" },
  },
  {
    key: "top",
    title: "Top-tier applications",
    desc:
      "Stand out with company-specific hooks from their site and recent news.",
    points: [
      "Pull initiatives, values, and products",
      "Personalized openers that land",
      "Tone: sharp, bespoke, memorable",
    ],
    Icon: Briefcase,
    accent: "from-pink-500 to-rose-400",
    cta: { label: "Make it bespoke", href: "/generate" },
  },
];

export default function UseCases() {
  const [active, setActive] = useState(0);
  const A = CASES[active];

  return (
    <section className="relative w-full">
      <div className="mx-auto max-w-6xl px-5 ">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Perfect for{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-400">
            every
          </span>{" "}
          application
        </h2>
        <p className="mt-3 text-foreground/70 max-w-2xl">
          Pick your situation to see how Applika adapts tone, structure, and keywords.
        </p>

        <div className="mt-8 grid md:grid-cols-[320px,1fr] gap-6 md:gap-10">
          {/* Tabs */}
          <div className="md:sticky md:top-20">
            <div
              role="tablist"
              aria-label="Use case tabs"
              className="flex md:flex-col gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {CASES.map(({ title, Icon, accent }, i) => {
                const selected = i === active;
                return (
                  <button
                    key={title}
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActive(i)}
                    className={[
                      "group min-w-max md:w-full rounded-2xl border px-4 py-3 text-left transition",
                      selected
                        ? "bg-white shadow-md"
                        : "bg-white/70 hover:bg-white",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={[
                          "h-8 w-8 rounded-lg bg-gradient-to-r",
                          selected ? accent : "from-zinc-200 to-zinc-100",
                        ].join(" ")}
                      />
                      <div>
                        <div className="font-semibold leading-tight">{title}</div>
                        {!selected && (
                          <div className="text-xs text-foreground/60">Tap to preview</div>
                        )}
                      </div>
                      <Icon className="ml-auto h-4 w-4 text-foreground/60" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panel */}
          <div
            role="tabpanel"
            className="relative rounded-3xl border bg-white p-6 md:p-8 shadow-sm"
          >
            {/* Accent header */}
            <div
              className={`absolute -top-1 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r ${A.accent}`}
              aria-hidden
            />
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              {/* Copy */}
              <div className="flex-1">
                <div className="inline-flex items-center gap-2">
                  <div className={`h-6 w-6 rounded-md bg-gradient-to-r ${A.accent}`} />
                  <span className="text-sm uppercase tracking-wide text-foreground/60">
                    Use case
                  </span>
                </div>
                <h3 className="mt-2 text-2xl md:text-3xl font-bold">{A.title}</h3>
                <p className="mt-2 text-foreground/70">{A.desc}</p>
                <ul className="mt-4 space-y-2">
                  {A.points.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <span className="mt-[7px] inline-block h-1.5 w-1.5 rounded-full bg-foreground/40" />
                      <span className="text-sm text-foreground/80">{p}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link
                    href={A.cta.href}
                    className="inline-flex items-center rounded-full px-5 py-2.5 bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition"
                  >
                    {A.cta.label}
                  </Link>
                </div>
              </div>

              {/* Preview mock */}
              <div className="lg:w-[44%]">
                <div className="relative rounded-2xl border p-5 shadow-md bg-white">
                  <div className={`absolute -left-3 top-8 bottom-8 w-1.5 rounded-full bg-gradient-to-b ${A.accent}`} />
                  <p className="font-semibold mb-3">Dear Hiring Manager,</p>
                  <p className="text-sm text-foreground/80">
                    I’m excited to apply for the role at <span className="font-medium">ACME</span>.
                    My background aligns well with your goals, and I’d love to contribute to
                    your work on <span className="italic">product growth and customer experience</span>.
                  </p>
                  <p className="mt-3 text-sm text-foreground/80">
                    Recently I led initiatives that improved outcomes by 23%—I’d bring the same
                    focus and energy to your team.
                  </p>
                  <div className="mt-5 h-2 w-40 rounded-full bg-foreground/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>  
    </section>
  );
}
