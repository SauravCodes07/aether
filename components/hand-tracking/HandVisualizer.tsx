"use client";

import { useRef, useEffect } from "react";
import {
  HAND_CONNECTIONS,
  FINGER_TIPS,
  PALM_INDICES,
  type Landmark,
  type GestureType,
  type GestureInteraction,
  type CursorPosition,
} from "@/lib/hand-tracking";

// ── Particle System ─────────────────────────────────────────────────────────

type Particle = {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; size: number; hue: number;
};

// ── Color System ─────────────────────────────────────────────────────────────

// HSL palette per gesture
const GESTURE_HUE: Record<string, number> = {
  pinch: 20,
  grab: 40,
  open_palm: 120,
  closed_fist: 0,
  point: 200,
  thumbs_up: 150,
  victory: 270,
  finger_spread: 280,
  swipe_left: 190,
  swipe_right: 190,
  swipe_up: 210,
  swipe_down: 210,
  two_hand_scale: 60,
  two_hand_rotate: 300,
  none: 200,
};

const C = {
  cyan:   [170, 80, 55] as const,
  purple: [270, 70, 60] as const,
  bright: [200, 90, 60] as const,
  palm:   [220, 60, 50] as const,
  glow:   [190, 80, 50] as const,
  pinch:  [20, 90, 55]  as const,
  grab:   [40, 85, 50]  as const,
  spread: [280, 75, 55] as const,
} as const;

const hsl = (h: number, s: number, l: number, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;

// ── Joint indices – separate passes ─────────────────────────────────────────

const ALL_JOINTS = Array.from({ length: 21 }, (_, i) => i);
const KNUCKLE_INDICES = [5, 6, 9, 10, 13, 14, 17, 18];

// ── Props ────────────────────────────────────────────────────────────────────

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
  cursorPosition?: CursorPosition;
  showCursor?: boolean;
};

