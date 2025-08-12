import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus, Link2, FileText, Search, Zap, User, Sparkles } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect("/auth/login");

  // TODO: replace these with real queries
  const tokensLeft = 18; // from plans.tokens_remaining
  const plan = "Regular"; // Free | Regular | Pro
  const recent = [
    { id: "1", title: "Marketing Manager", company: "ACME", status: "Generated", createdAt: "2h ago" },
    { id: "2", title: "Product Designer", company: "Studio X", status: "Draft", createdAt: "1d ago" },
  ];
  const profilePct = 70;

  return (
    <div className="flex-1 w-full flex flex-col gap-6 md:gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Home</h1>
          <p className="text-sm text-foreground/60">Create, track, and export your cover letters.</p>
        </div>
        <div className="hidden md:flex gap-3">
          <Link
            href="/Dashboard/Coverletters/new"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600"
          >
            <Plus className="h-4 w-4" /> New letter
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 border text-sm hover:bg-white"
          >
            <Zap className="h-4 w-4" /> Upgrade
          </Link>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent activity */}
        <div className="lg:col-span-2 rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Recent letters</div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-foreground/40" />
              <input
                className="pl-8 pr-3 py-2 text-sm rounded-md border bg-white/70"
                placeholder="Find letters…"
              />
            </div>
          </div>
          <div className="mt-3 divide-y">
            {recent.map((r) => (
              <Link
                key={r.id}
                href={`/Dashboard/Coverletters/${r.id}`}
                className="flex items-center justify-between py-3 hover:bg-foreground/[0.03] rounded-lg px-2"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4" />
                  <div>
                    <div className="font-medium">
                      {r.title} • {r.company}
                    </div>
                    <div className="text-xs text-foreground/60">{r.createdAt}</div>
                  </div>
                </div>
                <span className="text-xs rounded-full px-2.5 py-1 border">{r.status}</span>
              </Link>
            ))}
            {recent.length === 0 && (
              <div className="text-sm text-foreground/60 py-8 text-center">
                No recent activity yet—create your first letter.
              </div>
            )}
          </div>
        </div>

        {/* Right rail */}
        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Tokens</div>
              <span className="text-xs rounded-full px-2 py-0.5 border">{plan}</span>
            </div>
            <div className="mt-3">
              <div className="h-2 rounded-full bg-foreground/10">
                <div
                  className="h-2 rounded-full bg-emerald-500"
                  style={{ width: `${Math.min(tokensLeft, 100)}%` }}
                />
              </div>
              <div className="mt-2 text-sm">{tokensLeft} / 100 left</div>
              <div className="mt-3 flex gap-2">
                <Link
                  href="/pricing"
                  className="flex-1 rounded-full px-3 py-2 text-sm bg-emerald-500 text-white text-center hover:bg-emerald-600"
                >
                  Buy tokens
                </Link>
                <Link
                  href="/pricing"
                  className="flex-1 rounded-full px-3 py-2 text-sm border text-center"
                >
                  Upgrade
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 font-semibold">
              <User className="h-4 w-4" /> Profile
            </div>
            <div className="mt-3">
              <div className="h-2 rounded-full bg-foreground/10">
                <div
                  className="h-2 rounded-full bg-indigo-500"
                  style={{ width: `${profilePct}%` }}
                />
              </div>
              <div className="mt-2 text-sm">{profilePct}% complete</div>
            </div>
            <Link
              href="/Dashboard/profile"
              className="mt-3 inline-block text-sm underline underline-offset-4"
            >
              Complete profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
