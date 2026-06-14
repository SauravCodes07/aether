"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { authRoutes } from "@/config/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { DROPDOWN_VARIANTS } from "@/lib/motion";

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
  const router = useRouter();

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

  const handleSignOut = async (e: React.FormEvent) => {
    e.preventDefault();
    close();
    
    // Clear client session instantly for zero perceived lag
    const supabase = createClient();
    await supabase.auth.signOut();
    
    // Refresh page or push to login
    router.push(authRoutes.login);
    router.refresh();
  };

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex items-center gap-2 rounded-full border border-aether-border bg-aether-surface/60 py-1 pl-1 pr-3 text-sm transition-all duration-300",
          "hover:border-aether-border-strong hover:bg-aether-surface hover:shadow-aether-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aether-accent/50",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
      >
        <div className="relative flex h-7 w-7">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={getUserLabel(user)}
              className="h-full w-full rounded-full object-cover border border-aether-border-strong"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-aether-accent to-aether-cyan text-xs font-semibold text-white select-none">
              {getUserInitial(user)}
            </span>
          )}
          {/* Glowing Green Presence indicator */}
          <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aether-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-aether-success shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
          </span>
        </div>
        <span className="hidden max-w-[8rem] truncate text-aether-text font-medium sm:inline">
          {getUserLabel(user)}
        </span>
        <svg
          className={cn(
            "h-3.5 w-3.5 text-aether-text-subtle transition-transform duration-300",
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

      <AnimatePresence>
        {open && (
          <motion.div
            variants={DROPDOWN_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="menu"
            className="glass-floating absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-aether-lg border border-aether-border-strong/60 bg-aether-bg-elevated/95 shadow-aether-xl backdrop-blur-xl"
          >
            {/* Premium profile header */}
            <div className="border-b border-aether-border-strong/40 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-9 w-9 shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={getUserLabel(user)}
                      className="h-full w-full rounded-full object-cover border border-aether-border-strong"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-aether-accent to-aether-cyan text-xs font-bold text-white select-none">
                      {getUserInitial(user)}
                    </span>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aether-success opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-aether-success shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-aether-text">
                    {getUserLabel(user)}
                  </p>
                  <p className="truncate text-xs text-aether-text-subtle">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-1.5">
              <Link
                href={authRoutes.dashboard}
                role="menuitem"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-aether-text-muted transition-colors hover:bg-aether-surface hover:text-aether-text"
                onClick={close}
                prefetch={true}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                Dashboard
              </Link>
              <Link
                href="/workspace"
                role="menuitem"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-aether-text-muted transition-colors hover:bg-aether-surface hover:text-aether-text"
                onClick={close}
                prefetch={true}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                </svg>
                Workspace
              </Link>
            </div>

            {/* Sign out */}
            <div className="border-t border-aether-border-strong/40 p-1.5">
              <form onSubmit={handleSignOut}>
                <button
                  type="submit"
                  role="menuitem"
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-aether-text-muted transition-colors hover:bg-aether-error/10 hover:text-aether-error cursor-pointer"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  Sign out
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
  const router = useRouter();

  const handleSignOut = async (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate?.();
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(authRoutes.login);
    router.refresh();
  };

  if (user) {
    if (layout === "mobile") {
      return (
        <div className="flex flex-col gap-3">
          <Button
            variant="secondary"
            href={authRoutes.dashboard}
            className="w-full py-3"
            onClick={onNavigate}
            prefetch={true}
          >
            Dashboard
          </Button>
          <form onSubmit={handleSignOut}>
            <Button type="submit" variant="outline" className="w-full py-3 text-aether-error border-aether-error/20 hover:bg-aether-error/10 hover:border-aether-error/40">
              Sign out
            </Button>
          </form>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-4">
        <Link
          href={authRoutes.dashboard}
          className="text-sm font-medium text-aether-text-muted transition-colors hover:text-aether-text"
          prefetch={true}
        >
          Dashboard
        </Link>
        <UserNavMenu user={user} onNavigate={onNavigate} />
      </div>
    );
  }

  if (layout === "mobile") {
    return (
      <div className="flex flex-col gap-3">
        <Button
          variant="ghost"
          href={authRoutes.login}
          className="w-full py-3"
          onClick={onNavigate}
          prefetch={true}
        >
          Sign in
        </Button>
        <Button
          href={authRoutes.signup}
          className="w-full py-3 bg-gradient-to-r from-aether-accent to-aether-cyan border-none text-white font-semibold shadow-aether-md"
          onClick={onNavigate}
          prefetch={true}
        >
          Create Account
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="sm" href={authRoutes.login} prefetch={true} className="font-medium hover:text-aether-text">
        Sign in
      </Button>
      <Button size="sm" href={authRoutes.signup} prefetch={true} className="bg-gradient-to-r from-aether-accent to-aether-cyan border-none text-white font-semibold shadow-aether-sm hover:shadow-aether-md active:scale-95 transition-all duration-300">
        Create Account
      </Button>
    </div>
  );
}
