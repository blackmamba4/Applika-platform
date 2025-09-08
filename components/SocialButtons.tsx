"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function SocialButtons() {
  const supabase = createClient();
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : undefined;

  async function signIn(provider: "google" | "linkedin_oidc") {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo, // IMPORTANT: goes to /auth/callback, not /Dashboard
        // LinkedIn tip:
        // scopes: provider === "linkedin_oidc" ? "openid profile email" : undefined,
      },
    });
  }

  return (
    <div className="grid gap-2">
      <Button type="button" variant="outline" onClick={() => signIn("google")}>
        Continue with Google
      </Button>
      <Button type="button" variant="outline" onClick={() => signIn("linkedin_oidc")}>
        Continue with LinkedIn
      </Button>
    </div>
  );
}