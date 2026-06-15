"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSpotlight } from "@/hooks/use-spotlight";
import { DATA_FLOW_VARIANTS, CARD_HOVER_VARIANTS } from "@/lib/motion";

type SpatialNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  size: "sm" | "md" | "lg";
  pulseColor?: string;
  orbitRadius?: number;
  orbitSpeed?: number;
};

type SpatialEdge = {
  source: string;
  target: string;
  animated?: boolean;
};

const demoNodes: SpatialNode[] = [
  { id: "core", label: "Aether", x: 50, y: 50, size: "lg", pulseColor: "#A871F7" },
  { id: "ai", label: "AI", x: 30, y: 30, size: "md", pulseColor: "#22D3EE", orbitRadius: 15, orbitSpeed: 12 },
  { id: "deploy", label: "Deploy", x: 70, y: 35, size: "md", pulseColor: "#4ADE80", orbitRadius: 12, orbitSpeed: 15 },
  { id: "canvas", label: "Canvas", x: 25, y: 65, size: "md", pulseColor: "#FB923C", orbitRadius: 10, orbitSpeed: 10 },
  { id: "collab", label: "Collab", x: 72, y: 68, size: "md", pulseColor: "#F472B6", orbitRadius: 14, orbitSpeed: 14 },
  { id: "data", label: "Data", x: 50, y: 78, size: "sm", pulseColor: "#FBBF24", orbitRadius: 8, orbitSpeed: 18 },
  { id: "api", label: "API", x: 45, y: 20, size: "sm", pulseColor: "#60A5FA", orbitRadius: 9, orbitSpeed: 16 },
];

const demoEdges: SpatialEdge[] = [
  { source: "core", target: "ai", animated: true },
  { source: "core", target: "deploy", animated: true },
  { source: "core", target: "canvas", animated: true },
  { source: "core", target: "collab", animated: true },
  { source: "core", target: "data" },
  { source: "core", target: "api" },
  { source: "ai", target: "deploy" },
  { source: "canvas", target: "collab" },
  { source: "ai", target: "data" },
  { source: "deploy", target: "api" },
];

const sizeMap = { sm: 6, md: 10, lg: 14 };

function SpatialCanvas() {
  const { ref, onMouseMove } = useSpotlight();
  const [time, setTime] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      setTime((t) => t + 0.016);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const width = 100;
  const height = 100;

  const getNodePos = useCallback(
    (node: SpatialNode) => {
      if (node.orbitRadius) {
        const angle = time * (node.orbitSpeed ?? 10) * 0.1;
        return {
          x: node.x + node.orbitRadius * Math.cos(angle) / 1.5,
          y: node.y + node.orbitRadius * Math.sin(angle) / 2,
        };
      }
      return { x: node.x, y: node.y };
    },
    [time],
  );

  return (
    <div
      ref={(el) => {
        (ref as React.MutableRefObject<HTMLElement | null>).current = el;
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }}
      onMouseMove={onMouseMove}
      className={cn(
        "spotlight relative w-full h-full min-h-[400px] overflow-hidden",
        "bg-aether-bg rounded-aether-2xl border border-aether-border/30",
      )}
    >
      {/* Background particles */}
      <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {/* Edges */}
        {demoEdges.map((edge, i) => {
          const source = demoNodes.find((n) => n.id === edge.source);
          const target = demoNodes.find((n) => n.id === edge.target);
          if (!source || !target) return null;
          const s = getNodePos(source);
          const t = getNodePos(target);

          return (
            <motion.line
              key={`edge-${i}`}
              x1={s.x}
              y1={s.y}
              x2={t.x}
              y2={t.y}
              stroke={edge.animated ? "url(#gradFlow)" : "rgba(255,255,255,0.08)"}
              strokeWidth={edge.animated ? 0.3 : 0.2}
              variants={edge.animated ? DATA_FLOW_VARIANTS : undefined}
              animate={edge.animated ? "animate" : undefined}
              strokeLinecap="round"
            />
          );
        })}

        <defs>
          <linearGradient id="gradFlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A871F7" stopOpacity={0.6} />
            <stop offset="50%" stopColor="#22D3EE" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#A871F7" stopOpacity={0.6} />
          </linearGradient>
          <radialGradient id="nodeGlow">
            <stop offset="0%" stopColor="currentColor" stopOpacity={0.3} />
            <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* Nodes */}
        {demoNodes.map((node) => {
          const pos = getNodePos(node);
          const s = sizeMap[node.size];

          return (
            <g key={node.id}>
              {/* Pulse ring */}
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={s * 2.5}
                fill="none"
                stroke={node.pulseColor ?? "#A871F7"}
                strokeWidth={0.2}
                strokeOpacity={0.4}
                animate={{ r: [s * 1.5, s * 3.5, s * 1.5], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.5 + Math.random() * 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Glow */}
              <circle cx={pos.x} cy={pos.y} r={s * 1.8} fill={`url(#nodeGlow)`} color={node.pulseColor} />
              {/* Core */}
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={s * 0.8}
                fill={node.pulseColor ?? "#A871F7"}
                initial={{ opacity: 0.7 }}
                animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.1, 1] }}
                transition={{ duration: 2 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Label */}
              <text
                x={pos.x}
                y={pos.y + s + 5}
                textAnchor="middle"
                className="fill-aether-text-subtle select-none"
                style={{ fontSize: "2.5px" }}
              >
                {node.label}
              </text>
            </g>
          );
        })}

        {/* Data flow particles */}
        {demoEdges
          .filter((e) => e.animated)
          .map((edge, i) => {
            const source = demoNodes.find((n) => n.id === edge.source);
            const target = demoNodes.find((n) => n.id === edge.target);
            if (!source || !target) return null;
            const s = getNodePos(source);
            const t = getNodePos(target);
            const progress = ((time * 0.3 + i * 0.7) % 2) / 2;

            return (
              <motion.circle
                key={`flow-${i}`}
                cx={s.x + (t.x - s.x) * progress}
                cy={s.y + (t.y - s.y) * progress}
                r={0.6}
                fill="#22D3EE"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
              />
            );
          })}
      </svg>

      {/* Glass overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-aether-bg/60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-aether-bg/30 pointer-events-none" />
    </div>
  );
}

const MotionDiv = motion.div;

type SpatialCanvasCardProps = {
  children: React.ReactNode;
  className?: string;
};

function SpatialCanvasCard({ children, className }: SpatialCanvasCardProps) {
  return (
    <MotionDiv
      className={cn(
        "relative overflow-hidden rounded-aether-xl border border-aether-border/30 bg-aether-surface/50 p-5",
        "before:absolute before:inset-0 before:z-0 before:opacity-0 before:transition-opacity before:duration-500",
        "before:bg-[radial-gradient(600px_circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(255,255,255,0.04),transparent_40%)]",
        "hover:before:opacity-100",
        className,
      )}
      variants={CARD_HOVER_VARIANTS}
      initial="rest"
      whileHover="hover"
    >
      <div className="relative z-10">{children}</div>
    </MotionDiv>
  );
}

export { SpatialCanvas, SpatialCanvasCard };