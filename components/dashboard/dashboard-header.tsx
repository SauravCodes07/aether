import type { User } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { SignOutButton } from "@/components/auth/sign-out-button";

type DashboardHeaderProps = {
  user: User;
};

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const displayName =
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    "Creator";

  return (
    <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="label-sm mb-3">Dashboard</p>
        <h1 className="heading-lg text-gradient mb-2">
          Welcome back, {displayName}
        </h1>
        <p className="body-md max-w-xl">
          Your spatial computing workspace is ready. Explore modules below as
          Aether expands.
        </p>
      </div>
      <SignOutButton className="shrink-0" />
    </div>
  );
}

type UserInfoCardProps = {
  user: User;
};

export function UserInfoCard({ user }: UserInfoCardProps) {
  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <Card className="mb-8 glass-panel">
      <h2 className="heading-sm mb-4">Account</h2>
      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="caption mb-1">Email</dt>
          <dd className="text-sm font-medium text-aether-text">{user.email}</dd>
        </div>
        <div>
          <dt className="caption mb-1">User ID</dt>
          <dd className="code-sm truncate text-aether-text-muted">{user.id}</dd>
        </div>
        <div>
          <dt className="caption mb-1">Member since</dt>
          <dd className="text-sm text-aether-text-muted">{createdAt}</dd>
        </div>
        <div>
          <dt className="caption mb-1">Email verified</dt>
          <dd className="text-sm text-aether-text-muted">
            {user.email_confirmed_at ? "Yes" : "Pending confirmation"}
          </dd>
        </div>
      </dl>
    </Card>
  );
}
