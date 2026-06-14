"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordAction } from "@/lib/auth/actions";
import { initialAuthActionState } from "@/types/auth";

/**
 * Password reset request form.
 * Sends a password reset email to the user.
 */
export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialAuthActionState,
  );

  if (state.success && state.message) {
    return (
      <div className="space-y-4">
        <Alert variant="success">
          <div className="space-y-2">
            <p className="font-medium">Email sent</p>
            <p className="text-sm opacity-80">{state.message}</p>
          </div>
        </Alert>
        <p className="text-center text-sm text-aether-text-muted">
          Didn&apos;t receive the email? Check your spam folder, or{" "}
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
        <Label htmlFor="reset-email">Email address</Label>
        <Input
          id="reset-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          disabled={pending}
          error={state.fieldErrors?.email}
        />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Sending reset link..." : "Send reset link"}
      </Button>
    </form>
  );
}