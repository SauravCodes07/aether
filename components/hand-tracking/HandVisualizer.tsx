"use client";

import { useRef, useEffect, useCallback } from "react";
import {
  HAND_CONNECTIONS,
  FINGER_TIPS,
  type Landmark,
  type GestureType,
  type GestureInteraction,
} from "@/lib/hand-tracking";

// ── Particle System ─────────────────────────────────────────────────────────

type Particle = {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; size: number; hue: number;
};

// ── Colors ──────────────────────────────────────────────────────────────────

const C = {
  cyan: [170, 80, 55],
  purple: [270, 70, 60],
  bright: [200, 90, 60],
  palm: [220, 60, 50],
  glow: [190, 80, 50],
  pinch: [20, 90, 55],
  grab: [40, 85, 50],
  spread: [280, 75, 55],
} as const;

const hsl = (h: number, s: number, l: number, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;

// ── Props ───────────────────────────────────────────────────────────────────

export type HandVisualizerProps = {
  landmarks: Landmark[][] | null;
  gesture: GestureType;
  interaction: GestureInteraction;
  confidence: number;
  handedness: string | null;
  width: number;
  height: number;
  showLabels?: boolean;
  showParticles?: boolean;
  showTrails?: boolean;
};

// ── Main Component ──────────────────────────────────────────────────────────

export default function HandVisualizer({
  landmarks,
  gesture,
  interaction,
  confidence,
  handedness,
  width,
  height,
  showLabels = true,
  showParticles = true,
  showTrails = true,
}: HandVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const trailsRef = useRef<Map<number, Array<{ x: number; y: number; t: number }>>>(new Map());
  const burstRef = useRef<number>(0);
  const prevGestureRef = useRef<GestureType>("none");
  const timeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(performance.now());

  // Detect gesture change for particle burst
  if (gesture !== prevGestureRef.current) {
    if (gesture !== "none" && landmarks?.[0]) {
      burstRef.current = 20; // Spawn 20 particles on gesture change
      for (const tip of FINGER_TIPS) {
        const lm = landmarks[0][tip];
        if (lm) spawnParticles(lm.x, lm.y, 4, getGestureHue(gesture));
      }
    }
    prevGestureRef.current = gesture;
  }

  function getGestureHue(g: GestureType): number {
    if (g === "pinch") return C.pinch[0];
    if (g === "grab") return C.grab[0];
    if (g === "finger_spread") return C.spread[0];
    return C.bright[0];
  }

  function spawnParticles(x: number, y: number, count: number, hue: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.001 + Math.random() * 0.004;
      particlesRef.current.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 0, maxLife: 0.3 + Math.random() * 0.5, size: 2 + Math.random() * 4, hue,
      });
    }
  }

  function updateParticles(dt: number) {
    particlesRef.current = particlesRef.current.filter(p => {
      p.life += dt; p.x += p.vx; p.y += p.vy; p.vx *= 0.96; p.vy *= 0.96;
      return p.life < p.maxLife;
    });
  }

  function updateTrails(hands: Landmark[][]) {
    const trails = trailsRef.current;
    const now = performance.now();
    for (let hi = 0; hi < hands.length; hi++) {
      for (const tip of FINGER_TIPS) {
        const key = hi * 100 + tip;
        const lm = hands[hi][tip];
        if (!lm) continue;
        let trail = trails.get(key);
        if (!trail) { trail = []; trails.set(key, trail); }
        trail.push({ x: lm.x, y: lm.y, t: now });
        while (trail.length > 0 && now - trail[0].t > 250) trail.shift();
      }
    }
    for (const [key, trail] of trails) {
      if (!trail.length || now - trail[trail.length - 1].t > 600) trails.delete(key);
    }
  }

  // ── Render Loop ──────────────────────────────────────────────────────────

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const now = performance.now();
    const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = now;
    timeRef.current += dt;

    updateParticles(dt);
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.scale(width, height);

    if (landmarks && landmarks.length > 0) {
      if (showTrails) updateTrails(landmarks);
      if (showTrails) drawTrails(ctx, trailsRef.current);

      for (let hi = 0; hi < landmarks.length; hi++) {
        drawHand(ctx, landmarks[hi], gesture, confidence, timeRef.current, hi === 0);

        // Spawn particles during active gestures
        if (showParticles && gesture !== "none" && Math.random() > 0.85) {
          const tip = FINGER_TIPS[Math.floor(Math.random() * 5)];
          const lm = landmarks[hi][tip];
          if (lm) spawnParticles(lm.x, lm.y, 1, getGestureHue(gesture));
        }
      }

      if (showParticles) drawParticles(ctx, particlesRef.current);
      if (gesture !== "none") {
        const palm = landmarks[0][9] || landmarks[0][0];
        if (palm) drawGestureHUD(ctx, palm.x, palm.y, gesture, interaction, confidence, timeRef.current);
      }
      drawConfidenceArc(ctx, confidence);
      if (handedness && landmarks[0]?.[0]) {
        const w = landmarks[0][0];
        ctx.fillStyle = hsl(C.purple[0], 40, 50, 0.5);
        ctx.font = "10px monospace"; ctx.textAlign = "center";
        ctx.fillText(handedness, w.x, w.y + 0.04);
      }
    }

    if (showLabels && landmarks?.[0]) drawLabels(ctx, landmarks[0]);
    ctx.restore();
    rafRef.current = requestAnimationFrame(render);
  }, [landmarks, gesture, interaction, confidence, handedness, width, height, showLabels, showParticles, showTrails]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(render);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [render]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ width: "100%", height: "100%" }} />;
}