// ── Main Component ────────────────────────────────────────────────────────────

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
  cursorPosition,
  showCursor = false,
}: HandVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const trailsRef = useRef<Map<number, Array<{ x: number; y: number; t: number }>>>(new Map());
  const burstRef = useRef<number>(0);
  const prevGestureRef = useRef<GestureType>("none");
  const timeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(performance.now());
  const gestureTransitionRef = useRef(0);
  const prevLabelGestureRef = useRef<GestureType>("none");

  // ── Store ALL fast-changing props in refs so RAF loop is stable ──
  const landmarksRef = useRef(landmarks);
  const gestureRef = useRef(gesture);
  const interactionRef = useRef(interaction);
  const confidenceRef = useRef(confidence);
  const handednessRef = useRef(handedness);
  const cursorPosRef = useRef(cursorPosition);
  const showLabelsRef = useRef(showLabels);
  const showParticlesRef = useRef(showParticles);
  const showTrailsRef = useRef(showTrails);
  const showCursorRef = useRef(showCursor);

  // Sync refs every render (cheap — no RAF teardown)
  landmarksRef.current = landmarks;
  gestureRef.current = gesture;
  interactionRef.current = interaction;
  confidenceRef.current = confidence;
  handednessRef.current = handedness;
  cursorPosRef.current = cursorPosition;
  showLabelsRef.current = showLabels;
  showParticlesRef.current = showParticles;
  showTrailsRef.current = showTrails;
  showCursorRef.current = showCursor;

  // Detect gesture change for particle burst
  if (gesture !== prevGestureRef.current) {
    if (gesture !== "none" && landmarks?.[0]) {
      burstRef.current = 24;
      for (const tip of FINGER_TIPS) {
        const lm = landmarks[0][tip];
        if (lm) spawnParticles(lm.x, lm.y, 5, getGestureHue(gesture));
      }
    }
    prevGestureRef.current = gesture;
    gestureTransitionRef.current = 0;
  }

  if (gesture !== prevLabelGestureRef.current) {
    prevLabelGestureRef.current = gesture;
    gestureTransitionRef.current = 0;
  }

  function getGestureHue(g: GestureType): number {
    return GESTURE_HUE[g] ?? C.bright[0];
  }

  function spawnParticles(x: number, y: number, count: number, hue: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.001 + Math.random() * 0.005;
      particlesRef.current.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 0, maxLife: 0.3 + Math.random() * 0.6, size: 2 + Math.random() * 5, hue,
      });
    }
  }

  function updateParticles(dt: number) {
    particlesRef.current = particlesRef.current.filter(p => {
      p.life += dt; p.x += p.vx; p.y += p.vy; p.vx *= 0.95; p.vy *= 0.95;
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
        while (trail.length > 0 && now - trail[0]!.t > 300) trail.shift();
      }
    }
    for (const [key, trail] of trails) {
      if (!trail.length || now - trail[trail.length - 1]!.t > 700) trails.delete(key);
    }
  }

  // ── Stable RAF loop — reads refs, never torn down ──────────────────────

  useEffect(() => {
    let running = true;

    const render = () => {
      if (!running) return;
      const canvas = canvasRef.current;
      if (!canvas) { rafRef.current = requestAnimationFrame(render); return; }
      const ctx = canvas.getContext("2d");
      if (!ctx) { rafRef.current = requestAnimationFrame(render); return; }

      // Read all data from refs
      const lm = landmarksRef.current;
      const gest = gestureRef.current;
      const inter = interactionRef.current;
      const conf = confidenceRef.current;
      const handed = handednessRef.current;
      const curPos = cursorPosRef.current;

      const now = performance.now();
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;
      timeRef.current += dt;
      gestureTransitionRef.current = Math.min(1, gestureTransitionRef.current + dt * 5);

      updateParticles(dt);
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.scale(width, height);

      if (lm && lm.length > 0) {
        if (showTrailsRef.current) updateTrails(lm);
        if (showTrailsRef.current) drawTrails(ctx, trailsRef.current, gest);

        for (let hi = 0; hi < lm.length; hi++) {
          const hand = lm[hi];
          const isMain = hi === 0;

          drawBoundingBox(ctx, hand, conf, isMain);
          drawHand(ctx, hand, gest, conf, timeRef.current, isMain);
          drawJointGlows(ctx, hand, gest, conf, timeRef.current, isMain);

          if (showParticlesRef.current && gest !== "none" && Math.random() > 0.82) {
            const tip = FINGER_TIPS[Math.floor(Math.random() * 5)];
            const landmark = lm[hi][tip!];
            if (landmark) spawnParticles(landmark.x, landmark.y, 1, getGestureHue(gest));
          }
        }

        if (gest === "point" && lm[0]?.[8] && lm[0]?.[5]) {
          drawPointerBeam(ctx, lm[0][8]!, lm[0][5]!, conf);
        }

        if (showParticlesRef.current) drawParticles(ctx, particlesRef.current);

        if (gest !== "none") {
          const palm = lm[0]?.[9] || lm[0]?.[0];
          if (palm) {
            drawGestureHUD(ctx, palm.x, palm.y, gest, inter, conf, timeRef.current, gestureTransitionRef.current);
          }
        }

        for (let hi = 0; hi < lm.length; hi++) {
          drawConfidenceRing(ctx, lm[hi]!, conf, timeRef.current, hi === 0);
        }

        if (handed && lm[0]?.[0]) {
          const w = lm[0][0]!;
          ctx.fillStyle = hsl(C.purple[0], 40, 50, 0.5);
          ctx.font = "10px monospace"; ctx.textAlign = "center";
          ctx.fillText(handed, w.x, w.y + 0.04);
        }
      } else {
        drawIdleState(ctx, timeRef.current);
      }

      if (showLabelsRef.current && lm?.[0]) drawLabels(ctx, lm[0]);

      if (showCursorRef.current && curPos) {
        drawSpatialCursor(ctx, curPos.x, curPos.y, gest, timeRef.current);
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => { running = false; if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [width, height]); // only restart if canvas size changes

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width: "100%", height: "100%" }}
    />
  );
}




// ── Hand Drawing ──────────────────────────────────────────────────────────────

