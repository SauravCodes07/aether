"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import logoImg from "../../public/logo.png";
import { motion } from "framer-motion";
import { SCALE_HOVER_VARIANTS, HOVER_TAP_TRANSITION } from "@/lib/motion";

type LogoProps = {
  className?: string;
  showIcon?: boolean;
  /** Set to `null` to render without a link (avoids nested anchors). Defaults to `/`. */
  href?: string | null;
};

export function Logo(props: LogoProps) {
  const { className, href = "/" } = props;
  const classes = cn(
    "group relative inline-flex items-center justify-center transition-all duration-300 select-none",
    className,
  );

  const logoContent = (
    <motion.div
      variants={SCALE_HOVER_VARIANTS}
      whileHover="hover"
      whileTap="tap"
      transition={HOVER_TAP_TRANSITION}
      className="relative flex h-full w-auto items-center justify-center"
    >
      {/* Background glow orb that animates on hover */}
      <div className="absolute -inset-2 -z-10 bg-gradient-to-r from-aether-accent/20 to-aether-cyan/10 blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-full" />
      
      <Image
        src={logoImg}
        alt={siteConfig.name}
        className="h-full w-auto object-contain drop-shadow-[0_0_10px_rgba(139,92,246,0.3)] transition-all duration-300 group-hover:drop-shadow-[0_0_18px_rgba(139,92,246,0.6)]"
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
    <Link href={href} className={classes} aria-label={`${siteConfig.name} home`}>
      {logoContent}
    </Link>
  );
}

