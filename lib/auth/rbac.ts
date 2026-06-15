import { createClient } from "@/lib/supabase/server";
import type { RbacRole } from "@/lib/validation/schemas";

type RbacCheckResult =
  | { allowed: true; role: RbacRole }
  | { allowed: false; reason: string };

/**
 * Phase 12: Enterprise & Launch Readiness — RBAC Matrix.
 *
 * Hierarchical token roles: Owner > Admin > Member > Guest
 * Checks permissions across all critical API gateways.
 */

const ROLE_HIERARCHY: Record<RbacRole, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  guest: 1,
};

/**
 * Checks if a user has the required role (or higher) in a workspace.
 * Returns the user's actual role if authorized, or a rejection reason.
 */
export async function checkWorkspacePermission(
  userId: string,
  workspaceId: string,
  requiredRole: RbacRole,
): Promise<RbacCheckResult> {
  try {
    const supabase = await createClient();

    const { data: membership, error } = await supabase
      .from("workspace_members" as never)
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .single();

    if (error || !membership) {
      return { allowed: false, reason: "User is not a member of this workspace." };
    }

    const userRole = (membership as { role: RbacRole }).role;
    const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 0;

    if (userLevel < requiredLevel) {
      return {
        allowed: false,
        reason: `Requires ${requiredRole} role. Current role: ${userRole}.`,
      };
    }

    return { allowed: true, role: userRole };
  } catch {
    return { allowed: false, reason: "Failed to verify workspace permissions." };
  }
}

/**
 * Checks if a user is the workspace owner.
 */
export async function isWorkspaceOwner(
  userId: string,
  workspaceId: string,
): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { data: workspace } = await supabase
      .from("workspaces" as never)
      .select("owner_id")
      .eq("id", workspaceId)
      .single();

    return (workspace as { owner_id: string } | null)?.owner_id === userId;
  } catch {
    return false;
  }
}

/**
 * Checks if a user can perform an action on a resource.
 * Maps CRUD actions to required minimum roles.
 */
export async function checkResourcePermission(
  userId: string,
  workspaceId: string,
  action: "read" | "write" | "delete" | "manage",
): Promise<RbacCheckResult> {
  const actionRoleMap: Record<string, RbacRole> = {
    read: "guest",
    write: "member",
    delete: "admin",
    manage: "owner",
  };

  const requiredRole = actionRoleMap[action] ?? "admin";
  return checkWorkspacePermission(userId, workspaceId, requiredRole);
}

/**
 * Middleware-style permission guard for API routes.
 * Usage:
 *   const perm = await requirePermission(user.id, workspaceId, "admin");
 *   if (!perm.allowed) return NextResponse.json({ error: perm.reason }, { status: 403 });
 */
export async function requirePermission(
  userId: string,
  workspaceId: string,
  requiredRole: RbacRole,
): Promise<RbacCheckResult> {
  return checkWorkspacePermission(userId, workspaceId, requiredRole);
}

/**
 * Returns the current user's role in a workspace.
 */
export async function getUserWorkspaceRole(
  userId: string,
  workspaceId: string,
): Promise<RbacRole | null> {
  try {
    const supabase = await createClient();

    const { data: membership } = await supabase
      .from("workspace_members" as never)
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .single();

    return (membership as { role: RbacRole } | null)?.role ?? null;
  } catch {
    return null;
  }
}

/**
 * Returns all workspaces a user belongs to, with their role.
 */
export async function getUserWorkspaces(
  userId: string,
): Promise<{ workspaceId: string; role: RbacRole; name: string }[]> {
  try {
    const supabase = await createClient();

    const { data: memberships } = await supabase
      .from("workspace_members" as never)
      .select("workspace_id, role")
      .eq("user_id", userId);

    if (!memberships || !Array.isArray(memberships)) return [];

    const results: { workspaceId: string; role: RbacRole; name: string }[] = [];

    for (const m of memberships) {
      const member = m as { workspace_id: string; role: RbacRole };
      const { data: ws } = await supabase
        .from("workspaces" as never)
        .select("name")
        .eq("id", member.workspace_id)
        .single();

      results.push({
        workspaceId: member.workspace_id,
        role: member.role,
        name: (ws as { name: string } | null)?.name ?? "Unknown",
      });
    }

    return results;
  } catch {
    return [];
  }
}