function drawHand(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  gesture: GestureType,
  conf: number,
  time: number,
  isPrimary: boolean,
) {
  const isGrab    = gesture === "grab";
  const isPinch   = gesture === "pinch";
  const isSpread  = gesture === "finger_spread";
  const isOpen    = gesture === "open_palm";

  const pulse  = 0.5 + 0.5 * Math.sin(time * 3.5);
  const pulse2 = 0.5 + 0.5 * Math.sin(time * 2.3 + 1);

  const hue = GESTURE_HUE[gesture] ?? C.cyan[0];

  // ── Skeletal connections — 3-pass glow ──
  for (const [s, e] of HAND_CONNECTIONS) {
    const p1 = landmarks[s], p2 = landmarks[e];
    if (!p1 || !p2) continue;

    const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
    gradient.addColorStop(0, hsl(hue, C.cyan[1], C.cyan[2], 0.9));
    gradient.addColorStop(1, hsl(C.purple[0], C.purple[1], C.purple[2], 0.9));

    // Pass 1: Outer glow
    ctx.strokeStyle = hsl(hue, 60, 45, 0.13 * conf);
    ctx.lineWidth   = (isPrimary ? 0.009 : 0.006) * (1 + pulse * 0.25);
    ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();

    // Pass 2: Gradient bone
    ctx.strokeStyle = gradient;
    ctx.lineWidth   = isPrimary ? 0.003 : 0.002;
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();

    // Pass 3: Bright core
    ctx.strokeStyle = hsl(hue, 30, 94, 0.55 * conf);
    ctx.lineWidth   = isPrimary ? 0.0012 : 0.0008;
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
  }

  // ── Fingertip bloom ──
  for (const tip of FINGER_TIPS) {
    const lm = landmarks[tip];
    if (!lm) continue;
    const r = 0.019 * (1 + pulse * 0.35);

    const grad = ctx.createRadialGradient(lm.x, lm.y, 0, lm.x, lm.y, r);
    grad.addColorStop(0, hsl(hue, 82, 68, 0.55 * conf));
    grad.addColorStop(0.45, hsl(hue, 70, 50, 0.15 * conf));
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(lm.x, lm.y, r, 0, Math.PI * 2); ctx.fill();

    // Core dot
    ctx.fillStyle = hsl(hue, 40, 92, 0.97 * conf);
    ctx.beginPath(); ctx.arc(lm.x, lm.y, isPrimary ? 0.0055 : 0.0035, 0, Math.PI * 2); ctx.fill();

    // Pulse ring
    ctx.strokeStyle = hsl(hue, 55, 72, (0.22 + pulse * 0.16) * conf);
    ctx.lineWidth = 0.0007;
    ctx.beginPath(); ctx.arc(lm.x, lm.y, 0.009 + pulse2 * 0.003, 0, Math.PI * 2); ctx.stroke();
  }

  // ── Palm energy core (pulse) ──
  const palm = landmarks[9] || landmarks[0];
  if (palm) {
    const pr = 0.023 + pulse * 0.009;

    // Outer pulse ring
    ctx.strokeStyle = hsl(C.palm[0], 52, 57, (0.16 + pulse * 0.13) * conf);
    ctx.lineWidth = 0.0007;
    ctx.beginPath(); ctx.arc(palm.x, palm.y, pr, 0, Math.PI * 2); ctx.stroke();

    // Second ring
    ctx.strokeStyle = hsl(C.palm[0], 40, 67, (0.08 + pulse2 * 0.09) * conf);
    ctx.beginPath(); ctx.arc(palm.x, palm.y, pr + 0.009, 0, Math.PI * 2); ctx.stroke();

    // Inner glow
    const pg = ctx.createRadialGradient(palm.x, palm.y, 0, palm.x, palm.y, 0.016);
    pg.addColorStop(0, hsl(C.palm[0], 58, 62, 0.38 * conf));
    pg.addColorStop(1, "transparent");
    ctx.fillStyle = pg;
    ctx.beginPath(); ctx.arc(palm.x, palm.y, 0.016, 0, Math.PI * 2); ctx.fill();

    // Core dot
    ctx.fillStyle = hsl(C.palm[0], 45, 80, 0.85 * conf);
    ctx.beginPath(); ctx.arc(palm.x, palm.y, 0.0045, 0, Math.PI * 2); ctx.fill();
  }

  // ── Wrist glow ──
  const wrist = landmarks[0];
  if (wrist) {
    const wg = ctx.createRadialGradient(wrist.x, wrist.y, 0, wrist.x, wrist.y, 0.013);
    wg.addColorStop(0, hsl(C.glow[0], 62, 52, 0.22 * conf));
    wg.addColorStop(1, "transparent");
    ctx.fillStyle = wg;
    ctx.beginPath(); ctx.arc(wrist.x, wrist.y, 0.013, 0, Math.PI * 2); ctx.fill();
  }
}