// ── Hand Drawing (premium quality) ──────────────────────────────────────────
// NOTE: Landmarks are already in DISPLAY space (1-x applied by transformLandmark).
// Do NOT apply another flip here.

function drawHand(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  gesture: GestureType,
  conf: number,
  time: number,
  isPrimary: boolean,
) {
  const isGrab = gesture === "grab";
  const isPinch = gesture === "pinch";
  const isSpread = gesture === "finger_spread";
  const pulse = 0.5 + 0.5 * Math.sin(time * 3.5);
  const pulse2 = 0.5 + 0.5 * Math.sin(time * 2.3 + 1);

  const getHue = () => isPinch ? C.pinch[0] : isGrab ? C.grab[0] : isSpread ? C.spread[0] : C.cyan[0];

  // ── Skeletal connections (3-pass glow) ──
  for (const [s, e] of HAND_CONNECTIONS) {
    const p1 = landmarks[s], p2 = landmarks[e];
    if (!p1 || !p2) continue;

    const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
    const h = getHue();
    gradient.addColorStop(0, hsl(h, C.cyan[1], C.cyan[2], 0.9));
    gradient.addColorStop(1, hsl(C.purple[0], C.purple[1], C.purple[2], 0.9));

    // Pass 1: Outer glow
    ctx.strokeStyle = hsl(h, 60, 45, 0.12 * conf);
    ctx.lineWidth = (isPrimary ? 0.008 : 0.005) * (1 + pulse * 0.2);
    ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();

    // Pass 2: Gradient bone
    ctx.strokeStyle = gradient;
    ctx.lineWidth = isPrimary ? 0.003 : 0.002;
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();

    // Pass 3: Bright core
    ctx.strokeStyle = hsl(h, 30, 92, 0.5 * conf);
    ctx.lineWidth = isPrimary ? 0.001 : 0.0007;
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
  }

  // ── Fingertip bloom ──
  for (const tip of FINGER_TIPS) {
    const lm = landmarks[tip];
    if (!lm) continue;
    const h = getHue();
    const r = 0.018 * (1 + pulse * 0.3);

    // Bloom gradient
    const grad = ctx.createRadialGradient(lm.x, lm.y, 0, lm.x, lm.y, r);
    grad.addColorStop(0, hsl(h, 80, 65, 0.5 * conf));
    grad.addColorStop(0.4, hsl(h, 70, 50, 0.15 * conf));
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(lm.x, lm.y, r, 0, Math.PI * 2); ctx.fill();

    // Core dot
    ctx.fillStyle = hsl(h, 40, 90, 0.95 * conf);
    ctx.beginPath(); ctx.arc(lm.x, lm.y, isPrimary ? 0.005 : 0.003, 0, Math.PI * 2); ctx.fill();

    // Pulse ring
    ctx.strokeStyle = hsl(h, 50, 70, (0.2 + pulse * 0.15) * conf);
    ctx.lineWidth = 0.0006;
    ctx.beginPath(); ctx.arc(lm.x, lm.y, 0.009 + pulse2 * 0.003, 0, Math.PI * 2); ctx.stroke();
  }

  // ── Palm energy core ──
  const palm = landmarks[9] || landmarks[0];
  if (palm) {
    const pr = 0.022 + pulse * 0.008;

    // Outer pulse ring
    ctx.strokeStyle = hsl(C.palm[0], 50, 55, (0.15 + pulse * 0.12) * conf);
    ctx.lineWidth = 0.0006;
    ctx.beginPath(); ctx.arc(palm.x, palm.y, pr, 0, Math.PI * 2); ctx.stroke();

    // Second ring
    ctx.strokeStyle = hsl(C.palm[0], 40, 65, (0.08 + pulse2 * 0.08) * conf);
    ctx.beginPath(); ctx.arc(palm.x, palm.y, pr + 0.008, 0, Math.PI * 2); ctx.stroke();

    // Inner glow
    const pg = ctx.createRadialGradient(palm.x, palm.y, 0, palm.x, palm.y, 0.015);
    pg.addColorStop(0, hsl(C.palm[0], 55, 60, 0.35 * conf));
    pg.addColorStop(1, "transparent");
    ctx.fillStyle = pg;
    ctx.beginPath(); ctx.arc(palm.x, palm.y, 0.015, 0, Math.PI * 2); ctx.fill();

    // Core dot
    ctx.fillStyle = hsl(C.palm[0], 45, 78, 0.8 * conf);
    ctx.beginPath(); ctx.arc(palm.x, palm.y, 0.004, 0, Math.PI * 2); ctx.fill();
  }

  // ── Wrist glow ──
  const wrist = landmarks[0];
  if (wrist) {
    const wg = ctx.createRadialGradient(wrist.x, wrist.y, 0, wrist.x, wrist.y, 0.012);
    wg.addColorStop(0, hsl(C.glow[0], 60, 50, 0.2 * conf));
    wg.addColorStop(1, "transparent");
    ctx.fillStyle = wg;
    ctx.beginPath(); ctx.arc(wrist.x, wrist.y, 0.012, 0, Math.PI * 2); ctx.fill();
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    const progress = p.life / p.maxLife;
    const alpha = (1 - progress) * 0.9;
    const size = p.size * (1 - progress * 0.6);

    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size / 40);
    grad.addColorStop(0, hsl(p.hue, 80, 70, alpha));
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(p.x, p.y, size / 40, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = hsl(p.hue, 50, 92, alpha);
    ctx.beginPath(); ctx.arc(p.x, p.y, size / 150, 0, Math.PI * 2); ctx.fill();
  }
}

