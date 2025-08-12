// components/sections/FinalCTA.tsx
"use client";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="relative w-full ">
      <div className="mx-auto max-w-6xl px-5 text-center">
        {/* Testimonial */}
        <figure className="max-w-3xl mx-auto">
          <blockquote className="text-xl md:text-2xl font-medium text-foreground/80 leading-relaxed">
            “I landed 3 interviews in a week after switching to Applika’s AI-tailored letters.
            Recruiters told me my cover letter actually stood out — that’s never happened before.”
          </blockquote>
          <figcaption className="mt-4 text-sm text-foreground/60">
            — Sarah W., Marketing Manager
          </figcaption>
        </figure>

        {/* Divider */}
        <div className="mt-10 mb-8 h-px w-full bg-border" />

        {/* CTA */}
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Ready to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-400">
            land your next role?
          </span>
        </h2>
        <p className="mt-3 text-foreground/70 max-w-xl mx-auto">
          Stop sending generic applications. Let Applika craft a letter that gets read.
        </p>

        <div className="mt-6">
          <Link
            href="/generate"
            className="inline-flex items-center justify-center rounded-full px-8 py-3 text-lg font-semibold shadow-md hover:shadow-lg transition active:scale-[.99] bg-emerald-500 text-white hover:bg-emerald-600"
          >
            Generate my cover letter
          </Link>
        </div>
      </div>
    </section>
  );
}
