import "server-only";

import { createClient } from "@supabase/supabase-js";
import { EnvValidationError, getSupabaseServerEnv } from "@/config/env";
import { getSupabaseAdminClientOptions } from "@/config/supabase";
import type { Database } from "@/types/database";
import type { TypedSupabaseClient } from "@/types/supabase";

/**
 * Service-role Supabase client — bypasses Row Level Security.
 *
 * Use only in trusted server contexts:
 * - Admin operations
 * - Background jobs
 * - Webhook handlers
 *
 * Never import this file in Client Components.
 */
export function createAdminClient(): TypedSupabaseClient {
  const { url, serviceRoleKey } = getSupabaseServerEnv();

  if (!serviceRoleKey) {
    throw new EnvValidationError(
      "SUPABASE_SERVICE_ROLE_KEY",
      "Set SUPABASE_SERVICE_ROLE_KEY in .env.local for admin operations. Never expose this key to the client.",
    );
  }

  return createClient<Database>(url, serviceRoleKey, getSupabaseAdminClientOptions());
}
