"use client";
import Link from "next/link";
import Typewriter from "@/components/typewriter";

export function Hero() {
  return (
    <section className="relative w-full">
      <div className="mx-auto max-w-6xl px-5 grid md:grid-cols-2 gap-8 md:gap-16 items-center">
        {/* 1) COPY + CTA (left) */}
        <div className="order-1">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
            Cover letters
            <br />
            that{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-400">
              actually
            </span>{" "}
            get read.
          </h1>

          <p className="mt-5 text-base md:text-lg text-foreground/70 max-w-xl">
            Upload your CV, drop the company’s URL and get an AI-tailored
            letter that sounds like you.
          </p>

          <div className="mt-6 md:mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/Dashboard"
              className="inline-flex items-center justify-center rounded-full px-6 py-3 text-base md:text-lg font-semibold shadow-md hover:shadow-lg transition active:scale-[.99] bg-emerald-500 text-white"
            >
              Generate my cover letter
            </Link>
            <Link
              href="/how-it-works"
              className="text-sm md:text-base underline underline-offset-4"
            >
              See how it works
            </Link>
          </div>
        </div>

        {/* 2) PREVIEW CARD (right on desktop, under CTAs on mobile) */}
        <div className="order-2 md:order-2 relative flex justify-center md:justify-end">
          {/* green accent bar */}
          <div className="absolute -left-2 sm:-left-4 top-8 bottom-8 w-1.5 rounded-full bg-emerald-400/80 hidden sm:block" />
          <div className="relative rounded-3xl border bg-white shadow-xl p-5 md:p-8 w-full max-w-[620px]">
            <p className="font-semibold text-lg md:text-xl mb-4">
              Dear Hiring Manager,
            </p>
              <Typewriter
                lines={[
                  "I was thrilled to see ACME Corp’s opening for the Marketing Manager role. Your commitment to innovation and fostering top-tier talent stood out to me…",
                  "I’ve been following your work on sustainable marketing and green technology and would love to contribute to that mission.",
                ]}
                speedMs={24}
                linePauseMs={700}
                startOnVisible
                className="text-sm md:text-base text-foreground/80 leading-relaxed"
              />

            <div className="mt-6 h-2 w-40 rounded-full bg-foreground/10" />
          </div>
        </div>

        {/* 3) FEATURES (always under copy; mobile comes after the card) */}
        <div className="order-3 md:col-start-1 md:row-start-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl">
            {[
              "Tailored to the job",
              "ATS-ready formats",
              "Beautiful industry tone",
            ].map((f) => (
              <div
                key={f}
                className="rounded-2xl border p-4 shadow-sm bg-white/70 backdrop-blur"
              >
                <div className="mb-2 h-5 w-5 rounded-md bg-indigo-500/90" />
                <p className="text-sm font-medium">{f}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}