"use client";

import { useState, useMemo, useEffect } from "react";
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

export default function PricingClient() {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>("Free");
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingPlanSwitch, setPendingPlanSwitch] = useState<string | null>(null);

  const plans = useMemo(() => Object.values(PLANS), []); // Include all plans including free
  const packs = useMemo(() => Object.values(TOKEN_PACKS), []);

  // Fetch current user plan
  useEffect(() => {
    async function fetchCurrentPlan() {
      try {
        const response = await fetch("/api/tokens/balance");
        if (response.ok) {
          const data = await response.json();
          setCurrentPlan(data.plan || "Free");
        }
      } catch (error) {
        console.error("Failed to fetch current plan:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCurrentPlan();
  }, []);

  // Check if switching to a lower tier plan (downgrade)
  function isDowngrade(fromPlan: string, toPlanCode: string): boolean {
    const planOrder = { free: 0, regular: 1, pro: 2 };
    const fromLevel = planOrder[fromPlan.toLowerCase() as keyof typeof planOrder] ?? 0;
    const toLevel = planOrder[toPlanCode.toLowerCase() as keyof typeof planOrder] ?? 0;
    return toLevel < fromLevel;
  }

  // Plan switching function
  async function switchPlan(newPlanCode: string) {
    if (newPlanCode.toLowerCase() === currentPlan.toLowerCase()) return;
    
    // Check if this is a downgrade
    if (isDowngrade(currentPlan, newPlanCode)) {
      setPendingPlanSwitch(newPlanCode);
      setShowConfirmDialog(true);
      return;
    }
    
    // For upgrades, proceed directly
    await executePlanSwitch(newPlanCode);
  }

  // Execute the actual plan switch
  async function executePlanSwitch(newPlanCode: string) {
    setLoadingKey(`switch-${newPlanCode}`);
    
    try {
      const response = await fetch("/api/billing/switch-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPlanCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to switch plan");
      }

      // If payment is required, redirect to checkout
      if (data.requiresPayment && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      
      // For free plan switches, update current plan and refresh page
      setCurrentPlan(data.newPlan);
      window.location.reload();
      
    } catch (error) {
      console.error("Plan switch error:", error);
      alert(`Failed to switch plan: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoadingKey(null);
    }
  }

  // Handle confirmation dialog
  function handleConfirmSwitch() {
    if (pendingPlanSwitch) {
      executePlanSwitch(pendingPlanSwitch);
    }
    setShowConfirmDialog(false);
    setPendingPlanSwitch(null);
  }

  function handleCancelSwitch() {
    setShowConfirmDialog(false);
    setPendingPlanSwitch(null);
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-10">
      {/* Header with back button */}
      <header className="text-center space-y-2">
        <div className="flex justify-between items-center mb-4">
          <Link
            href="/Dashboard"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold flex-1 text-center text-gray-900 dark:text-gray-100">Pricing</h1>
          <div className="w-[140px]" /> {/* Spacer to balance layout */}
        </div>
        <p className="text-gray-600 dark:text-gray-400">Choose a plan or buy one-time token top-ups.</p>
        
        {/* Current Plan Display */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-blue-700 dark:text-blue-300">Current Plan:</span>
            <span className="font-semibold text-blue-900 dark:text-blue-100">
              {isLoading ? "Loading..." : currentPlan}
            </span>
          </div>
        </div>
      </header>

      {/* PLANS */}
      <section>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Subscriptions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrentPlan = !isLoading && currentPlan.toLowerCase() === plan.name.toLowerCase();
            const isFreePlan = !isLoading && currentPlan.toLowerCase() === "free";
            
            return (
              <div 
                key={plan.code} 
                className={`rounded-2xl border p-5 shadow-sm ${
                  isCurrentPlan 
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{plan.name}</div>
                      {isCurrentPlan && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">Current</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{plan.quota} tokens / month</div>
                  </div>
                </div>

                <ul className="mt-4 text-sm list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                  <li>Monthly allowance resets automatically</li>
                  <li>Buy top-ups any time</li>
                  {plan.code === "pro" && <li>Priority support</li>}
                </ul>

                {isLoading ? (
                  <div className="mt-5 w-full rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-4 py-2.5 text-sm font-semibold text-center">
                    Loading...
                  </div>
                ) : isCurrentPlan ? (
                  <div className="mt-5 w-full rounded-full bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 px-4 py-2.5 text-sm font-semibold text-center">
                    Current Plan
                  </div>
                ) : isFreePlan ? (
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
                    className="mt-5 w-full rounded-full bg-gradient-to-r from-emerald-500 to-violet-500 hover:from-emerald-600 hover:to-violet-600 text-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50 transition-all duration-200"
                  >
                    {loadingKey === plan.code ? "Redirecting…" : `Upgrade to ${plan.name}`}
                  </button>
                ) : plan.code === "free" ? (
                  <button
                    disabled={loadingKey === `switch-${plan.code}`}
                    onClick={() => switchPlan(plan.code)}
                    className="mt-5 w-full rounded-full border border-red-300 dark:border-red-600 bg-white dark:bg-gray-800 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2.5 text-sm font-semibold disabled:opacity-50 transition-all duration-200"
                  >
                    {loadingKey === `switch-${plan.code}` ? "Switching…" : `Switch to ${plan.name}`}
                  </button>
                ) : (
                  <button
                    disabled={loadingKey === `switch-${plan.code}`}
                    onClick={() => switchPlan(plan.code)}
                    className="mt-5 w-full rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2.5 text-sm font-semibold disabled:opacity-50 transition-all duration-200"
                  >
                    {loadingKey === `switch-${plan.code}` ? "Switching…" : `Switch to ${plan.name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* PACKS */}
      <section>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Top-up tokens</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {packs.map((pack) => (
            <div key={pack.code} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{pack.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{pack.amount} tokens (one-time)</div>
                </div>
              </div>

              <ul className="mt-4 text-sm list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
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
                className="mt-5 w-full rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2.5 text-sm font-semibold disabled:opacity-50 transition-all duration-200"
              >
                {loadingKey === pack.code ? "Redirecting…" : `Buy ${pack.amount} tokens`}
              </button>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center text-xs text-gray-500 dark:text-gray-400">
        Test card: 4242 4242 4242 4242 · any future date · any CVC
      </footer>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Confirm Plan Change
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You're about to downgrade from <strong>{currentPlan}</strong> to <strong>{pendingPlanSwitch?.charAt(0).toUpperCase()}{pendingPlanSwitch?.slice(1)}</strong>. 
              This will immediately cancel your current subscription and you'll lose access to your current plan's features.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelSwitch}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSwitch}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Confirm Downgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
