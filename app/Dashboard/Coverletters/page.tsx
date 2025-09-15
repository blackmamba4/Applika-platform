import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CoverLettersPageClient from "../../../components/CoverLettersPageClient";

export default async function CoverLettersPage() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect("/auth/login");
  }

  // Get total count for pagination
  const { count: totalCount } = await supabase
    .from("cover_letters")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Get first page of cover letters
  const { data: coverLetters } = await supabase
    .from("cover_letters")
    .select("id, title, company, created_at, updated_at, meta")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(20);

  return (
    <CoverLettersPageClient 
      initialCoverLetters={coverLetters || []}
      totalCount={totalCount || 0}
    />
  );
}
