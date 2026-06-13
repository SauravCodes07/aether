"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction } from "@/lib/auth/actions";
import { authRoutes } from "@/config/auth";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialAuthActionState } from "@/types/auth";

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(
    signUpAction,
    initialAuthActionState,
  );

  if (state.success && state.message) {
    return (
      <div className="space-y-6">
        <Alert variant="success">{state.message}</Alert>
        <Button href={authRoutes.login} className="w-full" size="lg">
          Go to sign in
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.error && <Alert variant="error">{state.error}</Alert>}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          disabled={pending}
          error={state.fieldErrors?.email}
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          required
          minLength={8}
          disabled={pending}
          error={state.fieldErrors?.password}
        />
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          required
          disabled={pending}
          error={state.fieldErrors?.confirmPassword}
        />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-aether-text-muted">
        Already have an account?{" "}
        <Link
          href={authRoutes.login}
          className="font-medium text-aether-text-link transition-colors hover:text-aether-accent-light"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
