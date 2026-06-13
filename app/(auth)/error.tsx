"use client";

import { useEffect } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type AuthErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AuthError({ error, reset }: AuthErrorProps) {
  useEffect(() => {
    console.error("[auth]", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-5 pt-24">
      <div className="w-full max-w-md space-y-6">
        <Alert variant="error">
          Something went wrong with authentication. Please try again.
        </Alert>
        <Button onClick={reset} className="w-full">
          Try again
        </Button>
      </div>
    </div>
  );
}
