export const dynamic = "force-dynamic";

import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/signup-form";
import { requireGuest } from "@/lib/auth/guards";

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
      footer={null}
    >
      <SignUpForm />
    </AuthShell>
  );
}