// ── Joint Glows — dedicated pass ─────────────────────────────────────────────

function drawJointGlows(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  gesture: GestureType,
  conf: number,
  time: number,
  isPrimary: boolean,
) {
  const hue = GESTURE_HUE[gesture] ?? C.cyan[0];
  const pulse = 0.5 + 0.5 * Math.sin(time * 4);

  for (const i of ALL_JOINTS) {
    const lm = landmarks[i];
    if (!lm) continue;
    const isKnuckle = KNUCKLE_INDICES.includes(i);
    const isTip = FINGER_TIPS.includes(i);
    if (isTip) continue; // tips handled in drawHand

    const r = isKnuckle
      ? 0.006 * (1 + pulse * 0.2)
      : 0.004;

    // Joint glow orb
    const g = ctx.createRadialGradient(lm.x, lm.y, 0, lm.x, lm.y, r * 2.5);
    g.addColorStop(0, hsl(hue, 70, 60, 0.35 * conf));
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(lm.x, lm.y, r * 2.5, 0, Math.PI * 2); ctx.fill();

    // Joint core
    ctx.fillStyle = hsl(hue, 50, 85, 0.7 * conf);
    ctx.beginPath(); ctx.arc(lm.x, lm.y, r * 0.5, 0, Math.PI * 2); ctx.fill();
  }
}

// ── Confidence Ring ───────────────────────────────────────────────────────────

function drawConfidenceRing(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  conf: number,
  time: number,
  isPrimary: boolean,
) {
  // Find bounding box center
  let minX = 1, minY = 1, maxX = 0, maxY = 0;
  landmarks.forEach(p => {
    minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
  });
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const rx = (maxX - minX) / 2 + 0.055;
  const ry = (maxY - minY) / 2 + 0.04;

  const hue = conf > 0.75 ? 140 : conf > 0.45 ? 50 : 0;
  const pulse = 0.5 + 0.5 * Math.sin(time * 2);
  const alpha = (0.15 + pulse * 0.08) * conf;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(rx, ry);

  // Background ring
  ctx.strokeStyle = hsl(0, 0, 30, 0.12);
  ctx.lineWidth = 0.012;
  ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI * 2); ctx.stroke();

  // Confidence arc (clockwise from top)
  ctx.strokeStyle = hsl(hue, 65, 55, alpha * 3);
  ctx.lineWidth = 0.016;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(0, 0, 1, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * conf);
  ctx.stroke();

  // Dashes at 25%, 50%, 75%
  for (const frac of [0.25, 0.5, 0.75]) {
    const angle = -Math.PI / 2 + Math.PI * 2 * frac;
    const x = Math.cos(angle), y = Math.sin(angle);
    ctx.strokeStyle = hsl(0, 0, 60, 0.15);
    ctx.lineWidth = 0.008;
    ctx.beginPath(); ctx.moveTo(x * 0.88, y * 0.88); ctx.lineTo(x * 1, y * 1); ctx.stroke();
  }

  ctx.restore();

  // Confidence text near wrist
  if (isPrimary && landmarks[0]) {
    ctx.fillStyle = hsl(hue, 50, 65, 0.45);
    ctx.font = "6px monospace"; ctx.textAlign = "center";
    ctx.fillText(`${Math.round(conf * 100)}%`, landmarks[0].x, landmarks[0].y + 0.045);
  }
}

// ── Bounding Box ──────────────────────────────────────────────────────────────

function drawBoundingBox(ctx: CanvasRenderingContext2D, landmarks: Landmark[], conf: number, isMain: boolean) {
  let minX = 1, minY = 1, maxX = 0, maxY = 0;
  landmarks.forEach(p => {
    minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
  });

  const padding = 0.05;
  const x = minX - padding, y = minY - padding;
  const w = (maxX - minX) + padding * 2, h = (maxY - minY) + padding * 2;

  ctx.strokeStyle = isMain ? hsl(C.cyan[0], 50, 40, 0.16 * conf) : hsl(C.purple[0], 40, 40, 0.1 * conf);
  ctx.lineWidth = 0.001;
  ctx.setLineDash([0.01, 0.01]);
  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([]);

  if (isMain && conf > 0.8) {
    ctx.fillStyle = hsl(C.cyan[0], 60, 50, 0.4);
    ctx.font = "bold 6px monospace";
    ctx.fillText("TRACKING LOCK", x, y - 0.005);
  }
}

