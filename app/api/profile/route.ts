import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateCurrentUserProfile, getCurrentUserProfile } from "@/lib/auth/profile";

/**
 * GET /api/profile — Fetch the current user's profile.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const result = await getCurrentUserProfile();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 },
      );
    }

    return NextResponse.json({ success: true, profile: result.profile });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/profile — Update the current user's profile.
 */
export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as {
      display_name?: string;
      bio?: string;
      avatar_url?: string;
    };

    const result = await updateCurrentUserProfile({
      display_name: body.display_name,
      bio: body.bio,
      avatar_url: body.avatar_url,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, profile: result.profile });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 },
    );
  }
}