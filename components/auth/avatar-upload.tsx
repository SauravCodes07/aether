"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type AvatarUploadProps = {
  currentAvatarUrl: string | null;
  userName: string | null;
  onUploadComplete: (url: string) => void;
  onRemoveComplete: () => void;
};

/**
 * Avatar upload component with drag-and-drop and click-to-upload.
 * Handles client-side preview while uploading to Supabase Storage.
 */
export function AvatarUpload({
  currentAvatarUrl,
  userName,
  onUploadComplete,
  onRemoveComplete,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayUrl = preview ?? currentAvatarUrl;
  const initials = getInitials(userName);

  const processFile = useCallback(
    async (file: File): Promise<void> => {
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB.");
        return;
      }

      setError(null);
      setUploading(true);

      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/profile/avatar", {
          method: "POST",
          body: formData,
        });

        const result = (await response.json()) as {
          success: boolean;
          url?: string;
          error?: string;
        };

        if (result.success && result.url) {
          onUploadComplete(result.url);
          setPreview(null);
        } else {
          setError(result.error ?? "Failed to upload avatar.");
          setPreview(null);
        }
      } catch {
        setError("Failed to upload avatar. Please try again.");
        setPreview(null);
      } finally {
        setUploading(false);
        URL.revokeObjectURL(objectUrl);
      }
    },
    [onUploadComplete],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent): void => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile],
  );

  const handleRemove = useCallback(async (): Promise<void> => {
    setUploading(true);
    setError(null);

    try {
      const response = await fetch("/api/profile/avatar", {
        method: "DELETE",
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: string;
      };

      if (result.success) {
        onRemoveComplete();
        setPreview(null);
      } else {
        setError(result.error ?? "Failed to remove avatar.");
      }
    } catch {
      setError("Failed to remove avatar. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [onRemoveComplete]);

  return (
    <div className="flex items-start gap-6">
      <div
        className={`relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-colors ${
          isDragging
            ? "border-aether-accent bg-aether-accent/10"
            : "border-aether-border hover:border-aether-border-strong"
        }`}
        onDragOver={(e: React.DragEvent) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload avatar image"
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={userName ? `${userName}'s avatar` : "User avatar"}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-2xl font-semibold text-aether-text-muted">
            {initials}
          </span>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <p className="text-sm text-aether-text-muted">
          Drag and drop or click to upload.
        </p>
        <p className="caption">PNG, JPG or WebP. Max 5MB.</p>

        {error && <p className="text-xs text-aether-error">{error}</p>}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            Change
          </Button>
          {(currentAvatarUrl || preview) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={uploading}
              className="text-aether-error hover:text-aether-error/80"
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}