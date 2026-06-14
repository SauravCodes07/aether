import { NextResponse } from "next/server";
import { uploadAvatar, deleteAvatar } from "@/lib/auth/profile";

/**
 * POST /api/profile/avatar — Upload an avatar image.
 * Accepts multipart/form-data with a "file" field.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file provided." },
        { status: 400 },
      );
    }

    const result = await uploadAvatar(file);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, url: result.url });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/profile/avatar — Remove the current user's avatar.
 */
export async function DELETE(): Promise<NextResponse> {
  try {
    const result = await deleteAvatar();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 },
    );
  }
}