// ── Pointer Beam ──────────────────────────────────────────────────────────────

function drawPointerBeam(ctx: CanvasRenderingContext2D, tip: Landmark, base: Landmark, conf: number) {
  const dx = tip.x - base.x, dy = tip.y - base.y;
  const ex = tip.x + dx * 10, ey = tip.y + dy * 10;

  const grad = ctx.createLinearGradient(tip.x, tip.y, tip.x + dx * 5, tip.y + dy * 5);
  grad.addColorStop(0, hsl(C.bright[0], 82, 62, 0.45 * conf));
  grad.addColorStop(1, "transparent");

  ctx.strokeStyle = grad;
  ctx.lineWidth = 0.002;
  ctx.beginPath(); ctx.moveTo(tip.x, tip.y); ctx.lineTo(ex, ey); ctx.stroke();

  ctx.fillStyle = hsl(C.bright[0], 90, 72, 0.65 * conf);
  ctx.beginPath(); ctx.arc(tip.x + dx * 2, tip.y + dy * 2, 0.005, 0, Math.PI * 2); ctx.fill();
}

// ── Particles ────────────────────────────────────────────────────────────────

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    const progress = p.life / p.maxLife;
    const alpha = (1 - progress) * 0.9;
    const size = p.size * (1 - progress * 0.65);

    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size / 40);
    grad.addColorStop(0, hsl(p.hue, 80, 72, alpha));
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(p.x, p.y, size / 40, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = hsl(p.hue, 50, 94, alpha);
    ctx.beginPath(); ctx.arc(p.x, p.y, size / 155, 0, Math.PI * 2); ctx.fill();
  }
}

// ── Trails ───────────────────────────────────────────────────────────────────

function drawTrails(
  ctx: CanvasRenderingContext2D,
  trails: Map<number, Array<{ x: number; y: number; t: number }>>,
  gesture: GestureType,
) {
  const hue = GESTURE_HUE[gesture] ?? C.bright[0];
  const now = performance.now();
  for (const [, trail] of trails) {
    if (trail.length < 2) continue;

    ctx.beginPath();
    ctx.moveTo(trail[0]!.x, trail[0]!.y);
    for (let i = 1; i < trail.length; i++) {
      const prev = trail[i - 1]!, curr = trail[i]!;
      const mx = (prev.x + curr.x) / 2, my = (prev.y + curr.y) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
    }

    const age = now - trail[trail.length - 1]!.t;
    const alpha = Math.max(0, 1 - age / 300) * 0.45;
    ctx.strokeStyle = hsl(hue, 65, 62, alpha);
    ctx.lineWidth = 0.002;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.stroke();

    // Bright head dot
    const last = trail[trail.length - 1]!;
    const ha = Math.max(0, 1 - (now - last.t) / 120) * 0.75;
    ctx.fillStyle = hsl(hue, 58, 80, ha);
    ctx.beginPath(); ctx.arc(last.x, last.y, 0.004, 0, Math.PI * 2); ctx.fill();
  }
}

// ── Gesture HUD ───────────────────────────────────────────────────────────────

