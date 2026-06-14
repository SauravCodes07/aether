"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarUpload } from "@/components/auth/avatar-upload";
import type { Profile } from "@/lib/auth/profile";

type ProfileFormProps = {
  profile: Profile;
};

type FormState = {
  error?: string;
  success?: string;
};

/**
 * User profile editing form.
 * Handles display name, bio, and avatar updates.
 */
export function ProfileForm({ profile }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [state, setState] = useState<FormState>({});
  const [saving, setSaving] = useState(false);

  const handleAvatarUpload = (url: string): void => {
    setAvatarUrl(url);
    setState({ success: "Avatar updated successfully." });
  };

  const handleAvatarRemove = (): void => {
    setAvatarUrl(null);
    setState({ success: "Avatar removed." });
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    setState({});

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName.trim() || null,
          bio: bio.trim() || null,
        }),
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: string;
      };

      if (result.success) {
        setState({ success: "Profile updated successfully." });
      } else {
        setState({ error: result.error ?? "Failed to update profile." });
      }
    } catch {
      setState({ error: "Failed to update profile. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <AvatarUpload
        currentAvatarUrl={avatarUrl}
        userName={profile.display_name}
        onUploadComplete={handleAvatarUpload}
        onRemoveComplete={handleAvatarRemove}
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        {state.error && <Alert variant="error">{state.error}</Alert>}
        {state.success && <Alert variant="success">{state.success}</Alert>}

        <div>
          <Label htmlFor="profile-display-name">Display name</Label>
          <Input
            id="profile-display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
            disabled={saving}
            maxLength={100}
          />
          <p className="mt-1 caption">This is how others will see you.</p>
        </div>

        <div>
          <Label htmlFor="profile-bio">Bio</Label>
          <textarea
            id="profile-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us a little about yourself..."
            disabled={saving}
            maxLength={500}
            rows={4}
            className="w-full rounded-aether-md border border-aether-border bg-aether-surface/60 px-4 py-3 text-sm text-aether-text placeholder:text-aether-text-subtle transition-colors focus:border-aether-border-focus focus:outline-none focus:ring-2 focus:ring-aether-accent/30 resize-none"
          />
          <p className="mt-1 caption">{bio.length}/500 characters</p>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}