export const authRoutes = {
  login: "/login",
  signup: "/signup",
  dashboard: "/dashboard",
  callback: "/auth/callback",
  home: "/",
} as const;

/** Routes that require an authenticated session */
export const protectedRoutes = [authRoutes.dashboard] as const;

/** Routes only for unauthenticated users (redirect to dashboard if signed in) */
export const guestOnlyRoutes = [authRoutes.login, authRoutes.signup] as const;

export type AuthRoute = (typeof authRoutes)[keyof typeof authRoutes];
