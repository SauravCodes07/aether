import type { AuthClaims } from "@/types/supabase";
import { createClient } from "@/lib/supabase/server";

export type AuthSessionResult = {
  claims: AuthClaims | null;
  isAuthenticated: boolean;
};

/**
 * Validates the current session via JWT claims (server-side).
 * Preferred for route protection — faster than getUser(), cryptographically verified.
 */
export async function getAuthClaims(): Promise<AuthSessionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    return { claims: null, isAuthenticated: false };
  }

  return {
    claims: data.claims as AuthClaims,
    isAuthenticated: true,
  };
}

/**
 * Authoritative user lookup from the Auth server.
 * Use for sensitive operations (payments, role changes) — not for every page load.
 */
export async function getAuthUser() {
  const supabase = await createClient();
  return supabase.auth.getUser();
}