function drawTrails(ctx: CanvasRenderingContext2D, trails: Map<number, Array<{ x: number; y: number; t: number }>>) {
  const now = performance.now();
  for (const [, trail] of trails) {
    if (trail.length < 2) continue;

    // Smooth bezier trail
    ctx.beginPath();
    ctx.moveTo(trail[0].x, trail[0].y);
    for (let i = 1; i < trail.length; i++) {
      const prev = trail[i - 1]!, curr = trail[i]!;
      const mx = (prev.x + curr.x) / 2, my = (prev.y + curr.y) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
    }

    const age = now - trail[trail.length - 1]!.t;
    const alpha = Math.max(0, 1 - age / 250) * 0.4;
    ctx.strokeStyle = hsl(C.bright[0], 65, 60, alpha);
    ctx.lineWidth = 0.002;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.stroke();

    // Bright head
    const last = trail[trail.length - 1]!;
    const ha = Math.max(0, 1 - (now - last.t) / 120) * 0.7;
    ctx.fillStyle = hsl(C.bright[0], 55, 78, ha);
    ctx.beginPath(); ctx.arc(last.x, last.y, 0.004, 0, Math.PI * 2); ctx.fill();
  }
}

function drawGestureHUD(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  gesture: GestureType,
  interaction: GestureInteraction,
  conf: number,
  time: number,
) {
  const label = gesture.replace(/_/g, " ").toUpperCase();
  const pulse = 0.8 + 0.2 * Math.sin(time * 4);
  const hue = gesture === "pinch" ? C.pinch[0] : gesture === "grab" ? C.grab[0] :
    gesture === "finger_spread" ? C.spread[0] : C.bright[0];

  ctx.save();
  ctx.textAlign = "center"; ctx.textBaseline = "middle";

  // Background pill
  const textW = ctx.measureText(label).width / 100 + 0.03;
  ctx.fillStyle = hsl(hue, 35, 12, 0.7 * pulse);
  ctx.beginPath();
  ctx.roundRect(x - textW / 2, y - 0.018, textW, 0.036, 0.008);
  ctx.fill();

  // Border glow
  ctx.strokeStyle = hsl(hue, 55, 50, 0.4 * pulse * conf);
  ctx.lineWidth = 0.0004;
  ctx.beginPath();
  ctx.roundRect(x - textW / 2, y - 0.018, textW, 0.036, 0.008);
  ctx.stroke();

  // Gesture text
  ctx.fillStyle = hsl(hue, 45, 82, 0.95 * conf);
  ctx.font = "bold 10px monospace";
  ctx.fillText(label, x, y);

  // Interaction indicator
  if (interaction !== "idle") {
    ctx.fillStyle = hsl(hue, 40, 60, 0.6 * conf);
    ctx.font = "8px monospace";
    ctx.fillText(`→ ${interaction}`, x, y + 0.025);
  }

  ctx.restore();
}

function drawConfidenceArc(ctx: CanvasRenderingContext2D, conf: number) {
  const cx = 0.04, cy = 0.96, r = 0.02;
  const hue = conf > 0.7 ? 140 : conf > 0.4 ? 50 : 0;

  // Background arc
  ctx.strokeStyle = hsl(0, 0, 30, 0.2);
  ctx.lineWidth = 0.002;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

  // Confidence arc
  ctx.strokeStyle = hsl(hue, 65, 50, 0.7);
  ctx.lineWidth = 0.003;
  ctx.lineCap = "round";
  ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * conf); ctx.stroke();

  // Label
  ctx.fillStyle = hsl(0, 0, 65, 0.5);
  ctx.font = "7px monospace"; ctx.textAlign = "center";
  ctx.fillText(`${Math.round(conf * 100)}%`, cx, cy + r + 0.012);
}

function drawLabels(ctx: CanvasRenderingContext2D, landmarks: Landmark[]) {
  ctx.font = "7px monospace"; ctx.textAlign = "center";
  ctx.fillStyle = hsl(C.cyan[0], 35, 55, 0.35);
  for (const i of [0, 4, 8, 12, 16, 20]) {
    const lm = landmarks[i];
    if (lm) ctx.fillText(String(i), lm.x, lm.y + 0.022);
  }
}