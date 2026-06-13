export type { AuthActionState } from "./auth";
export { initialAuthActionState } from "./auth";
export type {
  AetherModule,
  GlassVariant,
  ModuleTheme,
  ShadowScale,
  StatusVariant,
  TypographyScale,
} from "./design-system";
export { moduleThemes } from "./design-system";

export type { Database, Json, Tables, InsertTables, UpdateTables } from "./database";
export type { TypedSupabaseClient, AuthClaims } from "./supabase";

export type NavItem = {
  label: string;
  href: string;
};

export type FooterLinkGroup = {
  title: string;
  links: NavItem[];
};

export type IntegrationStatus = "ready" | "planned" | "beta";

export type Integration = {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
};
