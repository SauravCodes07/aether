"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { authRoutes } from "@/config/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { DROPDOWN_VARIANTS, MICRO_INTERACTION_VARIANTS, MICRO_INTERACTION_TRANSITION } from "@/lib/motion";
import { LayoutDashboard, FolderOpen, User2, Settings, CreditCard, LogOut, ChevronDown } from "lucide-react";

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

function UserNavMenu({ user, onNavigate }: { user: User; onNavigate?: () => void }) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => { document.removeEventListener("mousedown", handleClickOutside); document.removeEventListener("keydown", handleEscape); };
  }, [open]);

  const close = useCallback(() => { setOpen(false); onNavigate?.(); }, [onNavigate]);

  const handleSignOut = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (signingOut) return;
      setSigningOut(true);
      close();
      try { const supabase = createClient(); await supabase.auth.signOut(); } catch { /* fall through */ }
      window.location.href = authRoutes.login;
    },
    [signingOut, close],
  );

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;

  return (
    <div className="relative" ref={menuRef}>
      <motion.button type="button" onClick={() => setOpen((prev) => !prev)}
        className={cn("flex items-center gap-2 rounded-full border border-aether-border bg-aether-surface/60 py-1 pl-1 pr-3 text-sm transition-all duration-300", "hover:border-aether-border-strong hover:bg-aether-surface hover:shadow-aether-sm", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aether-accent/50")}
        variants={MICRO_INTERACTION_VARIANTS} whileHover="hover" whileTap="tap" transition={MICRO_INTERACTION_TRANSITION}
        aria-expanded={open} aria-haspopup="menu" aria-label="Account menu">
        <div className="relative flex h-7 w-7">
          {avatarUrl ? <img src={avatarUrl} alt={getUserLabel(user)} className="h-full w-full rounded-full object-cover border border-aether-border-strong" /> : <span className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-aether-accent to-aether-cyan text-xs font-semibold text-white select-none">{getUserInitial(user)}</span>}
          <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aether-success opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-aether-success shadow-[0_0_8px_rgba(34,197,94,0.6)]" /></span>
        </div>
        <span className="hidden max-w-[8rem] truncate text-aether-text font-medium sm:inline">{getUserLabel(user)}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-aether-text-subtle transition-transform duration-300", open && "rotate-180")} />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div variants={DROPDOWN_VARIANTS} initial="hidden" animate="visible" exit="exit" role="menu" className="glass-floating absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-aether-lg border border-aether-border-strong/60 shadow-aether-xl">
            <div className="border-b border-aether-border-strong/40 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-9 w-9 shrink-0">
                  {avatarUrl ? <img src={avatarUrl} alt={getUserLabel(user)} className="h-full w-full rounded-full object-cover border border-aether-border-strong" /> : <span className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-aether-accent to-aether-cyan text-xs font-bold text-white select-none">{getUserInitial(user)}</span>}
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aether-success opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-aether-success shadow-[0_0_6px_rgba(34,197,94,0.5)]" /></span>
                </div>
                <div className="min-w-0"><p className="truncate text-sm font-semibold text-aether-text">{getUserLabel(user)}</p><p className="truncate text-xs text-aether-text-subtle">{user.email}</p></div>
              </div>
            </div>
            <div className="p-1.5">
              <Link href={authRoutes.dashboard} role="menuitem" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-aether-text-muted transition-colors hover:bg-aether-surface hover:text-aether-text" onClick={close} prefetch={true}><LayoutDashboard className="h-4 w-4" />Dashboard</Link>
              <Link href="/workspace" role="menuitem" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-aether-text-muted transition-colors hover:bg-aether-surface hover:text-aether-text" onClick={close} prefetch={true}><FolderOpen className="h-4 w-4" />Workspace</Link>
              <div className="my-1 border-t border-aether-border-strong/30" />
              <Link href="/dashboard?tab=profile" role="menuitem" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-aether-text-muted transition-colors hover:bg-aether-surface hover:text-aether-text" onClick={close} prefetch={true}><User2 className="h-4 w-4" />Profile</Link>
              <Link href="/dashboard?tab=settings" role="menuitem" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-aether-text-muted transition-colors hover:bg-aether-surface hover:text-aether-text" onClick={close} prefetch={true}><Settings className="h-4 w-4" />Settings</Link>
              <Link href="/dashboard?tab=billing" role="menuitem" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-aether-text-muted transition-colors hover:bg-aether-surface hover:text-aether-text" onClick={close} prefetch={true}><CreditCard className="h-4 w-4" />Billing</Link>
            </div>
            <div className="border-t border-aether-border-strong/40 p-1.5">
              <form onSubmit={handleSignOut}>
                <button type="submit" role="menuitem" disabled={signingOut} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-aether-text-muted transition-colors hover:bg-aether-error/10 hover:text-aether-error cursor-pointer disabled:opacity-50"><LogOut className="h-4 w-4" />{signingOut ? "Signing out..." : "Sign out"}</button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type NavbarAuthProps = { user: User | null; onNavigate?: () => void; layout?: "desktop" | "mobile" };

export function NavbarAuth({ user, onNavigate, layout = "desktop" }: NavbarAuthProps) {
  const handleSignOut = useCallback(async (e: React.FormEvent) => {
    e.preventDefault(); onNavigate?.();
    try { const supabase = createClient(); await supabase.auth.signOut(); } catch { /* fall through */ }
    window.location.href = authRoutes.login;
  }, [onNavigate]);

  if (user) {
    if (layout === "mobile") return (
      <div className="flex flex-col gap-3">
        <Button variant="secondary" href={authRoutes.dashboard} className="w-full py-3" onClick={onNavigate} prefetch={true}>Dashboard</Button>
        <form onSubmit={handleSignOut}><Button type="submit" variant="outline" className="w-full py-3 text-aether-error border-aether-error/20 hover:bg-aether-error/10 hover:border-aether-error/40">Sign out</Button></form>
      </div>
    );
    return <div className="flex items-center gap-4"><Link href={authRoutes.dashboard} className="text-sm font-medium text-aether-text-muted transition-colors hover:text-aether-text" prefetch={true}>Dashboard</Link><UserNavMenu user={user} onNavigate={onNavigate} /></div>;
  }

  if (layout === "mobile") return (
    <div className="flex flex-col gap-3">
      <Button variant="ghost" href={authRoutes.login} className="w-full py-3" onClick={onNavigate} prefetch={true}>Sign in</Button>
      <Button href={authRoutes.signup} className="w-full py-3 bg-gradient-to-r from-aether-accent to-aether-cyan border-none text-white font-semibold shadow-aether-md" onClick={onNavigate} prefetch={true}>Create Account</Button>
    </div>
  );

  return (
    <div className="flex items-center gap-4">
      <motion.div variants={MICRO_INTERACTION_VARIANTS} whileHover="hover" whileTap="tap" transition={MICRO_INTERACTION_TRANSITION}><Button variant="ghost" size="sm" href={authRoutes.login} prefetch={true} className="font-medium hover:text-aether-text">Sign in</Button></motion.div>
      <motion.div variants={MICRO_INTERACTION_VARIANTS} whileHover="hover" whileTap="tap" transition={MICRO_INTERACTION_TRANSITION}><Button size="sm" href={authRoutes.signup} prefetch={true} className="bg-gradient-to-r from-aether-accent to-aether-cyan border-none text-white font-semibold shadow-aether-sm hover:shadow-aether-md transition-all duration-300">Create Account</Button></motion.div>
    </div>
  );
}