"use client";

import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CARD_HOVER_VARIANTS, MICRO_INTERACTION_TRANSITION } from "@/lib/motion";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  spotlight?: boolean;
  tilt?: boolean;
};

/**
 * Premium interactive card with hover tilt, spotlight, and depth.
 * Phase 1C spec: Linear / Arc quality interactions.
 */
export function Card({ children, className, hover = false, spotlight = true, tilt = true }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Spotlight tracking
      if (spotlight) {
        cardRef.current.style.setProperty("--mouse-x", `${x}px`);
        cardRef.current.style.setProperty("--mouse-y", `${y}px`);
      }

      // Tilt effect
      if (tilt) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;
        cardRef.current.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(2px)`;
      }
    },
    [spotlight, tilt],
  );

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    if (tilt) {
      cardRef.current.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
    }
  }, [tilt]);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      variants={CARD_HOVER_VARIANTS}
      initial="rest"
      whileHover="hover"
      transition={MICRO_INTERACTION_TRANSITION}
      className={cn(
        "spotlight-card rounded-xl border border-aether-border bg-aether-surface/50 p-6 transition-colors duration-300",
        "before:absolute before:inset-0 before:z-0 before:opacity-0 before:transition-opacity before:duration-500",
        "before:bg-[radial-gradient(600px_circle_at_var(--mouse-x,0px)_var(--mouse-y,0px),rgba(139,92,246,0.06),transparent_40%)]",
        "hover:before:opacity-100",
        hover &&
          "hover:border-aether-border-strong hover:bg-aether-surface hover:shadow-aether-lg",
        className,
      )}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </motion.div>
  );
}