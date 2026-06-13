"use client";

import { signOutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

type SignOutButtonProps = {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function SignOutButton({
  variant = "outline",
  size = "md",
  className,
}: SignOutButtonProps) {
  return (
    <form action={signOutAction}>
      <Button
        type="submit"
        variant={variant}
        size={size}
        className={className}
      >
        Sign out
      </Button>
    </form>
  );
}
