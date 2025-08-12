"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function SocialButtons() {
  async function signIn(provider: "google" | "linkedin_oidc") {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/Dashboard`, // after Supabase callback
      },
    });
  }

  return (
    <div className="grid gap-2">
      <Button type="button" variant="outline" onClick={() => signIn("google")}>
        Continue with Google
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => signIn("linkedin_oidc")}
      >
        Continue with LinkedIn
      </Button>
    </div>
  );
}
