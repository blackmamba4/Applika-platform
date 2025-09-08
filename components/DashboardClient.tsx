"use client";

import CoverLetterWizard from "./CoverLetterWizard";
import ProfileSection from "../app/Dashboard/ProfileSection";
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
  tokensLeft,
}: {
  user: UserLite;
  plan: string;
  tokensLeft?: number;
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
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 border text-sm hover:bg-white"
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

          {/* Plan tag */}
          <div className="rounded-full border text-xs px-3 py-1 w-fit text-foreground/70">
            Plan: {plan}
          </div>
        </aside>
      </div>
    </div>
  );
}
