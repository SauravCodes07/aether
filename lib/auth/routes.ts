import {
  authRoutes,
  guestOnlyRoutes,
  protectedRoutes,
} from "@/config/auth";

export { authRoutes };

export function isProtectedPath(pathname: string): boolean {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isGuestOnlyPath(pathname: string): boolean {
  return guestOnlyRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function getLoginUrl(redirectTo?: string): string {
  if (!redirectTo || redirectTo === authRoutes.login) {
    return authRoutes.login;
  }
  return `${authRoutes.login}?redirectTo=${encodeURIComponent(redirectTo)}`;
}
