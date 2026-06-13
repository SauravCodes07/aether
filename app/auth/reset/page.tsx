export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { requireGuest } from "@/lib/auth/guards";
import { authRoutes } from "@/config/auth";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Reset your Aether account password",
};

export default async function ResetPasswordPage() {
  await requireGuest();

  return (
    <AuthShell
      title="Reset password"
      subtitle="Enter your email address and we'll send you a link to reset your password."
      footer={
        <>
          Remember your password?{" "}
          <Link
            href={authRoutes.login}
            className="font-medium text-aether-text-link hover:text-aether-accent-light"
          >
            Sign in
          </Link>
        </>
      }
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
