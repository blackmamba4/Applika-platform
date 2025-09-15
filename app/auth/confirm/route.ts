import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server"; // SSR client that reads/writes cookies

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard"; // where you want to land after login

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/error?m=missing_oauth_code`);
  }

  const supabase = createClient();
  const { error } = await (await supabase).auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/auth/error?m=${encodeURIComponent(error.message)}`);
  }

  // session cookie is now set
  return NextResponse.redirect(`${origin}${next}`);
}
