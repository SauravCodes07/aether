import { describe, it, expect } from "vitest";
import {
  signInSchema,
  signUpSchema,
  magicLinkSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  profileUpdateSchema,
  workspaceCreateSchema,
  workspaceUpdateSchema,
  projectCreateSchema,
  projectUpdateSchema,
  workspaceMemberAddSchema,
  workspaceMemberUpdateSchema,
  fileNodeCreateSchema,
  fileNodeUpdateSchema,
  subscriptionTierSchema,
  billingPlanLimitsSchema,
  aiChatMessageSchema,
  aiChatRequestSchema,
  deploymentCreateSchema,
  telemetryEventSchema,
  canvasNodeSchema,
  canvasEdgeSchema,
  canvasViewportSchema,
  commentCreateSchema,
  permissionCheckSchema,
} from "@/lib/validation/schemas";

describe("Auth Schemas", () => {
  describe("signInSchema", () => {
    it("accepts valid email and password", () => {
      const result = signInSchema.safeParse({
        email: "test@example.com",
        password: "secret123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing email", () => {
      const result = signInSchema.safeParse({
        email: "",
        password: "secret123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid email format", () => {
      const result = signInSchema.safeParse({
        email: "not-an-email",
        password: "secret123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing password", () => {
      const result = signInSchema.safeParse({
        email: "test@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("signUpSchema", () => {
    it("accepts valid signup data", () => {
      const result = signUpSchema.safeParse({
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects mismatched passwords", () => {
      const result = signUpSchema.safeParse({
        email: "test@example.com",
        password: "password123",
        confirmPassword: "different",
      });
      expect(result.success).toBe(false);
    });

    it("rejects passwords shorter than 8 chars", () => {
      const result = signUpSchema.safeParse({
        email: "test@example.com",
        password: "short",
        confirmPassword: "short",
      });
      expect(result.success).toBe(false);
    });

    it("rejects passwords longer than 128 chars", () => {
      const result = signUpSchema.safeParse({
        email: "test@example.com",
        password: "a".repeat(129),
        confirmPassword: "a".repeat(129),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("magicLinkSchema", () => {
    it("accepts valid email", () => {
      const result = magicLinkSchema.safeParse({
        email: "test@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty email", () => {
      const result = magicLinkSchema.safeParse({ email: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("resetPasswordSchema", () => {
    it("accepts valid email", () => {
      const result = resetPasswordSchema.safeParse({
        email: "user@domain.com",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = resetPasswordSchema.safeParse({
        email: "not-valid",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updatePasswordSchema", () => {
    it("accepts matching valid passwords", () => {
      const result = updatePasswordSchema.safeParse({
        password: "newpass123",
        confirmPassword: "newpass123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects mismatched passwords", () => {
      const result = updatePasswordSchema.safeParse({
        password: "newpass123",
        confirmPassword: "different",
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("Profile Schema", () => {
  it("accepts partial updates", () => {
    const result = profileUpdateSchema.safeParse({
      display_name: "Jane Doe",
    });
    expect(result.success).toBe(true);
  });

  it("accepts null values for nullable fields", () => {
    const result = profileUpdateSchema.safeParse({
      bio: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects display_name longer than 100 chars", () => {
    const result = profileUpdateSchema.safeParse({
      display_name: "a".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-url avatar", () => {
    const result = profileUpdateSchema.safeParse({
      avatar_url: "not-a-url",
    });
    expect(result.success).toBe(false);
  });
});

describe("Workspace Schemas", () => {
  describe("workspaceCreateSchema", () => {
    it("accepts valid workspace data", () => {
      const result = workspaceCreateSchema.safeParse({
        name: "My Workspace",
        slug: "my-workspace",
      });
      expect(result.success).toBe(true);
    });

    it("allows optional description", () => {
      const result = workspaceCreateSchema.safeParse({
        name: "Team Space",
        slug: "team-space",
        description: "A team workspace",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid slug with spaces", () => {
      const result = workspaceCreateSchema.safeParse({
        name: "Bad Slug",
        slug: "bad slug",
      });
      expect(result.success).toBe(false);
    });

    it("rejects slug with uppercase letters", () => {
      const result = workspaceCreateSchema.safeParse({
        name: "Upper",
        slug: "Upper-Case",
      });
      expect(result.success).toBe(false);
    });

    it("accepts slug with numbers and hyphens", () => {
      const result = workspaceCreateSchema.safeParse({
        name: "Dev",
        slug: "dev-team-2024",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("workspaceUpdateSchema", () => {
    it("accepts partial updates", () => {
      const result = workspaceUpdateSchema.safeParse({
        name: "Updated Name",
      });
      expect(result.success).toBe(true);
    });

    it("accepts empty object (no changes)", () => {
      const result = workspaceUpdateSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});

describe("Project Schemas", () => {
  const validUUID = "550e8400-e29b-41d4-a716-446655440000";

  it("accepts valid project data", () => {
    const result = projectCreateSchema.safeParse({
      workspace_id: validUUID,
      name: "My Project",
      slug: "my-project",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-UUID workspace_id", () => {
    const result = projectCreateSchema.safeParse({
      workspace_id: "not-a-uuid",
      name: "Test",
      slug: "test",
    });
    expect(result.success).toBe(false);
  });

  it("defaults status to active", () => {
    const result = projectCreateSchema.safeParse({
      workspace_id: validUUID,
      name: "Test",
      slug: "test",
    });
    if (result.success) {
      expect(result.data.status).toBe("active");
    }
  });

  it("accepts status override", () => {
    const result = projectCreateSchema.safeParse({
      workspace_id: validUUID,
      name: "Test",
      slug: "test",
      status: "archived",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("archived");
    }
  });
});

describe("Workspace Member Schemas", () => {
  const validUUID = "550e8400-e29b-41d4-a716-446655440000";

  it("accepts valid member add data", () => {
    const result = workspaceMemberAddSchema.safeParse({
      workspace_id: validUUID,
      user_id: validUUID,
    });
    expect(result.success).toBe(true);
  });

  it("defaults role to member", () => {
    const result = workspaceMemberAddSchema.safeParse({
      workspace_id: validUUID,
      user_id: validUUID,
    });
    if (result.success) {
      expect(result.data.role).toBe("member");
    }
  });

  it("accepts role override", () => {
    const result = workspaceMemberAddSchema.safeParse({
      workspace_id: validUUID,
      user_id: validUUID,
      role: "admin",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid role", () => {
    const result = workspaceMemberAddSchema.safeParse({
      workspace_id: validUUID,
      user_id: validUUID,
      role: "superadmin",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid role update", () => {
    const result = workspaceMemberUpdateSchema.safeParse({ role: "owner" });
    expect(result.success).toBe(true);
  });
});

describe("File Node Schemas", () => {
  const validUUID = "550e8400-e29b-41d4-a716-446655440000";

  it("accepts valid file node", () => {
    const result = fileNodeCreateSchema.safeParse({
      name: "index.ts",
      project_id: validUUID,
      type: "file",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid folder node", () => {
    const result = fileNodeCreateSchema.safeParse({
      name: "src",
      project_id: validUUID,
      type: "folder",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid type", () => {
    const result = fileNodeCreateSchema.safeParse({
      name: "test",
      project_id: validUUID,
      type: "symlink",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional parent_id", () => {
    const result = fileNodeCreateSchema.safeParse({
      name: "child.ts",
      project_id: validUUID,
      type: "file",
      parent_id: validUUID,
    });
    expect(result.success).toBe(true);
  });

  it("accepts partial file update", () => {
    const result = fileNodeUpdateSchema.safeParse({
      name: "renamed.ts",
    });
    expect(result.success).toBe(true);
  });
});

describe("Subscription Tier Schema", () => {
  it("accepts valid tiers", () => {
    expect(subscriptionTierSchema.safeParse("free").success).toBe(true);
    expect(subscriptionTierSchema.safeParse("pro").success).toBe(true);
    expect(subscriptionTierSchema.safeParse("team").success).toBe(true);
    expect(subscriptionTierSchema.safeParse("enterprise").success).toBe(true);
  });

  it("rejects invalid tier", () => {
    expect(subscriptionTierSchema.safeParse("ultimate").success).toBe(false);
  });
});

describe("Billing Plan Limits Schema", () => {
  it("accepts valid limits", () => {
    const result = billingPlanLimitsSchema.safeParse({
      maxWorkspaces: 5,
      maxProjectsPerWorkspace: 10,
      maxMembersPerWorkspace: 20,
      maxFileStorageMb: 1024,
      maxAiGenerationsPerMonth: 500,
      maxDeploymentsPerMonth: 50,
      hasCustomDomain: false,
      hasSso: false,
      hasAuditLogs: true,
      hasPrioritySupport: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative numbers", () => {
    const result = billingPlanLimitsSchema.safeParse({
      maxWorkspaces: -1,
      maxProjectsPerWorkspace: 10,
      maxMembersPerWorkspace: 20,
      maxFileStorageMb: 1024,
      maxAiGenerationsPerMonth: 500,
      maxDeploymentsPerMonth: 50,
      hasCustomDomain: false,
      hasSso: false,
      hasAuditLogs: true,
      hasPrioritySupport: false,
    });
    expect(result.success).toBe(false);
  });
});

describe("AI Chat Schemas", () => {
  it("accepts valid messages", () => {
    const result = aiChatRequestSchema.safeParse({
      messages: [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there!" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty messages array", () => {
    const result = aiChatRequestSchema.safeParse({ messages: [] });
    expect(result.success).toBe(false);
  });

  it("rejects invalid role", () => {
    const result = aiChatMessageSchema.safeParse({
      role: "bot",
      content: "Hello",
    });
    expect(result.success).toBe(false);
  });
});

describe("Deployment Schema", () => {
  const validUUID = "550e8400-e29b-41d4-a716-446655440000";

  it("accepts valid deployment data", () => {
    const result = deploymentCreateSchema.safeParse({
      project_id: validUUID,
      branch: "main",
      commit: "abc1234",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short commit hash", () => {
    const result = deploymentCreateSchema.safeParse({
      project_id: validUUID,
      branch: "main",
      commit: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("defaults environment to preview", () => {
    const result = deploymentCreateSchema.safeParse({
      project_id: validUUID,
      branch: "main",
      commit: "abc1234",
    });
    if (result.success) {
      expect(result.data.environment).toBe("preview");
    }
  });
});

describe("Telemetry Event Schema", () => {
  it("accepts valid telemetry event", () => {
    const result = telemetryEventSchema.safeParse({
      event: "page_view",
      category: "page_view",
      properties: { path: "/dashboard" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid category", () => {
    const result = telemetryEventSchema.safeParse({
      event: "test",
      category: "unknown",
    });
    expect(result.success).toBe(false);
  });
});

describe("Canvas Schemas", () => {
  const validUUID = "550e8400-e29b-41d4-a716-446655440000";

  describe("canvasNodeSchema", () => {
    it("accepts valid canvas node", () => {
      const result = canvasNodeSchema.safeParse({
        type: "card",
        x: 100,
        y: 200,
        width: 300,
        height: 200,
        content: { title: "Hello" },
      });
      expect(result.success).toBe(true);
    });

    it("applies defaults", () => {
      const result = canvasNodeSchema.safeParse({
        type: "note",
        x: 0,
        y: 0,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.width).toBe(300);
        expect(result.data.height).toBe(200);
        expect(result.data.rotation).toBe(0);
        expect(result.data.zIndex).toBe(0);
        expect(result.data.locked).toBe(false);
      }
    });

    it("rejects NaN coordinates", () => {
      const result = canvasNodeSchema.safeParse({
        type: "card",
        x: NaN,
        y: Infinity,
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid hex color", () => {
      const result = canvasNodeSchema.safeParse({
        type: "card",
        x: 0,
        y: 0,
        color: "rgb(255,0,0)",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("canvasEdgeSchema", () => {
    it("accepts valid edge", () => {
      const result = canvasEdgeSchema.safeParse({
        source_node_id: validUUID,
        target_node_id: validUUID,
      });
      expect(result.success).toBe(true);
    });

    it("defaults style to solid", () => {
      const result = canvasEdgeSchema.safeParse({
        source_node_id: validUUID,
        target_node_id: validUUID,
      });
      if (result.success) {
        expect(result.data.style).toBe("solid");
        expect(result.data.animated).toBe(false);
      }
    });
  });

  describe("canvasViewportSchema", () => {
    it("applies defaults", () => {
      const result = canvasViewportSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.panX).toBe(0);
        expect(result.data.panY).toBe(0);
        expect(result.data.scale).toBe(1);
      }
    });

    it("rejects zero scale", () => {
      const result = canvasViewportSchema.safeParse({ scale: 0 });
      expect(result.success).toBe(false);
    });
  });
});

describe("Comment Schema", () => {
  const validUUID = "550e8400-e29b-41d4-a716-446655440000";

  it("accepts valid comment", () => {
    const result = commentCreateSchema.safeParse({
      canvas_id: validUUID,
      content: "Great work here!",
      x: 150,
      y: 300,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty content", () => {
    const result = commentCreateSchema.safeParse({
      canvas_id: validUUID,
      content: "",
      x: 0,
      y: 0,
    });
    expect(result.success).toBe(false);
  });

  it("accepts mentions", () => {
    const result = commentCreateSchema.safeParse({
      canvas_id: validUUID,
      content: "Hey @user check this",
      x: 0,
      y: 0,
      mentions: [validUUID],
    });
    expect(result.success).toBe(true);
  });
});

describe("Permission Check Schema", () => {
  const validUUID = "550e8400-e29b-41d4-a716-446655440000";

  it("accepts valid permission check", () => {
    const result = permissionCheckSchema.safeParse({
      userId: validUUID,
      workspaceId: validUUID,
      requiredRole: "admin",
      action: "write",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid role", () => {
    const result = permissionCheckSchema.safeParse({
      userId: validUUID,
      workspaceId: validUUID,
      requiredRole: "superuser",
      action: "write",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid action", () => {
    const result = permissionCheckSchema.safeParse({
      userId: validUUID,
      workspaceId: validUUID,
      requiredRole: "member",
      action: "execute",
    });
    expect(result.success).toBe(false);
  });
});