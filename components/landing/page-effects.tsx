"use client";

import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Global background engine — one continuous aurora + mesh + grid system
 * that spans the entire page. Layer speeds differ for parallax depth.
 */
export function PageEffects() {
  const { scrollYProgress } = useScroll();
  const auroraY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const meshY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const gridY = useTransform(scrollYProgress, [0, 1], ["0%", "5%"]);
  const fogOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.2, 0.4, 0.6, 0.8]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Deep aurora layer — slow parallax */}
      <motion.div
        className="absolute inset-0 aurora-bg"
        style={{ y: auroraY }}
      >
        <div className="aurora-layer-3" />
      </motion.div>

      {/* Mesh gradient — mid-speed parallax */}
      <motion.div
        className="absolute inset-0 mesh-bg"
        style={{ y: meshY }}
      />

      {/* Depth fog — intensifies down the page */}
      <motion.div
        className="absolute inset-0"
        style={{ opacity: fogOpacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-aether-bg/20 to-aether-bg/50" />
      </motion.div>

      {/* Grid pattern — subtle, slowest */}
      <motion.div
        className="absolute inset-0 grid-pattern"
        style={{ y: gridY }}
      />
    </div>
  );
}