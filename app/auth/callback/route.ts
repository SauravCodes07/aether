import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /auth/callback
 *
 * Supabase OAuth / Magic Link callback handler.
 * Exchanges the `code` query parameter for a session and redirects to dashboard.
 * Supports: Google, GitHub, Magic Link, and Reset Password flows.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirect_to");
  const type = requestUrl.searchParams.get("type");

  if (code) {
    try {
      const supabase = await createClient();

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("[auth/callback] Code exchange failed:", error.message);
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin),
        );
      }

      // If this is a password reset flow, go to reset confirmation
      if (type === "recovery") {
        return NextResponse.redirect(
          new URL("/auth/reset/confirm", requestUrl.origin),
        );
      }

      // Redirect to the intended destination or dashboard
      const targetPath = redirectTo && redirectTo.startsWith("/")
        ? redirectTo
        : "/dashboard";

      return NextResponse.redirect(new URL(targetPath, requestUrl.origin));
    } catch (err) {
      console.error("[auth/callback] Unexpected error:", err);
      return NextResponse.redirect(
        new URL("/login?error=An unexpected error occurred", requestUrl.origin),
      );
    }
  }

  // No code present — redirect to login
  return NextResponse.redirect(
    new URL("/login?error=No auth code provided", requestUrl.origin),
  );
}