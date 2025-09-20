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
          className="inline-flex items-center justify-center w-full rounded-xl px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
        >
          Start free
        </Link>
      ),
      highlighted: false,
      color: "from-gray-500 to-gray-600",
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
      color: "from-emerald-500 to-teal-500",
    },
    {
      name: "Pro",
      price: "£30",
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
      color: "from-violet-500 to-purple-500",
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
    <section id="pricing" className="relative w-full py-16">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-sm font-medium text-purple-700 dark:text-purple-300 mb-6">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
            Simple, transparent pricing
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black leading-[0.9] tracking-tight mb-6">
            <span className="block text-gray-900 dark:text-gray-100">Fair</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-violet-600 to-purple-600">
              Pricing
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            No hidden fees, no surprises. Pay for what you use, when you need it. 
            Start free and upgrade when you're ready to land that dream job.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border-2 bg-white dark:bg-gray-800 shadow-md p-6 flex flex-col transition-all duration-300 hover:shadow-lg ${
                plan.highlighted 
                  ? "border-violet-500 dark:border-violet-400 scale-105 shadow-lg" 
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {/* Gradient accent */}
              <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${plan.color}`}></div>
              
              {/* Popular badge */}
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-violet-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{plan.name}</h3>
                
                <div className="mb-3">
                  <span className="text-4xl font-black text-gray-900 dark:text-gray-100">{plan.price}</span>
                  <span className="text-base text-gray-600 dark:text-gray-300 ml-1">{plan.period}</span>
                </div>
                
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full inline-block">
                  {plan.tokens}
                </p>
              </div>

              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center mt-0.5 flex-shrink-0`}>
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">{plan.button}</div>
            </div>
          ))}
        </div>

        {/* Token Packs */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Need extra tokens?</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Buy one-time top-ups that don't change your plan.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {packs.map((p) => (
              <div key={p.name} className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-base font-bold text-gray-900 dark:text-gray-100">{p.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{p.blurb}</div>
                  </div>
                  <div>{p.button}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            1 token = 1 cover letter. Unused plan tokens reset monthly. Top-up tokens remain available until used. 
            Prices shown are examples; final amount is shown at checkout.
          </p>
        </div>
      </div>
    </section>
  );
}
