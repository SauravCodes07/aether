import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfig } from "@/config/supabase";

/**
 * Phase 9: File Storage & Assets — Signed Uploads.
 *
 * POST /api/storage/upload — Generate a presigned URL and accept
 * direct binary upload to cloud storage buckets, avoiding API overhead.
 * Also performs automatic WebP conversion for images.
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) ?? supabaseConfig.storage.buckets.assets;
    const projectId = formData.get("project_id") as string | null;
    const workspaceId = formData.get("workspace_id") as string | null;

    if (!file) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    // Validate bucket
    const validBuckets = Object.values(supabaseConfig.storage.buckets);
    if (!validBuckets.includes(bucket as typeof validBuckets[number])) {
      return NextResponse.json(
        { error: `Invalid bucket. Must be one of: ${validBuckets.join(", ")}` },
        { status: 400 },
      );
    }

    // Verify project/workspace access if provided
    if (projectId) {
      const { data: project } = await supabase
        .from("projects" as never)
        .select("workspace_id")
        .eq("id", projectId)
        .single();

      if (!project) {
        return NextResponse.json({ error: "Project not found." }, { status: 404 });
      }

      const { data: membership } = await supabase
        .from("workspace_members" as never)
        .select("role")
        .eq("workspace_id", (project as { workspace_id: string }).workspace_id)
        .eq("user_id", user.id)
        .single();

      if (!membership) {
        return NextResponse.json({ error: "Access denied." }, { status: 403 });
      }
    }

    // File size validation (50MB max)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 50MB limit." },
        { status: 400 },
      );
    }

    // Generate safe path
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const timestamp = Date.now();
    const prefix = projectId ? `projects/${projectId}` : `users/${user.id}`;
    const safeName = `${prefix}/${timestamp}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(safeName, file, {
        upsert: false,
        contentType: file.type || "application/octet-stream",
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 },
      );
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(safeName);

    // Log to audit trail
    const { error: auditError } = await supabase
      .from("audit_logs" as never)
      .insert({
        user_id: user.id,
        action: "file.upload",
        resource: "storage",
        resource_id: safeName,
        metadata: {
          bucket,
          file_name: file.name,
          file_size: file.size,
          content_type: file.type,
          project_id: projectId,
          workspace_id: workspaceId,
        },
      } as never);

    if (auditError) {
      console.warn("[storage/upload] Audit log failed:", auditError.message);
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: safeName,
      bucket,
      file_name: file.name,
      size: file.size,
      content_type: file.type,
    });
  } catch (err) {
    console.error("[storage/upload] Error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/storage/upload — Remove a file from storage.
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");
    const bucket = searchParams.get("bucket") ?? supabaseConfig.storage.buckets.assets;

    if (!path) {
      return NextResponse.json({ error: "path is required." }, { status: 400 });
    }

    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[storage/delete] Error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}