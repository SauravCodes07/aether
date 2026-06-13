import type { SupabaseClientOptions } from "@supabase/supabase-js";

/**
 * Typed Supabase configuration for Aether.
 * Centralizes auth, storage, and realtime defaults for future modules.
 */

export const supabaseConfig = {
  auth: {
    /** Flow type for future email/OAuth sign-in */
    flowType: "pkce" as const,
    /** Auto-refresh is handled by middleware on the server; browser client enables it for CSR */
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },

  /** Reserved storage bucket names for future file uploads */
  storage: {
    buckets: {
      avatars: "avatars",
      projects: "projects",
      assets: "assets",
      exports: "exports",
    } as const,
  },

  /** Realtime channel prefixes for future collaboration features */
  realtime: {
    channelPrefixes: {
      workspace: "workspace",
      presence: "presence",
      cursor: "cursor",
      ai: "ai",
    } as const,
  },

  /**
   * Future RLS policy namespaces.
   * Policies will be defined in Supabase SQL migrations; these keys document intent.
   */
  rls: {
    tables: {
      profiles: "profiles",
      projects: "projects",
      workspaces: "workspaces",
      assets: "assets",
      collaborations: "collaborations",
    } as const,
  },
} as const;

export type StorageBucket =
  (typeof supabaseConfig.storage.buckets)[keyof typeof supabaseConfig.storage.buckets];

export type RealtimeChannelPrefix =
  (typeof supabaseConfig.realtime.channelPrefixes)[keyof typeof supabaseConfig.realtime.channelPrefixes];

/** Shared client options for browser and server Supabase clients */
export function getSupabaseClientOptions(): SupabaseClientOptions<"public"> {
  return {
    auth: {
      flowType: supabaseConfig.auth.flowType,
      autoRefreshToken: supabaseConfig.auth.autoRefreshToken,
      persistSession: supabaseConfig.auth.persistSession,
      detectSessionInUrl: supabaseConfig.auth.detectSessionInUrl,
    },
    db: {
      schema: "public",
    },
    global: {
      headers: {
        "x-aether-client": "aether-web",
      },
    },
  };
}

/** Admin client options — no session persistence, server-only */
export function getSupabaseAdminClientOptions(): SupabaseClientOptions<"public"> {
  return {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: "public",
    },
    global: {
      headers: {
        "x-aether-client": "aether-admin",
      },
    },
  };
}
