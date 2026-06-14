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

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const initials = displayName[0]?.toUpperCase() ?? "A";

  return (
    <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex h-14 w-14 shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-full w-full rounded-xl object-cover border border-aether-border-strong"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-aether-accent to-aether-cyan text-lg font-bold text-white select-none shadow-aether-md">
              {initials}
            </span>
          )}
          {/* Online indicator */}
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aether-success opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-aether-success shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          </span>
        </div>

        <div>
          <p className="label-sm mb-2">Dashboard</p>
          <h1 className="heading-lg text-gradient mb-1">
            Welcome back, {displayName}
          </h1>
          <p className="body-md max-w-xl">
            Your spatial computing workspace is ready. Explore modules below as
            Aether expands.
          </p>
        </div>
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

  const displayName =
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    "Creator";
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const initials = displayName[0]?.toUpperCase() ?? "A";

  return (
    <Card className="mb-8 glass-panel">
      <h2 className="heading-sm mb-6">Profile</h2>
      <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
        {/* Avatar column */}
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <div className="relative flex h-20 w-20 shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-full w-full rounded-2xl object-cover border-2 border-aether-border-strong"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-aether-accent to-aether-cyan text-2xl font-bold text-white select-none shadow-aether-md">
                {initials}
              </span>
            )}
            {/* Online indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aether-success opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-aether-success shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            </span>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold text-aether-text">{displayName}</p>
            <p className="text-xs text-aether-text-subtle">Member since {createdAt}</p>
          </div>
        </div>

        {/* Details grid */}
        <dl className="grid gap-4 sm:grid-cols-2 content-start">
          <div>
            <dt className="caption mb-1">Email</dt>
            <dd className="text-sm font-medium text-aether-text">{user.email}</dd>
          </div>
          <div>
            <dt className="caption mb-1">Email verified</dt>
            <dd className="text-sm text-aether-text-muted">
              {user.email_confirmed_at ? (
                <span className="text-aether-success">Verified</span>
              ) : (
                <span className="text-aether-warning">Pending confirmation</span>
              )}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="caption mb-1">User ID</dt>
            <dd className="code-sm truncate text-aether-text-muted font-mono text-xs">
              {user.id}
            </dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}