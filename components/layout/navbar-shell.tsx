"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { NavbarAuth } from "@/components/layout/navbar-auth";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  NAV_ACTIVE_LINE_TRANSITION,
  MOBILE_DRAWER_VARIANTS,
  MOBILE_NAV_ITEM_VARIANTS,
} from "@/lib/motion";

export function NavbarShell() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll handler for background style and progress bar
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };
    
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Section observer to detect which landing section is active
  useEffect(() => {
    if (typeof window === "undefined" || window.location.pathname !== "/") {
      return;
    }

    const sections = siteConfig.nav
      .map((item) => item.href.replace("#", ""))
      .filter(Boolean);

    const observerOptions = {
      root: null,
      rootMargin: "-30% 0px -60% 0px", // triggers when section dominates viewport center
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(`#${entry.target.id}`);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Sync scroll lock when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled 
          ? "glass-strong border-b border-aether-border-strong/40 shadow-aether-navbar backdrop-blur-xl bg-aether-bg/80" 
          : "bg-transparent border-b border-transparent"
      )}
    >
      {/* Scroll Progress Bar */}
      <div 
        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-aether-accent via-aether-cyan to-aether-accent transition-all duration-75 ease-out origin-left"
        style={{ width: `${scrollProgress}%` }}
      />

      <Container as="nav" className="flex h-16 md:h-20 items-center justify-between transition-all duration-500">
        <Logo className="h-10 md:h-14" />

        {/* Desktop Navigation Links */}
        <ul className="hidden items-center gap-8 md:flex h-full">
          {siteConfig.nav.map((item) => {
            const isActive = activeSection === item.href;
            return (
              <li key={item.href} className="relative flex h-full items-center py-2">
                <a
                  href={item.href}
                  className={cn(
                    "relative text-sm font-medium transition-colors duration-300 focus:outline-none px-1 py-1 select-none",
                    isActive ? "text-aether-text" : "text-aether-text-muted hover:text-aether-text"
                  )}
                >
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-line"
                      className="absolute -bottom-[22px] md:-bottom-[30px] left-0 right-0 h-[2px] bg-gradient-to-r from-aether-accent to-aether-cyan"
                      transition={NAV_ACTIVE_LINE_TRANSITION}
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Desktop Auth Controls */}
        <div className="hidden md:flex">
          <NavbarAuth user={user} />
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-aether-border bg-aether-surface/40 text-aether-text-muted transition-all hover:bg-aether-surface hover:text-aether-text active:scale-95 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </Container>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            variants={MOBILE_DRAWER_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="glass-strong border-t border-aether-border-strong/60 md:hidden bg-aether-bg/95 backdrop-blur-2xl overflow-hidden"
          >
            <Container className="flex flex-col gap-1 py-6">
              {siteConfig.nav.map((item, idx) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  variants={MOBILE_NAV_ITEM_VARIANTS}
                  custom={idx * 0.05}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-aether-text-muted transition-colors hover:bg-aether-surface hover:text-aether-text"
                  onClick={closeMobile}
                >
                  {item.label}
                </motion.a>
              ))}
              <div className="mt-4 border-t border-aether-border-strong/40 pt-6">
                <NavbarAuth
                  user={user}
                  layout="mobile"
                  onNavigate={closeMobile}
                />
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
