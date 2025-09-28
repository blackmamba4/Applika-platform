import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CoverLetterWizard from "@/components/CoverLetterWizard"; // fixed import path

export default async function Page() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/auth/login");

  return (
    <div className="min-h-screen px-4">
      <div className="mx-auto w-full max-w-8xl">
        <div className="mb-6">
          <Link
            href="/Dashboard"
            className="inline-flex items-center gap-2 rounded-full border bg-white/80 backdrop-blur px-4 py-1.5 shadow hover:shadow-md hover:scale-[1.02] transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>

        <div className="rounded-3xl bg-white/80 backdrop-blur-lg shadow-2xl p-6 md:p-8 border border-white/60">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-emerald-500 to-violet-500 bg-clip-text text-transparent">
            New Cover Letter
          </h1>
          <p className="mt-2 text-sm text-foreground/70">
            Upload your CV, add a job description or link, pick a style, and we’ll generate a draft you can edit.
          </p>

          <div className="mt-6">
            <CoverLetterWizard /> {/* Multi-step form */}
          </div>
        </div>
      </div>
    </div>
  );
}
