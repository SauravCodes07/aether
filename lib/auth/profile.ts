import { createClient } from "@/lib/supabase/server";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { supabaseConfig } from "@/config/supabase";
import type { Database } from "@/types/database";

export type Profile = {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileUpdate = {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
};

export type ProfileResult =
  | { success: true; profile: Profile }
  | { success: false; error: string };

/**
 * Server-side: Fetch the current user's profile from the database.
 */
export async function getCurrentUserProfile(): Promise<ProfileResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Not authenticated." };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles" as never)
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      return { success: false, error: "Failed to load profile." };
    }

    return { success: true, profile: profile as unknown as Profile };
  } catch {
    return { success: false, error: "Something went wrong loading your profile." };
  }
}

/**
 * Server-side: Fetch a profile by user ID.
 */
export async function getProfileByUserId(userId: string): Promise<ProfileResult> {
  try {
    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from("profiles" as never)
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      return { success: false, error: "Profile not found." };
    }

    return { success: true, profile: profile as unknown as Profile };
  } catch {
    return { success: false, error: "Something went wrong loading the profile." };
  }
}

/**
 * Server-side: Update the current user's profile.
 */
export async function updateCurrentUserProfile(
  updates: ProfileUpdate,
): Promise<ProfileResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Not authenticated." };
    }

    const { data: profile, error } = await supabase
      .from("profiles" as never)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: "Failed to update profile." };
    }

    return { success: true, profile: profile as unknown as Profile };
  } catch {
    return { success: false, error: "Something went wrong updating your profile." };
  }
}

/**
 * Server-side: Create a new profile row for a user.
 * Typically called after first sign-up via a database trigger or edge function.
 */
export async function createProfile(
  userId: string,
  data: Partial<ProfileUpdate> = {},
): Promise<ProfileResult> {
  try {
    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from("profiles" as never)
      .insert({
        user_id: userId,
        display_name: data.display_name ?? null,
        avatar_url: data.avatar_url ?? null,
        bio: data.bio ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as never)
      .select()
      .single();

    if (error) {
      return { success: false, error: "Failed to create profile." };
    }

    return { success: true, profile: profile as unknown as Profile };
  } catch {
    return { success: false, error: "Something went wrong creating your profile." };
  }
}

/**
 * Server-side: Upload an avatar image to Supabase Storage and return the public URL.
 */
export async function uploadAvatar(
  file: File,
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Not authenticated." };
    }

    const fileExt = file.name.split(".").pop() ?? "png";
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(supabaseConfig.storage.buckets.avatars)
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      return { success: false, error: "Failed to upload avatar." };
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from(supabaseConfig.storage.buckets.avatars)
      .getPublicUrl(filePath);

    const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`;

    await updateCurrentUserProfile({ avatar_url: cacheBustedUrl });

    return { success: true, url: cacheBustedUrl };
  } catch {
    return { success: false, error: "Something went wrong uploading your avatar." };
  }
}

/**
 * Server-side: Delete the current user's avatar from Supabase Storage.
 */
export async function deleteAvatar(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Not authenticated." };
    }

    const { error } = await supabase.storage
      .from(supabaseConfig.storage.buckets.avatars)
      .remove([`${user.id}/avatar.png`, `${user.id}/avatar.jpg`, `${user.id}/avatar.webp`]);

    if (error) {
      return { success: false, error: "Failed to delete avatar." };
    }

    await updateCurrentUserProfile({ avatar_url: undefined });

    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong deleting your avatar." };
  }
}