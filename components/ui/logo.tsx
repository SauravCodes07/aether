"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import logoImg from "../../public/logo.png";
import { motion } from "framer-motion";
import { SPRING_PRESETS } from "@/lib/motion";

type LogoProps = {
  className?: string;
  /** Set to `null` to render without a link (avoids nested anchors). Defaults to `/`. */
  href?: string | null;
  /** Size variant: "nav" (navbar), "auth" (auth pages), "footer" (footer) */
  variant?: "nav" | "auth" | "footer";
};

const sizeClasses = {
  nav: "h-9 md:h-12",
  auth: "h-12 md:h-16",
  footer: "h-9 md:h-12",
} as const;

/**
 * Aether logo — premium, minimal, with subtle ambient lighting and hover elevation.
 *
 * Design references: Railway, Linear, Arc Browser, Apple.
 *
 * - No obvious glow blobs or neon effects.
 * - Subtle ambient shadow on the logo itself.
 * - Hover lifts the logo smoothly (translate + shadow depth).
 * - Tap scales down for tactile feedback.
 * - Fast spring for snappy, premium feel.
 */
export function Logo({ className, href = "/", variant = "nav" }: LogoProps) {
  const classes = cn(
    "group relative inline-flex items-center justify-center select-none shrink-0",
    sizeClasses[variant],
    className,
  );

  const logoContent = (
    <motion.div
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={SPRING_PRESETS.snappy}
      className="relative flex h-full w-auto items-center justify-center"
    >
      {/* Subtle ambient light underneath — no obvious glow blob */}
      <div
        className="absolute inset-0 -z-10 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(139,92,246,0.12) 0%, transparent 70%)",
          filter: "blur(12px)",
        }}
        aria-hidden="true"
      />

      <Image
        src={logoImg}
        alt={siteConfig.name}
        className="h-full w-auto object-contain transition-all duration-300"
        style={{
          filter:
            "drop-shadow(0 2px 4px rgba(0,0,0,0.3)) drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
        }}
        priority
      />
    </motion.div>
  );

  if (href === null) {
    return (
      <span className={classes}>
        {logoContent}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        classes,
        "transition-opacity duration-200 hover:opacity-90 active:opacity-80",
      )}
      aria-label={`${siteConfig.name} home`}
      prefetch={true}
    >
      {logoContent}
    </Link>
  );
}