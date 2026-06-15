import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/ai/chat
 *
 * Phase 5: AI Copilot System — Streaming Pipeline.
 * Streams AI responses via Server-Sent Events using Vercel AI SDK pattern.
 * Injects workspace context (file tree, canvas layout, user metadata) into the system prompt.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      messages: { role: "user" | "assistant" | "system"; content: string }[];
      project_id?: string;
      workspace_id?: string;
    };

    if (!body.messages?.length) {
      return NextResponse.json(
        { error: "Messages array is required." },
        { status: 400 },
      );
    }

    // Gather context for injection
    let contextPrompt = "";

    if (body.workspace_id) {
      const { data: workspace } = await supabase
        .from("workspaces" as never)
        .select("name, slug, description")
        .eq("id", body.workspace_id)
        .single();

      if (workspace) {
        const ws = workspace as { name: string; slug: string; description?: string };
        contextPrompt += `\nCurrent Workspace: ${ws.name} (${ws.slug})`;
        if (ws.description) contextPrompt += ` — ${ws.description}`;
      }
    }

    if (body.project_id) {
      const { data: project } = await supabase
        .from("projects" as never)
        .select("name, slug, description, status")
        .eq("id", body.project_id)
        .single();

      if (project) {
        const p = project as { name: string; slug: string; description?: string; status: string };
        contextPrompt += `\nCurrent Project: ${p.name} (${p.slug}) — Status: ${p.status}`;
      }
    }

    // Load user profile
    const { data: profile } = await supabase
      .from("profiles" as never)
      .select("display_name")
      .eq("user_id", user.id)
      .single();

    const userName = (profile as { display_name?: string } | null)?.display_name ?? user.email ?? "User";
    contextPrompt += `\nCurrent User: ${userName}`;

    const systemMessage = {
      role: "system" as const,
      content: `You are Aether AI Copilot, an intelligent workspace assistant.
      You help users with coding, deployment, collaboration, and project management.
      You can perform tool actions on the workspace (create/update/delete files, manage projects, deploy).
      ${contextPrompt}

      When the user asks you to perform actions, respond with a clear plan and ask for confirmation before executing destructive operations.
      Always be helpful, concise, and proactive.`,
    };

    const allMessages = [systemMessage, ...body.messages];

    // For now, return a structured response. When an AI provider key is configured,
    // this will become a true streaming endpoint using the Vercel AI SDK.
    const responsePayload = {
      messages: allMessages.map((m) => ({
        role: m.role,
        content: `[Aether AI] Received: "${m.content.slice(0, 100)}${m.content.length > 100 ? "..." : ""}"`,
      })),
      context: {
        workspace_id: body.workspace_id ?? null,
        project_id: body.project_id ?? null,
        user_id: user.id,
      },
      tool_calls_available: [
        "createProjectFile",
        "updateProjectFile",
        "deleteProjectFile",
        "createFolder",
        "renameFile",
        "moveFile",
        "createWorkspace",
        "updateWorkspace",
        "createProject",
        "updateProject",
        "searchFiles",
        "readFile",
        "deploy",
      ],
    };

    return NextResponse.json({ success: true, ...responsePayload });
  } catch (err) {
    console.error("[ai/chat] Error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}

/**
 * GET /api/ai/chat — Health check and available tool list.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "ok",
    model: "aether-copilot-v1",
    tools_available: [
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
    ],
  });
}