// components/sections/Pricing.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { PLANS, TOKEN_PACKS } from "@/lib/billing/config"; // make sure this file exports the ids we set up

type BtnProps = {
  label: string;
  mode: "subscription" | "payment";
  priceId: string;
};

async function startCheckout({ mode, priceId }: { mode: "subscription" | "payment"; priceId: string }) {
  try {
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, priceId }),
    });

    // Not signed in → server returns 401; bounce to login and come back here
    if (res.status === 401) {
      const back = encodeURIComponent("/pricing");
      window.location.href = `/auth/login?redirect=${back}`;
      return;
    }

    const j = await res.json().catch(() => ({}));
    if (!res.ok || !j?.url) {
      throw new Error(j?.error || "Failed to start checkout");
    }
    window.location.href = j.url as string;
  } catch (e) {
    // Fallback: send them to a generic pricing page or show a toast
    alert((e as any)?.message || "Unable to start checkout right now.");
  }
}

function CheckoutButton({ label, mode, priceId }: BtnProps) {
  const [loading, setLoading] = useState(false);
  return (
    <button
      onClick={async () => {
        if (loading) return;
        setLoading(true);
        await startCheckout({ mode, priceId });
        setLoading(false);
      }}
      className="inline-flex items-center justify-center w-full rounded-full px-5 py-2.5 bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition disabled:opacity-50"
      disabled={loading}
    >
      {loading ? "Redirecting…" : label}
    </button>
  );
}

export default function Pricing() {
  // Pull labels/tokens/prices from config (adjust display text as you like)
  const plans = [
    {
      name: "Free",
      price: "£0",
      period: "/month",
      tokens: `${PLANS.free.quota} tokens / month`, // 3
      features: [
        "1 token = 1 cover letter",
        "Basic tone matching",
        "PDF & DOCX export",
      ],
      button: (
        <Link
          href="/auth/login?redirect=/pricing"
          className="inline-flex items-center justify-center w-full rounded-full px-5 py-2.5 border text-sm hover:bg-white"
        >
          Start free
        </Link>
      ),
      highlighted: false,
    },
    {
      name: "Regular",
      price: "£12",
      period: "/month",
      tokens: `${PLANS.regular.quota} tokens / month`, // 100
      features: [
        "Great for active job hunting",
        "Advanced tone matching",
        "Company-specific hooks",
      ],
      button: (
        <CheckoutButton
          label="Choose Regular"
          mode="subscription"
          priceId={PLANS.regular.stripePriceId!}
        />
      ),
      highlighted: false,
    },
    {
      name: "Pro",
      price: "£29.99",
      period: "/month",
      tokens: `${PLANS.pro.quota} tokens / month`, // 300
      features: [
        "For serious applicants",
        "Advanced tone matching",
        "Priority support",
      ],
      button: (
        <CheckoutButton
          label="Go Pro"
          mode="subscription"
          priceId={PLANS.pro.stripePriceId!}
        />
      ),
      highlighted: true,
    },
  ];

  const packs = [
    {
      name: "Token Pack 20",
      price: "£?", // optional: show public price if you want
      blurb: `${TOKEN_PACKS.pack20.amount} extra tokens (one-time)`,
      button: (
        <CheckoutButton
          label="Buy 20 tokens"
          mode="payment"
          priceId={TOKEN_PACKS.pack20.stripePriceId!}
        />
      ),
    },
    {
      name: "Token Pack 50",
      price: "£?",
      blurb: `${TOKEN_PACKS.pack50.amount} extra tokens (one-time)`,
      button: (
        <CheckoutButton
          label="Buy 50 tokens"
          mode="payment"
          priceId={TOKEN_PACKS.pack50.stripePriceId!}
        />
      ),
    },
  ];

  return (
    <section className="relative w-full">
      <div className="mx-auto max-w-6xl px-5 text-center">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Pricing</h2>
        <p className="mt-4 text-foreground/70 max-w-2xl mx-auto">
          Simple tokens. Clear limits. No surprises.
        </p>

        {/* Plans */}
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

              <div className="mt-8">{plan.button}</div>
            </div>
          ))}
        </div>

        {/* Packs */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold">Need extra tokens?</h3>
          <p className="text-foreground/70 text-sm mt-1">Buy one-time top-ups that don’t change your plan.</p>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            {packs.map((p) => (
              <div key={p.name} className="rounded-2xl border bg-white p-6 shadow-sm text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-base font-semibold">{p.name}</div>
                    <div className="text-sm text-foreground/70">{p.blurb}</div>
                  </div>
                  <div>{p.button}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-foreground/60 mt-8">
          1 token = 1 cover letter. Unused plan tokens reset monthly. Top-up tokens do not roll over between months,
          but remain available until used. Prices shown are examples; final amount is shown at checkout.
        </p>
      </div>
    </section>
  );
}
