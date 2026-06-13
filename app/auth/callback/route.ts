import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authRoutes } from "@/config/auth";

/**
 * OAuth and email confirmation callback handler.
 * Exchanges auth codes for a session and redirects to the dashboard.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? authRoutes.dashboard;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const safeNext =
        next.startsWith("/") && !next.startsWith("//") ? next : authRoutes.dashboard;
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}${authRoutes.login}?error=auth_callback_failed`);
}
