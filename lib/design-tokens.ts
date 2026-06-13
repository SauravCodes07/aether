/**
 * Programmatic access to Aether design tokens.
 * Use in Three.js scenes, canvas rendering, charts, and runtime theming.
 * CSS remains the source of truth — values mirror styles/tokens.css.
 */

export const colors = {
  bg: "#070708",
  bgElevated: "#0e0e10",
  surface: "#141416",
  surfaceHover: "#1a1a1e",
  surfaceActive: "#27272a",
  text: "#f4f4f5",
  textMuted: "#a1a1aa",
  textSubtle: "#71717a",
  accent: "#8b5cf6",
  accentLight: "#a78bfa",
  cyan: "#22d3ee",
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
} as const;

export const radii = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  full: "9999px",
} as const;

export const shadows = {
  xs: "0 1px 2px rgba(0, 0, 0, 0.4)",
  sm: "0 2px 8px rgba(0, 0, 0, 0.35)",
  md: "0 4px 16px rgba(0, 0, 0, 0.4)",
  lg: "0 8px 32px rgba(0, 0, 0, 0.45)",
  xl: "0 16px 48px rgba(0, 0, 0, 0.5)",
  glowAccent: "0 0 40px rgba(139, 92, 246, 0.35)",
  glowCyan: "0 0 30px rgba(34, 211, 238, 0.2)",
} as const;

export const typography = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "4xl": "2.25rem",
  "5xl": "3rem",
  "6xl": "3.75rem",
} as const;

export const spacing = {
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  28: "7rem",
  32: "8rem",
} as const;

export const modules = {
  dashboard: {
    accent: colors.accent,
    accentCss: "var(--aether-module-dashboard)",
    subtleCss: "var(--aether-module-dashboard-subtle)",
  },
  auth: {
    accent: colors.textMuted,
    accentCss: "var(--aether-module-auth)",
    subtleCss: "var(--aether-module-auth-subtle)",
  },
  handTracking: {
    accent: colors.cyan,
    accentCss: "var(--aether-module-tracking)",
    subtleCss: "var(--aether-module-tracking-subtle)",
  },
  aiAssistant: {
    accent: colors.accentLight,
    accentCss: "var(--aether-module-ai)",
    subtleCss: "var(--aether-module-ai-subtle)",
  },
  workspace3d: {
    accent: colors.accent,
    accentCss: "var(--aether-module-workspace)",
    subtleCss: "var(--aether-module-workspace-subtle)",
  },
} as const;

export type AetherModule = keyof typeof modules;

/** Resolve a CSS custom property at runtime (client-only). */
export function getCssVar(name: string, fallback = ""): string {
  if (typeof window === "undefined") return fallback;
  return (
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
    fallback
  );
}
