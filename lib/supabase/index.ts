export { createClient as createBrowserClient } from "@/lib/supabase/client";
export { createClient as createServerClient } from "@/lib/supabase/server";
export { createAdminClient } from "@/lib/supabase/admin";
export {
  updateSession,
  createMiddlewareClient,
} from "@/lib/supabase/middleware";
export { getAuthClaims, getAuthUser } from "@/lib/supabase/auth";
