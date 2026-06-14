"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  SPRING_PRESETS,
} from "@/lib/motion";

export function NavbarShell() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [hoveredSection, setHoveredSection] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const prevScrollY = useRef(0);

  // ── Scroll Handler ───────────────────────────────────────────────
  // Morphs navbar from transparent → glass on scroll with smooth easing
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;

      setScrolled(scrollY > 20);
      prevScrollY.current = scrollY;

      if (totalScroll > 0) {
        setScrollProgress(Math.min((scrollY / totalScroll) * 100, 100));
      }
    };

    setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Section Observer ─────────────────────────────────────────────
  // Tracks which landing section is in view for the active underline
  useEffect(() => {
    if (typeof window === "undefined" || window.location.pathname !== "/") {
      return;
    }

    const sectionIds = siteConfig.nav
      .map((item) => item.href.replace("#", ""))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      },
      {
        root: null,
        rootMargin: "-30% 0px -60% 0px",
        threshold: 0,
      },
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // ── Body Scroll Lock ─────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-700 ease-out",
        scrolled
          ? "glass-strong border-b border-aether-border-strong/40 shadow-aether-navbar backdrop-blur-xl bg-aether-bg/80"
          : "bg-transparent border-b border-transparent",
      )}
    >
      {/* Scroll Progress Bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-aether-accent via-aether-cyan to-aether-accent origin-left"
        style={{ scaleX: scrollProgress / 100 }}
        transition={SPRING_PRESETS.snappy}
      />

      <Container
        as="nav"
        className="flex h-16 md:h-20 items-center justify-between gap-8 transition-all duration-500"
      >
        {/* Logo — increased prominence: 40px mobile, 56px desktop */}
        <Logo variant="nav" />

        {/* Desktop Navigation Links — centered hierarchy */}
        <ul className="hidden items-center gap-1 md:flex h-full">
          {siteConfig.nav.map((item) => {
            const isActive = activeSection === item.href;
            const isHovered = hoveredSection === item.href;

            return (
              <li key={item.href} className="relative flex h-full items-center">
                <a
                  href={item.href}
                  onMouseEnter={() => setHoveredSection(item.href)}
                  onMouseLeave={() => setHoveredSection("")}
                  className={cn(
                    "relative z-10 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 select-none",
                    isActive
                      ? "text-aether-text"
                      : "text-aether-text-muted hover:text-aether-text",
                  )}
                >
                  {item.label}

                  {/* Hover background pill — subtle rounded highlight behind text */}
                  {isHovered && !isActive && (
                    <motion.span
                      layoutId="nav-hover-bg"
                      className="absolute inset-0 -z-10 rounded-lg bg-aether-surface/40"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    />
                  )}

                  {/* Active section underline — animated via layoutId */}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-line"
                      className="absolute -bottom-[22px] md:-bottom-[30px] left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-aether-accent to-aether-cyan"
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
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 md:hidden",
            "border-aether-border bg-aether-surface/40 text-aether-text-muted",
            "hover:bg-aether-surface hover:text-aether-text hover:border-aether-border-strong",
            "active:scale-90",
          )}
          onClick={() => setMobileOpen((prev) => !prev)}
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