"use client";

import { useRef } from "react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { motion } from "framer-motion";
import {
  FADE_UP_VARIANTS,
  SECTION_REVEAL_VARIANTS,
  PARALLAX_LAYER_VARIANTS,
} from "@/lib/motion";
import { SpatialCanvas } from "@/components/ui/spatial-canvas";

/**
 * Hero — interactive product-first workspace showcase.
 *
 * Communicates "Aether is a spatial computing platform" within 3 seconds.
 * Features layered depth, floating panels, cursor-responsive perspective,
 * live activity indicators, and a feeling of a living product.
 *
 * References: Railway, Linear, Cursor, Arc Browser.
 */
export function Hero() {
  const spotlightRef = useRef<HTMLDivElement>(null);

  /** Cursor-reactive spotlight via CSS custom properties */
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!spotlightRef.current) return;
    const rect = spotlightRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    spotlightRef.current.style.setProperty("--mouse-x", `${x}%`);
    spotlightRef.current.style.setProperty("--mouse-y", `${y}%`);
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative flex min-h-[95vh] items-center pt-20 overflow-hidden"
    >
      {/* Grid pattern background */}
      <div className="grid-pattern absolute inset-0" aria-hidden="true" />

      {/* Aurora background ribbons */}
      <div className="aurora-bg absolute inset-0" aria-hidden="true" />

      {/* Ambient glow orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 60%)",
          filter: "blur(80px)",
          animation: "aurora-drift 25s infinite alternate ease-in-out",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 60%)",
          filter: "blur(80px)",
          animation: "aurora-drift-reverse 30s infinite alternate ease-in-out",
        }}
      />

      <Container className="relative z-10 py-16 sm:py-24">
        {/* ─── Copy ─────────────────────────────────────────────── */}
        <motion.div 
          variants={FADE_UP_VARIANTS}
          initial="hidden"
          animate="visible"
          custom={0.15}
          className="mx-auto max-w-3xl text-center"
        >
          <Badge variant="accent" className="mb-6">
            AI-Powered Spatial Computing
          </Badge>

          <h1 className="heading-xl text-gradient mb-6">
            {siteConfig.tagline}
          </h1>

          <p className="body-lg mx-auto mb-10 max-w-2xl">
            {siteConfig.description}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" href={siteConfig.links.workspace}>
              Launch Workspace
              <svg
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Button>
            <Button variant="outline" size="lg" href="#features">
              Explore Features
            </Button>
          </div>
        </motion.div>

        {/* ─── Interactive Workspace ────────────────────────────── */}
        <motion.div
          ref={spotlightRef}
          onMouseMove={handleMouseMove}
          variants={SECTION_REVEAL_VARIANTS}
          initial="hidden"
          animate="visible"
          className="spotlight relative mx-auto mt-16 max-w-5xl select-none"
        >
          {/* Subtle depth glow behind workspace */}
          <div
            className="absolute -inset-8 rounded-3xl opacity-30 blur-2xl"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.1) 0%, transparent 70%)",
            }}
          />

          {/* Main workspace window */}
          <div className="relative rounded-2xl border border-aether-border-strong/60 bg-aether-bg-elevated/90 shadow-aether-xl ring-1 ring-white/[0.04] overflow-hidden">
            {/* Title bar */}
            <div className="flex items-center justify-between border-b border-aether-border/50 px-4 py-3 bg-aether-surface/30">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/70" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <span className="h-3 w-3 rounded-full bg-green-500/70" />
                <span className="ml-3 text-xs text-aether-text-subtle font-mono">
                  aether — workspace.3d
                </span>
              </div>
              {/* Live indicator */}
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aether-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-aether-success" />
                </span>
                <span className="text-xs text-aether-text-subtle">Live</span>
              </div>
            </div>

            {/* ─── Operational Workspace Layout ─────────────────── */}
            <div className="relative flex h-[500px] w-full overflow-hidden bg-aether-bg/50">
              
              {/* LEFT: Scene Graph */}
              <motion.aside 
                variants={PARALLAX_LAYER_VARIANTS}
                custom={0}
                className="hidden w-64 flex-col border-r border-aether-border/50 bg-aether-surface/20 p-4 md:flex"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="label-sm !tracking-normal !text-[10px]">Hierarchy</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-aether-accent" />
                </div>
                <div className="space-y-1">
                  {["Environment", "Sun Light", "Orbit Camera", "Mesh_Player", "Node_Graph"].map((item, i) => (
                    <div key={item} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-aether-text-muted hover:bg-aether-surface/60 transition-colors cursor-default">
                      <div className="h-3 w-3 border border-aether-border-strong rounded-sm" />
                      {item}
                    </div>
                  ))}
                </div>
              </motion.aside>

              {/* CENTER: Spatial Canvas (The Operational Heart) */}
              <main className="relative flex-1 p-6">
                <SpatialCanvas />
              </main>

              {/* RIGHT: AI Assistant & Generation */}
              <motion.aside 
                variants={PARALLAX_LAYER_VARIANTS}
                custom={1}
                className="hidden w-72 flex-col border-l border-aether-border/50 bg-aether-surface/20 p-4 lg:flex"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="label-sm !tracking-normal !text-[10px]">AI Assistant</span>
                  <span className="flex h-2 w-2"><span className="animate-ping absolute h-2 w-2 rounded-full bg-aether-accent opacity-75"/><span className="h-2 w-2 rounded-full bg-aether-accent"/></span>
                </div>
                <div className="space-y-4">
                  <div className="rounded-lg border border-aether-border bg-aether-bg-elevated/80 p-3 shadow-aether-sm">
                    <p className="text-[11px] leading-relaxed text-aether-text-muted">
                      Generating high-fidelity PBR textures for <span className="text-aether-cyan">Mesh_Player</span>...
                    </p>
                    <div className="mt-2 h-1 w-full rounded-full bg-aether-border overflow-hidden">
                      <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "65%" }}
                        transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
                        className="h-full bg-gradient-to-r from-aether-accent to-aether-cyan" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2 opacity-50">
                    <div className="h-8 w-full rounded bg-aether-surface/60" />
                    <div className="h-8 w-full rounded bg-aether-surface/60" />
                  </div>
                </div>
              </motion.aside>

              {/* BOTTOM: Status Bar */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-aether-border/50 bg-aether-surface/40 px-4 py-2 backdrop-blur-md">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-aether-success" />
                    <span className="text-[10px] text-aether-text-subtle font-mono">us-east-1 · 12ms</span>
                  </div>
                  <div className="h-3 w-px bg-aether-border" />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-aether-text-subtle font-mono uppercase tracking-tighter">v2.4.1-stable</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1.5">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-5 w-5 rounded-full border border-aether-bg bg-aether-surface flex items-center justify-center text-[8px] text-aether-text-muted">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] text-aether-text-subtle">Multiplayer</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </motion.section>
  );
}