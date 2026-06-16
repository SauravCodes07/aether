"use client";

import { useRef, useEffect, useCallback } from "react";
import {
  LANDMARK_NAMES,
  HAND_CONNECTIONS,
  FINGER_TIPS,
  type Landmark,
  type GestureType,
} from "@/lib/hand-tracking";

// ── Particle System ─────────────────────────────────────────────────────────

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
};

// ── Visualization Config ────────────────────────────────────────────────────

const COLORS = {
  primary: { h: 170, s: 80, l: 55 },      // Cyan
  secondary: { h: 270, s: 70, l: 60 },     // Purple
  accent: { h: 200, s: 90, l: 60 },        // Bright cyan
  palm: { h: 220, s: 60, l: 50 },          // Blue-violet
  glow: { h: 190, s: 80, l: 50 },          // Glow
  pinch: { h: 20, s: 90, l: 55 },          // Orange
  grab: { h: 40, s: 85, l: 50 },           // Amber
};

function hsl(h: number, s: number, l: number, a = 1): string {
  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

// ── Main Renderer ───────────────────────────────────────────────────────────

export type HandVisualizerProps = {
  landmarks: Landmark[][] | null;
  gesture: GestureType;
  confidence: number;
  handedness: string | null;
  width: number;
  height: number;
  showLabels?: boolean;
  showParticles?: boolean;
  showTrails?: boolean;
};

export default function HandVisualizer({
  landmarks,
  gesture,
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
  const prevLandmarksRef = useRef<Landmark[][] | null>(null);
  const timeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(performance.now());

  // ── Particle Management ──────────────────────────────────────────────────

  const spawnParticles = useCallback((x: number, y: number, count: number, hue: number) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.0005 + Math.random() * 0.002;
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.4 + Math.random() * 0.6,
        size: 1 + Math.random() * 3,
        hue,
      });
    }
  }, []);

  const updateParticles = useCallback((dt: number) => {
    particlesRef.current = particlesRef.current.filter(p => {
      p.life += dt;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;
      return p.life < p.maxLife;
    });
  }, []);

  // ── Trail Management ─────────────────────────────────────────────────────

  const updateTrails = useCallback((hands: Landmark[][]) => {
    const trails = trailsRef.current;
    const now = performance.now();

    for (let hi = 0; hi < hands.length; hi++) {
      const hand = hands[hi];
      const tipIndices = [4, 8, 12, 16, 20];
      for (const tip of tipIndices) {
        const key = hi * 100 + tip;
        const lm = hand[tip];
        if (!lm) continue;
        let trail = trails.get(key);
        if (!trail) { trail = []; trails.set(key, trail); }
        trail.push({ x: lm.x, y: lm.y, t: now });
        // Keep last 200ms
        while (trail.length > 0 && now - trail[0].t > 200) trail.shift();
      }
    }

    // Clean old trails
    for (const [key, trail] of trails) {
      if (trail.length === 0 || now - trail[trail.length - 1].t > 500) {
        trails.delete(key);
      }
    }
  }, []);

  // ── Main Render Loop ─────────────────────────────────────────────────────

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const now = performance.now();
    const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = now;
    timeRef.current += dt;

    // Update particles
    updateParticles(dt);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.scale(width, height);

    if (landmarks && landmarks.length > 0) {
      // Update trails
      if (showTrails) updateTrails(landmarks);

      // Draw trails first (behind everything)
      if (showTrails) {
        drawTrails(ctx, trailsRef.current);
      }

      // Draw each hand
      for (let hi = 0; hi < landmarks.length; hi++) {
        const hand = landmarks[hi];
        drawHand(ctx, hand, gesture, confidence, timeRef.current, hi === 0);

        // Spawn fingertip particles
        if (showParticles && gesture !== "none") {
          const hue = gesture === "pinch" ? COLORS.pinch.h : gesture === "grab" ? COLORS.grab.h : COLORS.accent.h;
          for (const tip of FINGER_TIPS) {
            const lm = hand[tip];
            if (lm && Math.random() > 0.7) {
              spawnParticles(lm.x, lm.y, 1, hue);
            }
          }
        }
      }

      // Draw particles (on top)
      if (showParticles) {
        drawParticles(ctx, particlesRef.current);
      }

      // Draw gesture label
      if (gesture !== "none") {
        const palm = landmarks[0][9] || landmarks[0][0];
        if (palm) drawGestureLabel(ctx, palm.x, palm.y - 0.06, gesture, confidence, timeRef.current);
      }

      // Draw confidence bar
      if (landmarks[0]) {
        drawConfidenceBar(ctx, confidence);
      }

      // Draw handedness
      if (handedness && landmarks[0]) {
        const wrist = landmarks[0][0];
        if (wrist) {
          ctx.fillStyle = hsl(COLORS.secondary.h, 50, 40, 0.6);
          ctx.font = "10px monospace";
          ctx.textAlign = "center";
          ctx.fillText(handedness, 1 - wrist.x, wrist.y + 0.04);
        }
      }
    }

    // Draw landmark labels
    if (showLabels && landmarks && landmarks.length > 0) {
      drawLandmarkLabels(ctx, landmarks[0], gesture === "grab");
    }

    ctx.restore();

    rafRef.current = requestAnimationFrame(render);
  }, [landmarks, gesture, confidence, handedness, width, height, showLabels, showParticles, showTrails, updateParticles, updateTrails, spawnParticles]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(render);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [render]);

  // Track previous landmarks for trail comparison
  useEffect(() => {
    prevLandmarksRef.current = landmarks;
  }, [landmarks]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width: "100%", height: "100%" }}
    />
  );
}

