import type { AetherModule } from "@/lib/design-tokens";

export type { AetherModule };

export type TypographyScale =
  | "heading-xl"
  | "heading-lg"
  | "heading-md"
  | "heading-sm"
  | "body-lg"
  | "body-md"
  | "body-sm"
  | "label-sm"
  | "caption"
  | "code-sm";

export type GlassVariant =
  | "glass"
  | "glass-strong"
  | "glass-subtle"
  | "glass-panel"
  | "glass-floating";

export type ShadowScale =
  | "shadow-aether-xs"
  | "shadow-aether-sm"
  | "shadow-aether-md"
  | "shadow-aether-lg"
  | "shadow-aether-xl"
  | "shadow-aether-navbar";

export type StatusVariant = "success" | "warning" | "error" | "info";

export type ModuleTheme = {
  id: AetherModule;
  label: string;
  accentClass: string;
  subtleClass: string;
};

export const moduleThemes: Record<AetherModule, ModuleTheme> = {
  dashboard: {
    id: "dashboard",
    label: "Dashboard",
    accentClass: "text-aether-module-dashboard",
    subtleClass: "bg-aether-module-dashboard-subtle",
  },
  auth: {
    id: "auth",
    label: "Authentication",
    accentClass: "text-aether-module-auth",
    subtleClass: "bg-aether-module-auth-subtle",
  },
  handTracking: {
    id: "handTracking",
    label: "Hand Tracking",
    accentClass: "text-aether-module-tracking",
    subtleClass: "bg-aether-module-tracking-subtle",
  },
  aiAssistant: {
    id: "aiAssistant",
    label: "AI Assistant",
    accentClass: "text-aether-module-ai",
    subtleClass: "bg-aether-module-ai-subtle",
  },
  workspace3d: {
    id: "workspace3d",
    label: "3D Workspace",
    accentClass: "text-aether-module-workspace",
    subtleClass: "bg-aether-module-workspace-subtle",
  },
};
