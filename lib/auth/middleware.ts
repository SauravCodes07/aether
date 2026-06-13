import { NextResponse, type NextRequest } from "next/server";
import { authRoutes } from "@/config/auth";
import {
  getLoginUrl,
  isGuestOnlyPath,
  isProtectedPath,
} from "@/lib/auth/routes";

/**
 * Applies route protection redirects after session refresh.
 * Preserves cookies from the session response on redirect responses.
 */
export function handleAuthRedirects(
  request: NextRequest,
  sessionResponse: NextResponse,
  isAuthenticated: boolean,
): NextResponse {
  const { pathname } = request.nextUrl;

  if (isProtectedPath(pathname) && !isAuthenticated) {
    const loginUrl = new URL(getLoginUrl(pathname), request.url);
    const redirectResponse = NextResponse.redirect(loginUrl);
    copyCookies(sessionResponse, redirectResponse);
    return redirectResponse;
  }

  if (isGuestOnlyPath(pathname) && isAuthenticated) {
    const dashboardUrl = new URL(authRoutes.dashboard, request.url);
    const redirectResponse = NextResponse.redirect(dashboardUrl);
    copyCookies(sessionResponse, redirectResponse);
    return redirectResponse;
  }

  return sessionResponse;
}

function copyCookies(source: NextResponse, target: NextResponse): void {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie.name, cookie.value);
  });
}
