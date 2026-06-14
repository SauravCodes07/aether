import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js middleware — refreshes Supabase auth session on every matched request.
 * Required for cookie-based SSR auth to remain valid across navigations.
 *
 * Route protection:
 * - /dashboard, /workspace — require authenticated session
 * - /login, /signup — redirect to dashboard if already authenticated
 */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap, robots
     * - common static image extensions
     * - API routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
