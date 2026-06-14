"use client";

import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Client-side component to handle cinematic scroll parallax effects.
 * Extracted from the main page to keep the route as a Server Component.
 */
export function PageEffects() {
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <motion.div style={{ y: backgroundY }} className="ambient-bg">
      <div className="aurora-bg h-full w-full">
        <div className="aurora-layer-3" />
        <div className="aurora-layer-4" />
      </div>
      <div className="depth-fog" />
    </motion.div>
  );
}