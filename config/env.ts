/**
 * Environment variable validation for Aether.
 * Validates lazily at runtime — never at module import — so builds succeed without .env.local.
 */

export class EnvValidationError extends Error {
  constructor(
    public readonly variable: string,
    message?: string,
  ) {
    super(message ?? `Missing required environment variable: ${variable}`);
    this.name = "EnvValidationError";
  }
}

export type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

export type SupabaseServerEnv = SupabasePublicEnv & {
  serviceRoleKey?: string;
};

const SUPABASE_URL_KEY = "NEXT_PUBLIC_SUPABASE_URL";
const SUPABASE_ANON_KEY = "NEXT_PUBLIC_SUPABASE_ANON_KEY";
const SUPABASE_PUBLISHABLE_KEY = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";
const SUPABASE_SERVICE_ROLE_KEY = "SUPABASE_SERVICE_ROLE_KEY";

function readEnv(value: string | undefined): string | undefined {
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

/** Returns true when the minimum public Supabase env vars are present. */
export function isSupabaseConfigured(): boolean {
  const url = readEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key =
    readEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ?? readEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  return Boolean(url && key);
}

/**
 * Validates and returns public Supabase credentials.
 * Accepts legacy anon key or new publishable key naming.
 */
export function getSupabasePublicEnv(): SupabasePublicEnv {
  const url = readEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey =
    readEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ?? readEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  if (!url) {
    throw new EnvValidationError(
      SUPABASE_URL_KEY,
      `Set ${SUPABASE_URL_KEY} in .env.local. Find it in Supabase Dashboard → Project Settings → API.`,
    );
  }

  if (!anonKey) {
    throw new EnvValidationError(
      SUPABASE_ANON_KEY,
      `Set ${SUPABASE_ANON_KEY} in .env.local. Use the anon (legacy) or publishable key from your Supabase project.`,
    );
  }

  return { url, anonKey };
}

/**
 * Validates public credentials plus optional service-role key for admin operations.
 * Service role bypasses RLS — use only in trusted server contexts.
 */
export function getSupabaseServerEnv(): SupabaseServerEnv {
  const publicEnv = getSupabasePublicEnv();
  const serviceRoleKey = readEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return {
    ...publicEnv,
    ...(serviceRoleKey ? { serviceRoleKey } : {}),
  };
}
