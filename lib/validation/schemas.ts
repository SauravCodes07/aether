import { z } from "zod";

/**
 * Aether Zod Schemas — Phase 3
 * Absolute structural symmetry between backend DB constraints
 * and client-side form validation layers.
 * Compatible with zod v4.x API.
 */

/* ─── Auth Schemas ─────────────────────────────────────────────────── */

export const signInSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    email: z.string().min(1, "Email is required.").email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters.").max(128),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
export type SignUpInput = z.infer<typeof signUpSchema>;

export const magicLinkSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Enter a valid email address."),
});
export type MagicLinkInput = z.infer<typeof magicLinkSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Enter a valid email address."),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const updatePasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters.").max(128),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

/* ─── Profile Schemas ──────────────────────────────────────────────── */

export const profileUpdateSchema = z.object({
  display_name: z.string().max(100).nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
});
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

/* ─── Workspace Schemas ────────────────────────────────────────────── */

export const workspaceCreateSchema = z.object({
  name: z.string().min(1, "Workspace name is required.").max(100),
  slug: z
    .string()
    .min(1, "Slug is required.")
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens."),
  description: z.string().max(500).nullable().optional(),
});
export type WorkspaceCreateInput = z.infer<typeof workspaceCreateSchema>;

export const workspaceUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
});
export type WorkspaceUpdateInput = z.infer<typeof workspaceUpdateSchema>;

/* ─── Project Schemas ──────────────────────────────────────────────── */

export const projectCreateSchema = z.object({
  workspace_id: z.string().uuid(),
  name: z.string().min(1, "Project name is required.").max(200),
  slug: z
    .string()
    .min(1, "Slug is required.")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens."),
  description: z.string().max(1000).nullable().optional(),
  status: z.enum(["active", "archived", "deleted"]).default("active"),
});
export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;

export const projectUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  status: z.enum(["active", "archived", "deleted"]).optional(),
});
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;

/* ─── Workspace Member Schemas ─────────────────────────────────────── */

export const workspaceMemberAddSchema = z.object({
  workspace_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.enum(["owner", "admin", "member", "guest"]).default("member"),
});
export type WorkspaceMemberAddInput = z.infer<typeof workspaceMemberAddSchema>;

export const workspaceMemberUpdateSchema = z.object({
  role: z.enum(["owner", "admin", "member", "guest"]),
});
export type WorkspaceMemberUpdateInput = z.infer<typeof workspaceMemberUpdateSchema>;

/* ─── File Tree Schemas ────────────────────────────────────────────── */

export const fileNodeCreateSchema = z.object({
  name: z.string().min(1).max(255),
  parent_id: z.string().uuid().nullable().optional(),
  project_id: z.string().uuid(),
  type: z.enum(["file", "folder"]),
  content: z.string().optional(),
});
export type FileNodeCreateInput = z.infer<typeof fileNodeCreateSchema>;

export const fileNodeUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  content: z.string().optional(),
  parent_id: z.string().uuid().nullable().optional(),
});
export type FileNodeUpdateInput = z.infer<typeof fileNodeUpdateSchema>;

/* ─── Billing / Subscription Schemas ───────────────────────────────── */

export const subscriptionTierSchema = z.enum(["free", "pro", "team", "enterprise"]);
export type SubscriptionTier = z.infer<typeof subscriptionTierSchema>;

export const billingPlanLimitsSchema = z.object({
  maxWorkspaces: z.number().int().positive(),
  maxProjectsPerWorkspace: z.number().int().positive(),
  maxMembersPerWorkspace: z.number().int().positive(),
  maxFileStorageMb: z.number().int().positive(),
  maxAiGenerationsPerMonth: z.number().int().positive(),
  maxDeploymentsPerMonth: z.number().int().positive(),
  hasCustomDomain: z.boolean(),
  hasSso: z.boolean(),
  hasAuditLogs: z.boolean(),
  hasPrioritySupport: z.boolean(),
});
export type BillingPlanLimits = z.infer<typeof billingPlanLimitsSchema>;

/* ─── AI Copilot Schemas ───────────────────────────────────────────── */

