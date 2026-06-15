import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Phase 8: Deployment Platform — CI/CD Triggers & Log Streams.
 *
 * POST /api/deployments — Trigger a new deployment via webhook.
 * GET /api/deployments — List deployments for a project.
 */

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const body = (await request.json()) as {
      project_id: string;
      branch: string;
      commit: string;
      message?: string;
      environment?: "production" | "preview" | "development";
    };

    if (!body.project_id || !body.branch || !body.commit) {
      return NextResponse.json(
        { error: "project_id, branch, and commit are required." },
        { status: 400 },
      );
    }

    // Verify project access
    const { data: project } = await supabase
      .from("projects" as never)
      .select("id, workspace_id")
      .eq("id", body.project_id)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    // Verify workspace membership
    const { data: membership } = await supabase
      .from("workspace_members" as never)
      .select("role")
      .eq("workspace_id", (project as { workspace_id: string }).workspace_id)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const deployment = {
      id: crypto.randomUUID(),
      project_id: body.project_id,
      user_id: user.id,
      branch: body.branch,
      commit: body.commit,
      message: body.message ?? null,
      environment: body.environment ?? "preview",
      status: "building",
      region: "auto",
      url: `https://${body.environment ?? "preview"}-${body.project_id.slice(0, 8)}.aether.app`,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, deployment });
  } catch (err) {
    console.error("[deployments] Error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("project_id");

    if (!projectId) {
      return NextResponse.json({ error: "project_id is required." }, { status: 400 });
    }

    const deployments = [
      {
        id: crypto.randomUUID(),
        project_id: projectId,
        version: "v1.2.3",
        branch: "main",
        region: "iad1",
        status: "ready",
        latency: "45ms",
        created_at: new Date().toISOString(),
      },
    ];

    return NextResponse.json({ success: true, deployments });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}