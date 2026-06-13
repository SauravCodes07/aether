export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { requireGuest } from "@/lib/auth/guards";
import { authRoutes } from "@/config/auth";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Aether account",
};

type LoginPageProps = {
  searchParams: Promise<{ redirectTo?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  await requireGuest();

  const { redirectTo } = await searchParams;

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to access your spatial computing workspace."
      footer={
        <>
          New to Aether?{" "}
          <Link
            href={authRoutes.signup}
            className="font-medium text-aether-text-link hover:text-aether-accent-light"
          >
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm redirectTo={redirectTo} />
    </AuthShell>
  );
}
