import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/config/env";
import { createClient } from "@/lib/supabase/server";
import { getAuthClaims } from "@/lib/supabase/auth";

export type SessionInfo = {
  user: User | null;
  isAuthenticated: boolean;
  email: string | null;
};

/**
 * Returns the current user from the Auth server (authoritative for display).
 * Use in Server Components where user profile data is needed.
 */
export async function getSessionUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

/** Lightweight session check via JWT claims */
export async function getSessionInfo(): Promise<SessionInfo> {
  const { isAuthenticated } = await getAuthClaims();

  if (!isAuthenticated) {
    return { user: null, isAuthenticated: false, email: null };
  }

  const user = await getSessionUser();

  return {
    user,
    isAuthenticated: Boolean(user),
    email: user?.email ?? null,
  };
}