// ── Drawing Functions ───────────────────────────────────────────────────────

function drawHand(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  gesture: GestureType,
  confidence: number,
  time: number,
  isPrimary: boolean,
) {
  const isGrabbing = gesture === "grab";
  const isPinching = gesture === "pinch";
  const pulse = 0.5 + 0.5 * Math.sin(time * 3);

  // ── Glowing skeletal connections ──
  for (const [start, end] of HAND_CONNECTIONS) {
    const p1 = landmarks[start];
    const p2 = landmarks[end];
    if (!p1 || !p2) continue;

    const x1 = 1 - p1.x, y1 = p1.y;
    const x2 = 1 - p2.x, y2 = p2.y;

    // Gradient along the bone
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    const hue1 = isPinching ? COLORS.pinch.h : isGrabbing ? COLORS.grab.h : COLORS.primary.h;
    const hue2 = isPinching ? COLORS.pinch.h + 30 : isGrabbing ? COLORS.grab.h - 20 : COLORS.secondary.h;
    gradient.addColorStop(0, hsl(hue1, COLORS.primary.s, COLORS.primary.l, 0.9));
    gradient.addColorStop(1, hsl(hue2, COLORS.secondary.s, COLORS.secondary.l, 0.9));

    // Outer glow
    ctx.strokeStyle = hsl(hue1, 70, 50, 0.15 * confidence);
    ctx.lineWidth = isPrimary ? 0.006 : 0.004;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Inner bright line
    ctx.strokeStyle = gradient;
    ctx.lineWidth = isPrimary ? 0.0025 : 0.0018;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Core bright line
    ctx.strokeStyle = hsl(hue1, 40, 90, 0.6 * confidence);
    ctx.lineWidth = isPrimary ? 0.001 : 0.0007;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // ── Fingertip particles & glow ──
  for (const tip of FINGER_TIPS) {
    const lm = landmarks[tip];
    if (!lm) continue;
    const x = 1 - lm.x, y = lm.y;
    const isTip = FINGER_TIPS.includes(tip);
    const hue = isPinching ? COLORS.pinch.h : isGrabbing ? COLORS.grab.h : (isTip ? COLORS.accent.h : COLORS.primary.h);

    // Outer glow
    const glowR = (isTip ? 0.015 : 0.01) * (1 + pulse * 0.3);
    const grad = ctx.createRadialGradient(x, y, 0, x, y, glowR);
    grad.addColorStop(0, hsl(hue, 80, 60, 0.4 * confidence));
    grad.addColorStop(0.5, hsl(hue, 70, 50, 0.1 * confidence));
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, glowR, 0, Math.PI * 2);
    ctx.fill();

    // Bright core
    ctx.fillStyle = hsl(hue, 50, 85, 0.9 * confidence);
    ctx.beginPath();
    ctx.arc(x, y, isTip ? 0.004 : 0.003, 0, Math.PI * 2);
    ctx.fill();

    // Ring for tips
    if (isTip) {
      ctx.strokeStyle = hsl(hue, 60, 70, 0.3 * confidence);
      ctx.lineWidth = 0.0005;
      ctx.beginPath();
      ctx.arc(x, y, 0.007 + pulse * 0.002, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // ── Palm center pulse ──
  const palm = landmarks[9] || landmarks[0];
  if (palm) {
    const px = 1 - palm.x, py = palm.y;
    const pulseR = 0.018 + pulse * 0.006;

    // Outer pulse ring
    const pulseAlpha = 0.15 + pulse * 0.1;
    ctx.strokeStyle = hsl(COLORS.palm.h, 50, 55, pulseAlpha * confidence);
    ctx.lineWidth = 0.0005;
    ctx.beginPath();
    ctx.arc(px, py, pulseR + pulse * 0.008, 0, Math.PI * 2);
    ctx.stroke();

    // Inner glow
    const palmGrad = ctx.createRadialGradient(px, py, 0, px, py, 0.012);
    palmGrad.addColorStop(0, hsl(COLORS.palm.h, 60, 60, 0.3 * confidence));
    palmGrad.addColorStop(1, "transparent");
    ctx.fillStyle = palmGrad;
    ctx.beginPath();
    ctx.arc(px, py, 0.012, 0, Math.PI * 2);
    ctx.fill();

    // Core dot
    ctx.fillStyle = hsl(COLORS.palm.h, 50, 75, 0.7 * confidence);
    ctx.beginPath();
    ctx.arc(px, py, 0.003, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Wrist glow ──
  const wrist = landmarks[0];
  if (wrist) {
    const wx = 1 - wrist.x, wy = wrist.y;
    const wristGrad = ctx.createRadialGradient(wx, wy, 0, wx, wy, 0.01);
    wristGrad.addColorStop(0, hsl(COLORS.glow.h, 60, 50, 0.2 * confidence));
    wristGrad.addColorStop(1, "transparent");
    ctx.fillStyle = wristGrad;
    ctx.beginPath();
    ctx.arc(wx, wy, 0.01, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    const progress = p.life / p.maxLife;
    const alpha = (1 - progress) * 0.8;
    const size = p.size * (1 - progress * 0.5);
    const x = 1 - p.x, y = p.y;

    // Glow
    const grad = ctx.createRadialGradient(x, y, 0, x, y, size / 50);
    grad.addColorStop(0, hsl(p.hue, 80, 70, alpha));
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, size / 50, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.fillStyle = hsl(p.hue, 50, 90, alpha);
    ctx.beginPath();
    ctx.arc(x, y, size / 200, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTrails(
  ctx: CanvasRenderingContext2D,
  trails: Map<number, Array<{ x: number; y: number; t: number }>>,
) {
  const now = performance.now();
  for (const [, trail] of trails) {
    if (trail.length < 2) continue;
    const tipHue = COLORS.accent.h;

    ctx.beginPath();
    for (let i = 0; i < trail.length; i++) {
      const p = trail[i];
      const x = 1 - p.x, y = p.y;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.strokeStyle = hsl(tipHue, 70, 60, 0.25);
    ctx.lineWidth = 0.0015;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    // Bright trail head
    const last = trail[trail.length - 1];
    if (last) {
      const alpha2 = Math.max(0, 1 - (now - last.t) / 100) * 0.6;
      ctx.fillStyle = hsl(tipHue, 60, 75, alpha2);
      ctx.beginPath();
      ctx.arc(1 - last.x, last.y, 0.003, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawGestureLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  gesture: GestureType,
  confidence: number,
  time: number,
) {
  const label = gesture.replace(/_/g, " ").toUpperCase();
  const pulse = 0.8 + 0.2 * Math.sin(time * 4);
  const hue = gesture === "pinch" ? COLORS.pinch.h : gesture === "grab" ? COLORS.grab.h : COLORS.accent.h;

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Background pill
  const textW = ctx.measureText(label).width / 100 + 0.02;
  ctx.fillStyle = hsl(hue, 40, 15, 0.6 * pulse);
  ctx.beginPath();
  const rx = 1 - x, ry = y;
  ctx.roundRect(rx - textW / 2, ry - 0.012, textW, 0.024, 0.006);
  ctx.fill();

  // Border
  ctx.strokeStyle = hsl(hue, 60, 50, 0.3 * pulse * confidence);
  ctx.lineWidth = 0.0003;
  ctx.beginPath();
  ctx.roundRect(rx - textW / 2, ry - 0.012, textW, 0.024, 0.006);
  ctx.stroke();

  // Text
  ctx.fillStyle = hsl(hue, 50, 80, 0.9 * confidence);
  ctx.font = "bold 10px monospace";
  ctx.fillText(label, rx, ry);

  ctx.restore();
}

function drawConfidenceBar(ctx: CanvasRenderingContext2D, confidence: number) {
  const barW = 0.06;
  const barH = 0.003;
  const x = 0.02;
  const y = 0.02;
  const hue = confidence > 0.7 ? 140 : confidence > 0.4 ? 50 : 0;

  // Background
  ctx.fillStyle = hsl(0, 0, 30, 0.3);
  ctx.beginPath();
  ctx.roundRect(x, y, barW, barH, barH / 2);
  ctx.fill();

  // Fill
  ctx.fillStyle = hsl(hue, 70, 50, 0.7);
  ctx.beginPath();
  ctx.roundRect(x, y, barW * confidence, barH, barH / 2);
  ctx.fill();

  // Label
  ctx.fillStyle = hsl(0, 0, 70, 0.5);
  ctx.font = "8px monospace";
  ctx.textAlign = "left";
  ctx.fillText(`${Math.round(confidence * 100)}%`, x, y + 0.012);
}

function drawLandmarkLabels(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  _isGrabbing: boolean,
) {
  ctx.font = "7px monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = hsl(COLORS.primary.h, 40, 60, 0.4);

  // Only draw labels for key landmarks (not all 21)
  const keyIndices = [0, 4, 8, 12, 16, 20];
  for (const i of keyIndices) {
    const lm = landmarks[i];
    if (!lm) continue;
    const x = 1 - lm.x, y = lm.y;
    const name = LANDMARK_NAMES[i];
    ctx.fillText(name, x, y + 0.025);
  }
}