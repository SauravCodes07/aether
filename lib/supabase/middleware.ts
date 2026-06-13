import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { handleAuthRedirects } from "@/lib/auth/middleware";
import { getSupabasePublicEnv, isSupabaseConfigured } from "@/config/env";
import { getSupabaseClientOptions } from "@/config/supabase";
import type { Database } from "@/types/database";

/**
 * Refreshes the Supabase auth session on each matched request.
 * Called from root middleware.ts — required for SSR auth to work correctly.
 *
 * Do not add logic between createServerClient and getClaims().
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const { url, anonKey } = getSupabasePublicEnv();

  const supabase = createServerClient<Database>(url, anonKey, {
    ...getSupabaseClientOptions(),
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([key, value]) => {
          supabaseResponse.headers.set(key, value);
        });
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims);

  return handleAuthRedirects(request, supabaseResponse, isAuthenticated);
}

/**
 * Creates a middleware-scoped Supabase client without refreshing the session.
 * Use only when you need Supabase access inside custom middleware logic
 * after updateSession() has already run.
 */
export function createMiddlewareClient(request: NextRequest): {
  supabase: ReturnType<typeof createServerClient<Database>>;
  response: NextResponse;
} {
  const { url, anonKey } = getSupabasePublicEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, anonKey, {
    ...getSupabaseClientOptions(),
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });

  return { supabase, response };
}
