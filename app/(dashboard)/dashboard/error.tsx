"use client";

import { useEffect } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("[dashboard]", error);
  }, [error]);

  return (
    <div className="section-padding pt-28">
      <div className="mx-auto w-full max-w-md space-y-6">
        <Alert variant="error">
          Failed to load the dashboard. Please try again.
        </Alert>
        <Button onClick={reset} className="w-full">
          Retry
        </Button>
      </div>
    </div>
  );
}
