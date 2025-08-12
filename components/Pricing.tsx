// components/sections/Pricing.tsx
"use client";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "£0",
    period: "/month",
    tokens: "3 tokens / month",
    features: [
      "1 token = 1 cover letter",
      "Basic tone matching",
      "PDF & DOCX export",
    ],
    cta: { label: "Start free", href: "/signup" },
    highlighted: false,
  },
  {
    name: "Regular",
    price: "£12",
    period: "/month",
    tokens: "30 tokens / month",
    features: [
      "Great for active job hunting",
      "Advanced tone matching",
      "Company-specific hooks",
    ],
    cta: { label: "Choose Regular", href: "/signup?plan=regular" },
    highlighted: false,
  },
  {
    name: "Pro",
    price: "£29.99",
    period: "/month",
    tokens: "100 tokens / month",
    features: [
      "For serious applicants",
      "Advanced tone matching",
      "Priority support",
    ],
    cta: { label: "Go Pro", href: "/signup?plan=pro100" },
    highlighted: true,
  },
];

export default function Pricing() {
  return (
    <section className="relative w-full">
      <div className="mx-auto max-w-6xl px-5 text-center">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Pricing</h2>
        <p className="mt-4 text-foreground/70 max-w-2xl mx-auto">
          Simple tokens. Clear limits. No surprises.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl border bg-white shadow-sm p-6 flex flex-col ${
                plan.highlighted ? "border-emerald-400 shadow-md scale-[1.02]" : ""
              }`}
            >
              <h3 className="text-xl font-semibold">{plan.name}</h3>

              <div className="mt-4 flex items-baseline justify-center md:justify-start">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="ml-1 text-sm text-foreground/60">{plan.period}</span>
              </div>

              <p className="mt-1 text-sm font-medium text-foreground/80">
                {plan.tokens}
              </p>

              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground/70">
                    <span className="mt-[5px] inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link
                  href={plan.cta.href}
                  className="inline-flex items-center justify-center w-full rounded-full px-5 py-2.5 bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition"
                >
                  {plan.cta.label}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-foreground/60 mt-6">
          1 token = 1 cover letter. Extra tokens: £5 for 10. Unused tokens reset monthly.
        </p>
      </div>
    </section>
  );
}
