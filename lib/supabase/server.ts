import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicEnv } from "@/config/env";
import { getSupabaseClientOptions } from "@/config/supabase";
import type { Database } from "@/types/database";
import type { TypedSupabaseClient } from "@/types/supabase";

/**
 * Server Supabase client for Server Components, Server Actions, and Route Handlers.
 * Creates a new instance per request with request-scoped cookies.
 *
 * Cookie writes may fail in Server Components — middleware handles session refresh.
 */
export async function createClient(): Promise<TypedSupabaseClient> {
  const { url, anonKey } = getSupabasePublicEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    ...getSupabaseClientOptions(),
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies.
          // Session refresh is handled by middleware via updateSession().
        }
      },
    },
  });
}
