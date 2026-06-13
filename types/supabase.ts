import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/** Typed Supabase client bound to the Aether database schema */
export type TypedSupabaseClient = SupabaseClient<Database>;

/** JWT claims returned by supabase.auth.getClaims() */
export type AuthClaims = {
  sub?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
};
