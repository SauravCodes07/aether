/**
 * Supabase Database types.
 *
 * Replace this placeholder after creating tables by running:
 *   npx supabase gen types typescript --project-id <project-id> > types/database.ts
 *
 * Or with a linked local project:
 *   npx supabase gen types typescript --local > types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

/** Helper to extract row types once tables are generated */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T] extends { Row: infer R } ? R : never;

export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T] extends { Insert: infer I } ? I : never;

export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T] extends { Update: infer U } ? U : never;
