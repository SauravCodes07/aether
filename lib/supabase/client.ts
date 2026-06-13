import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/config/env";
import { getSupabaseClientOptions } from "@/config/supabase";
import type { Database } from "@/types/database";
import type { TypedSupabaseClient } from "@/types/supabase";

/**
 * Browser Supabase client for Client Components.
 * Uses a singleton — safe to call multiple times in the browser.
 *
 * Use for: realtime subscriptions, client-side storage uploads, CSR auth flows.
 */
export function createClient(): TypedSupabaseClient {
  const { url, anonKey } = getSupabasePublicEnv();

  return createBrowserClient<Database>(url, anonKey, getSupabaseClientOptions());
}
