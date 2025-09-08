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

        {/* Right rail (sticky + scroll) */}
        <aside
          className="
            w-full lg:w-[360px] shrink-0 self-start
            lg:sticky lg:top-20
            lg:max-h-[calc(100dvh-5rem)]
            lg:overflow-y-auto lg:pr-1
            space-y-4
          "
          aria-label="Sidebar"
        >
          <ProfileSection user={user} />
          <TokensCard 
            plan={plan}
            planQuotaRemaining={planQuotaRemaining || 0}
            topupRemaining={topupRemaining || 0}
            planQuota={planQuota || 0}
          />
          <RecentCard />

          {/* Plan tag */}
          <div className="rounded-full border text-xs px-3 py-1 w-fit text-foreground/70">
            Plan: {plan}
          </div>
        </aside>
      </div>
    </div>
  );
}
