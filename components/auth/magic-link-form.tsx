"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { magicLinkAction } from "@/lib/auth/actions";
import { initialAuthActionState } from "@/types/auth";

/**
 * Magic Link sign-in form.
 * Sends a passwordless sign-in link to the user's email address.
 */
export function MagicLinkForm() {
  const [state, formAction, pending] = useActionState(
    magicLinkAction,
    initialAuthActionState,
  );

  if (state.success && state.message) {
    return (
      <div className="space-y-4">
        <Alert variant="success">
          <div className="space-y-2">
            <p className="font-medium">Check your email</p>
            <p className="text-sm opacity-80">{state.message}</p>
          </div>
        </Alert>
        <p className="text-center text-sm text-aether-text-muted">
          Didn't receive the email? Check your spam folder, or{" "}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="font-medium text-aether-text-link hover:text-aether-accent-light transition-colors"
          >
            try again
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert variant="error">{state.error}</Alert>}

      <div>
        <Label htmlFor="magic-email">Email address</Label>
        <Input
          id="magic-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          disabled={pending}
          error={state.fieldErrors?.email}
          aria-describedby={state.fieldErrors?.email ? "magic-email-error" : undefined}
        />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Sending magic link..." : "Send magic link"}
      </Button>
    </form>
  );
}