"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { signOutAction } from "@/lib/auth/actions";
import { authRoutes } from "@/config/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type UserNavMenuProps = {
  user: User;
  onNavigate?: () => void;
};

function getUserInitial(user: User): string {
  const name = user.user_metadata?.full_name as string | undefined;
  if (name?.trim()) return name.trim()[0]?.toUpperCase() ?? "U";
  return user.email?.[0]?.toUpperCase() ?? "U";
}

function getUserLabel(user: User): string {
  const name = user.user_metadata?.full_name as string | undefined;
  if (name?.trim()) return name.trim();
  return user.email?.split("@")[0] ?? "Account";
}

export function UserNavMenu({ user, onNavigate }: UserNavMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    onNavigate?.();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex items-center gap-2 rounded-full border border-aether-border bg-aether-surface/60 py-1 pl-1 pr-3 text-sm transition-colors",
          "hover:border-aether-border-strong hover:bg-aether-surface",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aether-accent/50",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-aether-accent/20 text-xs font-semibold text-aether-accent-light">
          {getUserInitial(user)}
        </span>
        <span className="hidden max-w-[8rem] truncate text-aether-text sm:inline">
          {getUserLabel(user)}
        </span>
        <svg
          className={cn(
            "h-3.5 w-3.5 text-aether-text-subtle transition-transform",
            open && "rotate-180",
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="glass-floating absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-aether-lg py-1 shadow-aether-lg"
        >
          <div className="border-b border-aether-border px-4 py-3">
            <p className="truncate text-sm font-medium text-aether-text">
              {getUserLabel(user)}
            </p>
            <p className="truncate text-xs text-aether-text-subtle">
              {user.email}
            </p>
          </div>

          <Link
            href={authRoutes.dashboard}
            role="menuitem"
            className="block px-4 py-2.5 text-sm text-aether-text-muted transition-colors hover:bg-aether-surface hover:text-aether-text"
            onClick={close}
          >
            Dashboard
          </Link>

          <form action={signOutAction} className="border-t border-aether-border">
            <button
              type="submit"
              role="menuitem"
              className="w-full px-4 py-2.5 text-left text-sm text-aether-text-muted transition-colors hover:bg-aether-surface hover:text-aether-text"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

type NavbarAuthProps = {
  user: User | null;
  onNavigate?: () => void;
  layout?: "desktop" | "mobile";
};

export function NavbarAuth({
  user,
  onNavigate,
  layout = "desktop",
}: NavbarAuthProps) {
  if (user) {
    if (layout === "mobile") {
      return (
        <div className="flex flex-col gap-2">
          <Button
            variant="secondary"
            href={authRoutes.dashboard}
            className="w-full"
            onClick={onNavigate}
          >
            Dashboard
          </Button>
          <form action={signOutAction}>
            <Button type="submit" variant="outline" className="w-full">
              Sign out
            </Button>
          </form>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <Link
          href={authRoutes.dashboard}
          className="text-sm text-aether-text-muted transition-colors hover:text-aether-text"
        >
          Dashboard
        </Link>
        <UserNavMenu user={user} onNavigate={onNavigate} />
      </div>
    );
  }

  if (layout === "mobile") {
    return (
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          href={authRoutes.login}
          className="w-full"
          onClick={onNavigate}
        >
          Sign in
        </Button>
        <Button
          href={authRoutes.signup}
          className="w-full"
          onClick={onNavigate}
        >
          Create Account
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="sm" href={authRoutes.login}>
        Sign in
      </Button>
      <Button size="sm" href={authRoutes.signup}>
        Create Account
      </Button>
    </div>
  );
}
