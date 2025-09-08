"use client";

import CoverLetterWizard from "./CoverLetterWizard";
import ProfileSection from "../app/Dashboard/ProfileSection";
import RecentCard from "./RecentCard";
import TokensCard from "./TokensCard";
import Link from "next/link";
import { Zap } from "lucide-react";

type UserLite = {
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
};

export default function DashboardClient({
  user,
  plan,
  planQuotaRemaining,
  topupRemaining,
  planQuota,
}: {
  user: UserLite;
  plan: string;
  planQuotaRemaining?: number;
  topupRemaining?: number;
  planQuota?: number;
}) {
  return (
    <div className="flex-1 w-full flex flex-col gap-6 md:gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Home</h1>
        </div>
        <div className="hidden md:flex gap-3">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-violet-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 hover:from-emerald-600 hover:to-violet-600"
          >
            <Zap className="h-4 w-4" /> Upgrade
          </Link>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid gap-4 items-start lg:[grid-template-columns:minmax(0,1fr)_360px]">
        {/* Main Apply Card */}
        <main className="min-w-0 lg:pr-2">
          <CoverLetterWizard />
        </main>

        {/* Right rail (compact summary) */}
        <aside
          className="
            w-full lg:w-[320px] shrink-0 self-start
            lg:sticky lg:top-20
            space-y-3
          "
          aria-label="Sidebar"
        >
          {/* Compact Profile Summary */}
          <div className="rounded-lg border bg-white p-4 hover-lift">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-violet-500 text-white text-sm font-semibold">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {user?.name || "Your Name"}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user?.email}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Profile</span>
              <a href="/Dashboard/profile" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Manage →
              </a>
            </div>
          </div>

          {/* Tokens Card */}
          <TokensCard 
            plan={plan}
            planQuotaRemaining={planQuotaRemaining || 0}
            topupRemaining={topupRemaining || 0}
            planQuota={planQuota || 0}
          />

          {/* Recent Card */}
          <RecentCard />

          {/* Plan Badge */}
          <div className="rounded-full border text-xs px-3 py-1 w-fit text-foreground/70 bg-gray-50">
            {plan} Plan
          </div>
        </aside>
      </div>
    </div>
  );
}
