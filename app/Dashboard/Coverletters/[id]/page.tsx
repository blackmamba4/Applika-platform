import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditorCanvas from "./EditorCanvas";

export default async function Page({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect("/auth/login");

  const { id } = params;

  return (
    <div className="min-h-screen px-4 ">
      <div className="mx-auto w-full max-w-8xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/Dashboard"
            className="inline-flex items-center gap-2 rounded-full border bg-white/80 backdrop-blur px-4 py-1.5 shadow hover:shadow-md hover:scale-[1.02] transition text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>

        <div className="rounded-3xl bg-white/80 backdrop-blur-lg shadow-2xl p-6 md:p-8 border border-white/60">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-emerald-500 to-violet-500 bg-clip-text text-transparent">
            Edit Cover Letter
          </h1>
          <p className="mt-2 text-sm text-foreground/70">
            Tweak your draft, adjust styling, and export when you’re happy.
          </p>

          <div className="mt-6">
            <EditorCanvas id={id} />
          </div>
        </div>
      </div>
    </div>
  );
}