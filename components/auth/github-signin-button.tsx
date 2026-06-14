"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type GitHubSignInButtonProps = {
  disabled?: boolean;
  onError?: (message: string) => void;
};

/**
 * GitHub OAuth sign-in button.
 * Redirects to GitHub for authentication, then back to /auth/callback.
 */
export function GitHubSignInButton({ disabled = false, onError }: GitHubSignInButtonProps) {
  const [pending, setPending] = useState(false);

  const handleGitHubSignIn = async (): Promise<void> => {
    try {
      setPending(true);
      onError?.("");

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: "read:user user:email",
        },
      });

      if (error) {
        onError?.(error.message);
        setPending(false);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An error occurred starting GitHub Sign In.";
      onError?.(message);
      setPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full flex items-center justify-center gap-3 border border-aether-border bg-aether-surface/40 hover:bg-aether-surface transition-colors"
      onClick={handleGitHubSignIn}
      disabled={disabled || pending}
      aria-label="Sign in with GitHub"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
      {pending ? "Connecting to GitHub..." : "Continue with GitHub"}
    </Button>
  );
}