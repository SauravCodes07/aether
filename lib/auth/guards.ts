import { redirect } from "next/navigation";
import { authRoutes } from "@/config/auth";
import { getLoginUrl } from "@/lib/auth/routes";
import { getAuthClaims } from "@/lib/supabase/auth";
import { getSessionUser } from "@/lib/auth/session";
import type { AuthClaims } from "@/types/supabase";
import type { User } from "@supabase/supabase-js";

/**
 * Server-side guard for protected routes.
 * Redirects unauthenticated users to login.
 */
export async function requireAuth(redirectTo?: string): Promise<{
  claims: AuthClaims;
  user: User;
}> {
  const { isAuthenticated, claims } = await getAuthClaims();

  if (!isAuthenticated || !claims) {
    redirect(getLoginUrl(redirectTo ?? authRoutes.dashboard));
  }

  const user = await getSessionUser();

  if (!user) {
    redirect(getLoginUrl(redirectTo ?? authRoutes.dashboard));
  }

  return { claims, user };
}

/**
 * Server-side guard for guest-only routes (login, signup).
 * Redirects authenticated users to the dashboard.
 */
export async function requireGuest(): Promise<void> {
  const { isAuthenticated } = await getAuthClaims();

  if (isAuthenticated) {
    redirect(authRoutes.dashboard);
  }
}
