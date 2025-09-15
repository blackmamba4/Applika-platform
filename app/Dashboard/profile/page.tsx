import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfilePageClient from "@/components/ProfilePageClient";

export default async function ProfilePage() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect("/auth/login");
  }

  // Get user profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, full_name, desired_role, tone_default, locale")
    .eq("id", user.id)
    .single();

  // Get cover letter count for stats
  const { count: coverLetterCount } = await supabase
    .from("cover_letters")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <ProfilePageClient 
      user={{
        email: user.email,
        name: profile?.full_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || null,
        avatarUrl: null
      }}
      profileData={profile}
      coverLetterCount={coverLetterCount || 0}
    />
  );
}