function drawGestureHUD(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  gesture: GestureType,
  interaction: GestureInteraction,
  conf: number,
  time: number,
  entryProgress: number, // 0→1 animated entry
) {
  const label = gesture.replace(/_/g, " ").toUpperCase();
  const pulse = 0.8 + 0.2 * Math.sin(time * 4);
  const hue = GESTURE_HUE[gesture] ?? C.bright[0];

  ctx.save();
  ctx.globalAlpha = entryProgress;
  // Slide in from right
  const offsetX = (1 - entryProgress) * 0.05;
  ctx.translate(offsetX, 0);

  ctx.textAlign = "center"; ctx.textBaseline = "middle";

  // Background pill
  ctx.font = "bold 10px monospace";
  const textW = ctx.measureText(label).width / 1000 * 1 + 0.03; // normalized
  ctx.fillStyle = hsl(hue, 35, 12, 0.75 * pulse);
  ctx.beginPath();
  ctx.roundRect(x - textW / 2, y - 0.019, textW, 0.038, 0.009);
  ctx.fill();

  // Border glow
  ctx.strokeStyle = hsl(hue, 58, 52, 0.45 * pulse * conf);
  ctx.lineWidth = 0.0005;
  ctx.beginPath();
  ctx.roundRect(x - textW / 2, y - 0.019, textW, 0.038, 0.009);
  ctx.stroke();

  // Shimmer line
  ctx.strokeStyle = hsl(hue, 50, 75, 0.12 * pulse);
  ctx.lineWidth = 0.0003;
  ctx.beginPath();
  ctx.moveTo(x - textW / 2 + 0.005, y - 0.016);
  ctx.lineTo(x + textW / 2 - 0.005, y - 0.016);
  ctx.stroke();

  // Gesture text
  ctx.fillStyle = hsl(hue, 48, 84, 0.97 * conf);
  ctx.font = "bold 10px monospace";
  ctx.fillText(label, x, y);

  // Interaction indicator
  if (interaction !== "idle") {
    ctx.fillStyle = hsl(hue, 42, 62, 0.65 * conf);
    ctx.font = "8px monospace";
    ctx.fillText(`→ ${interaction}`, x, y + 0.026);
  }

  // Confidence bar below label
  const barW = textW * 0.75;
  const barY = y + (interaction !== "idle" ? 0.038 : 0.026);
  ctx.fillStyle = hsl(0, 0, 25, 0.4);
  ctx.fillRect(x - barW / 2, barY, barW, 0.004);
  ctx.fillStyle = hsl(hue, 60, 52, 0.7);
  ctx.fillRect(x - barW / 2, barY, barW * conf, 0.004);

  ctx.restore();
}

// ── Spatial Cursor ────────────────────────────────────────────────────────────

function drawSpatialCursor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  gesture: GestureType,
  time: number,
) {
  const isActive = gesture === "pinch" || gesture === "grab";
  const hue = isActive ? 20 : 195;
  const pulse = 0.5 + 0.5 * Math.sin(time * 6);

  // Outer glow
  const r = isActive ? 0.03 : 0.022;
  const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
  glow.addColorStop(0, hsl(hue, 80, 60, 0.55));
  glow.addColorStop(0.5, hsl(hue, 70, 50, 0.2));
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();

  // Pulse ring
  ctx.strokeStyle = hsl(hue, 65, 60, 0.35 + pulse * 0.2);
  ctx.lineWidth = 0.001;
  ctx.beginPath(); ctx.arc(x, y, 0.013 + pulse * 0.004, 0, Math.PI * 2); ctx.stroke();

  // Inner ring (hover feedback)
  ctx.strokeStyle = hsl(hue, 75, 70, 0.6);
  ctx.lineWidth = 0.0008;
  ctx.beginPath(); ctx.arc(x, y, 0.007, 0, Math.PI * 2); ctx.stroke();

  // Core dot
  ctx.fillStyle = hsl(hue, 60, 90, 0.95);
  ctx.beginPath(); ctx.arc(x, y, 0.003, 0, Math.PI * 2); ctx.fill();
}

// ── Idle State ────────────────────────────────────────────────────────────────

function drawIdleState(ctx: CanvasRenderingContext2D, time: number) {
  const pulse = 0.5 + 0.5 * Math.sin(time * 1.5);
  const cx = 0.5, cy = 0.5;

  // Ambient ring
  const r = 0.06 + pulse * 0.01;
  const g = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r);
  g.addColorStop(0, "transparent");
  g.addColorStop(0.5, hsl(200, 60, 50, 0.04 * pulse));
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

  // Hand hint text
  ctx.font = "8px monospace"; ctx.textAlign = "center";
  ctx.fillStyle = hsl(200, 40, 55, 0.18 + pulse * 0.08);
  ctx.fillText("SHOW YOUR HAND", cx, cy + 0.012);
}

// ── Labels ────────────────────────────────────────────────────────────────────

function drawLabels(ctx: CanvasRenderingContext2D, landmarks: Landmark[]) {
  ctx.font = "7px monospace"; ctx.textAlign = "center";
  ctx.fillStyle = hsl(C.cyan[0], 35, 55, 0.35);
  for (const i of [0, 4, 8, 12, 16, 20]) {
    const lm = landmarks[i];
    if (lm) ctx.fillText(String(i), lm.x, lm.y + 0.022);
  }
}