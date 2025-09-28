import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!hasEnvVars) return supabaseResponse;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // prefer the standard name, fall back to your custom one if present
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    }
  );

  // ⚠️ do not insert logic between client creation and getUser()
  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const method = request.method;

  // ----- allowlist public & auth infra -----
  const isPublicPath =
    path === "/" ||
    path.startsWith("/_next") ||
    path.startsWith("/favicon") ||
    path.startsWith("/auth/callback") ||
    path.startsWith("/auth/error") ||
    path.startsWith("/auth/confirm") ||
    path === "/privacy" ||
    path === "/terms" ||
    path === "/pricing";

  // our delete API must be reachable even when not logged in (it will 401 itself)
  const isAllowedApi =
    path === "/api/account/delete" ||
    // allow CORS preflight generically
    method === "OPTIONS";

  // Don’t ever redirect non-GET requests (POST/PUT/PATCH/DELETE) — let routes handle auth
  const isNavigation = method === "GET";

  if (!user && !isPublicPath && !path.startsWith("/auth") && !path.startsWith("/login")) {
    if (!isNavigation || isAllowedApi) {
      // let API/POST continue; the handler will return 401 if needed
      return supabaseResponse;
    }
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
