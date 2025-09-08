// app/pricing/page.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PLANS, TOKEN_PACKS } from "@/lib/billing/config";

async function startCheckout(args: { mode: "subscription" | "payment"; priceId: string }) {
  const res = await fetch("/api/billing/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(args),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(j.error || "Failed to start checkout");
  window.location.href = j.url; // redirect to Stripe
}

export default function PricingPage() {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const plans = useMemo(() => Object.values(PLANS).filter((p) => p.code !== "free"), []);
  const packs = useMemo(() => Object.values(TOKEN_PACKS), []);

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-10">
      {/* Header with back button */}
      <header className="text-center space-y-2">
        <div className="flex justify-between items-center mb-4">
          <Link
            href="/Dashboard"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm border hover:bg-white"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold flex-1 text-center">Pricing</h1>
          <div className="w-[140px]" /> {/* Spacer to balance layout */}
        </div>
        <p className="text-foreground/70">Choose a plan or buy one-time token top-ups.</p>
      </header>

      {/* PLANS */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Subscriptions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.code} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-semibold">{plan.name}</div>
                  <div className="text-sm text-foreground/60">{plan.quota} tokens / month</div>
                </div>
              </div>

              <ul className="mt-4 text-sm list-disc pl-5 space-y-1 text-foreground/80">
                <li>Monthly allowance resets automatically</li>
                <li>Buy top-ups any time</li>
              </ul>

              <button
                disabled={!plan.stripePriceId || loadingKey === plan.code}
                onClick={async () => {
                  try {
                    setLoadingKey(plan.code);
                    await startCheckout({ mode: "subscription", priceId: plan.stripePriceId! });
                  } finally {
                    setLoadingKey(null);
                  }
                }}
                className="mt-5 w-full rounded-full bg-emerald-500 text-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
              >
                {loadingKey === plan.code ? "Redirecting…" : `Choose ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* PACKS */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Top-up tokens</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {packs.map((pack) => (
            <div key={pack.code} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-semibold">{pack.name}</div>
                  <div className="text-sm text-foreground/60">{pack.amount} tokens (one-time)</div>
                </div>
              </div>

              <ul className="mt-4 text-sm list-disc pl-5 space-y-1 text-foreground/80">
                <li>Never expires</li>
                <li>Used after your monthly allowance runs out</li>
              </ul>

              <button
                disabled={!pack.stripePriceId || loadingKey === pack.code}
                onClick={async () => {
                  try {
                    setLoadingKey(pack.code);
                    await startCheckout({ mode: "payment", priceId: pack.stripePriceId! });
                  } finally {
                    setLoadingKey(null);
                  }
                }}
                className="mt-5 w-full rounded-full border px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
              >
                {loadingKey === pack.code ? "Redirecting…" : `Buy ${pack.amount} tokens`}
              </button>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center text-xs text-foreground/60">
        Test card: 4242 4242 4242 4242 · any future date · any CVC
      </footer>
    </div>
  );
}
