export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/signup-form";
import { requireGuest } from "@/lib/auth/guards";
import { authRoutes } from "@/config/auth";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your Aether account",
};

export default async function SignUpPage() {
  await requireGuest();

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Aether and start building spatial experiences."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={authRoutes.login}
            className="font-medium text-aether-text-link hover:text-aether-accent-light"
          >
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthShell>
  );
}