export const aiChatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1),
});
export type AiChatMessage = z.infer<typeof aiChatMessageSchema>;

export const aiChatRequestSchema = z.object({
  messages: z.array(aiChatMessageSchema).min(1).max(50),
  project_id: z.string().uuid().optional(),
  workspace_id: z.string().uuid().optional(),
});
export type AiChatRequest = z.infer<typeof aiChatRequestSchema>;

/* ─── Deployment Schemas ───────────────────────────────────────────── */

export const deploymentCreateSchema = z.object({
  project_id: z.string().uuid(),
  branch: z.string().min(1).max(255),
  commit: z.string().min(7).max(40),
  message: z.string().max(500).optional(),
  environment: z.enum(["production", "preview", "development"]).default("preview"),
});
export type DeploymentCreateInput = z.infer<typeof deploymentCreateSchema>;

/* ─── Analytics / Telemetry Schemas ────────────────────────────────── */

export const telemetryEventSchema = z.object({
  event: z.string().min(1).max(200),
  category: z.enum([
    "page_view",
    "auth",
    "workspace",
    "project",
    "ai",
    "deployment",
    "collaboration",
    "billing",
    "canvas",
    "error",
  ]),
  properties: z.record(z.string(), z.unknown()).default({}),
  user_id: z.string().uuid().optional(),
  workspace_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
});
export type TelemetryEvent = z.infer<typeof telemetryEventSchema>;

/* ─── Canvas Schemas ───────────────────────────────────────────────── */

export const canvasNodeSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(["card", "note", "image", "embed", "connector"]),
  x: z.number().finite(),
  y: z.number().finite(),
  width: z.number().positive().default(300),
  height: z.number().positive().default(200),
  rotation: z.number().finite().default(0),
  content: z.record(z.string(), z.unknown()).default({}),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  zIndex: z.number().int().default(0),
  locked: z.boolean().default(false),
});
export type CanvasNode = z.infer<typeof canvasNodeSchema>;

export const canvasEdgeSchema = z.object({
  id: z.string().uuid().optional(),
  source_node_id: z.string().uuid(),
  target_node_id: z.string().uuid(),
  label: z.string().max(100).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  style: z.enum(["solid", "dashed", "dotted"]).default("solid"),
  animated: z.boolean().default(false),
});
export type CanvasEdge = z.infer<typeof canvasEdgeSchema>;

export const canvasViewportSchema = z.object({
  panX: z.number().finite().default(0),
  panY: z.number().finite().default(0),
  scale: z.number().positive().default(1),
});
export type CanvasViewport = z.infer<typeof canvasViewportSchema>;

/* ─── AI Tool Call Schema ──────────────────────────────────────────── */

export const aiToolCallSchema = z.object({
  tool: z.enum([
    "createProjectFile",
    "updateProjectFile",
    "deleteProjectFile",
    "createFolder",
    "renameFile",
    "moveFile",
    "createWorkspace",
    "updateWorkspace",
    "deleteWorkspace",
    "createProject",
    "updateProject",
    "searchFiles",
    "readFile",
    "deploy",
  ]),
  parameters: z.record(z.string(), z.unknown()),
});
export type AiToolCall = z.infer<typeof aiToolCallSchema>;

/* ─── Comment / Mention Schemas ────────────────────────────────────── */

export const commentCreateSchema = z.object({
  canvas_id: z.string().uuid(),
  content: z.string().min(1).max(2000),
  x: z.number().finite(),
  y: z.number().finite(),
  parent_id: z.string().uuid().nullable().optional(),
  mentions: z.array(z.string().uuid()).max(20).default([]),
});
export type CommentCreateInput = z.infer<typeof commentCreateSchema>;

/* ─── RBAC / Permission Schemas ────────────────────────────────────── */

export const rbacRoleSchema = z.enum(["owner", "admin", "member", "guest"]);
export type RbacRole = z.infer<typeof rbacRoleSchema>;

export const permissionCheckSchema = z.object({
  userId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  requiredRole: z.enum(["owner", "admin", "member", "guest"]),
  action: z.enum(["read", "write", "delete", "manage"]),
});
export type PermissionCheck = z.infer<typeof permissionCheckSchema>;