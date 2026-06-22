"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import type { InteractionState, GestureType } from "@/lib/hand-tracking";

// ── Types ────────────────────────────────────────────────────────────────────

type Vec2 = { x: number; y: number };

type DraggableCard = {
  id: string;
  label: string;
  icon: string;
  pos: Vec2;
  size: { w: number; h: number };
  color: string;
  rotation: number;
  scale: number;
  isDragged: boolean;
};

type PinchButton = {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  pressed: boolean;
  pressCount: number;
};

type RotatableObject = {
  id: string;
  label: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
};

// ── Initial State ─────────────────────────────────────────────────────────────

const INITIAL_CARDS: DraggableCard[] = [
  { id: "card-1", label: "Analytics", icon: "📊", pos: { x: 60, y: 80 }, size: { w: 160, h: 100 }, color: "#7c3aed", rotation: 0, scale: 1, isDragged: false },
  { id: "card-2", label: "Models",    icon: "🧠", pos: { x: 280, y: 140 }, size: { w: 160, h: 100 }, color: "#0891b2", rotation: -3, scale: 1, isDragged: false },
  { id: "card-3", label: "Deploy",    icon: "🚀", pos: { x: 500, y: 90 }, size: { w: 160, h: 100 }, color: "#059669", rotation: 2, scale: 1, isDragged: false },
];

const INITIAL_BUTTONS: PinchButton[] = [
  { id: "btn-1", label: "Confirm",  x: 120, y: 340, radius: 36, color: "#22c55e", pressed: false, pressCount: 0 },
  { id: "btn-2", label: "Settings", x: 340, y: 340, radius: 36, color: "#8b5cf6", pressed: false, pressCount: 0 },
  { id: "btn-3", label: "Cancel",   x: 560, y: 340, radius: 36, color: "#ef4444", pressed: false, pressCount: 0 },
];

const INITIAL_OBJECTS: RotatableObject[] = [
  { id: "obj-1", label: "Cube",   x: 700, y: 180, size: 70, rotation: 0,  color: "#f59e0b" },
  { id: "obj-2", label: "Gear",   x: 840, y: 320, size: 55, rotation: 45, color: "#ec4899" },
];

// ── Component ─────────────────────────────────────────────────────────────────

type Props = {
  interactionState: InteractionState;
  gesture: GestureType;
  isActive: boolean;
};

export default function InteractionLab({ interactionState, gesture, isActive }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const cardsRef = useRef<DraggableCard[]>(INITIAL_CARDS.map(c => ({ ...c, pos: { ...c.pos } })));
  const buttonsRef = useRef<PinchButton[]>(INITIAL_BUTTONS.map(b => ({ ...b })));
  const objectsRef = useRef<RotatableObject[]>(INITIAL_OBJECTS.map(o => ({ ...o })));
  const dragTargetRef = useRef<string | null>(null);
  const dragOffsetRef = useRef<Vec2>({ x: 0, y: 0 });
  const prevCursorRef = useRef<Vec2>({ x: 0.5, y: 0.5 });
  const twoHandStartDistRef = useRef<number | null>(null);
  const twoHandStartAngleRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const [eventLog, setEventLog] = useState<{ id: number; msg: string; color: string }[]>([]);
  const [workspaceScale, setWorkspaceScale] = useState(1);
  const workspaceScaleRef = useRef(1);
  const [activeObj, setActiveObj] = useState<string | null>(null);

  const W = 960;
  const H = 480;

  // Log an event
  const logEvent = useCallback((msg: string, color = "#22d3ee") => {
    setEventLog(prev => [{ id: Date.now() + Math.random(), msg, color }, ...prev.slice(0, 5)]);
  }, []);

  // ── Interaction Logic ────────────────────────────────────────────────────

  useEffect(() => {
    if (!isActive) return;
    const cx = interactionState.cursorX * W;
    const cy = interactionState.cursorY * H;
    const isPinching = interactionState.isPinching;
    const isGrabbing = interactionState.isGrabbing;
    const cards = cardsRef.current;
    const buttons = buttonsRef.current;

    // ── Handle Two-Hand Scale/Rotate ──
    if (gesture === "two_hand_scale") {
      workspaceScaleRef.current = Math.max(0.5, Math.min(2, workspaceScaleRef.current + 0.005));
      setWorkspaceScale(workspaceScaleRef.current);
    } else if (gesture === "two_hand_rotate") {
      objectsRef.current.forEach(o => { o.rotation += 2; });
    } else if (gesture === "finger_spread") {
      workspaceScaleRef.current = Math.max(0.5, Math.min(2, workspaceScaleRef.current - 0.005));
      setWorkspaceScale(workspaceScaleRef.current);
    }

    // ── Handle Grab (drag cards) ──
    if (isGrabbing) {
      if (!dragTargetRef.current) {
        // Find a card under cursor
        for (const card of cards) {
          if (
            cx >= card.pos.x && cx <= card.pos.x + card.size.w &&
            cy >= card.pos.y && cy <= card.pos.y + card.size.h
          ) {
            dragTargetRef.current = card.id;
            dragOffsetRef.current = { x: cx - card.pos.x, y: cy - card.pos.y };
            card.isDragged = true;
            logEvent(`✊ Grabbing: ${card.label}`, "#fb923c");
            break;
          }
        }
      } else {
        // Move dragged card
        const card = cards.find(c => c.id === dragTargetRef.current);
        if (card) {
          card.pos.x = cx - dragOffsetRef.current.x;
          card.pos.y = cy - dragOffsetRef.current.y;
        }
      }
    } else {
      if (dragTargetRef.current) {
        const card = cards.find(c => c.id === dragTargetRef.current);
        if (card) { card.isDragged = false; logEvent(`✅ Dropped: ${card.label}`, "#22c55e"); }
        dragTargetRef.current = null;
      }
    }

    // ── Handle Pinch (press buttons) ──
    if (isPinching) {
      for (const btn of buttons) {
        const dx = cx - btn.x, dy = cy - btn.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < btn.radius && !btn.pressed) {
          btn.pressed = true;
          btn.pressCount++;
          logEvent(`🤏 Pinched: ${btn.label} (×${btn.pressCount})`, btn.color);
        }
      }
    } else {
      for (const btn of buttons) { btn.pressed = false; }
    }

    prevCursorRef.current = { x: cx, y: cy };
  }, [interactionState, gesture, isActive, logEvent]);

  // ── Canvas Render ────────────────────────────────────────────────────────

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const now = performance.now();
    const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = now;
    timeRef.current += dt;
    const t = timeRef.current;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#07070844";
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.save();
    ctx.strokeStyle = "rgba(139,92,246,0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.restore();

    const scale = workspaceScaleRef.current;

    // Workspace scale info
    ctx.save();
    ctx.font = "bold 10px monospace";
    ctx.fillStyle = "rgba(139,92,246,0.5)";
    ctx.fillText(`WORKSPACE ×${scale.toFixed(2)}`, 8, H - 8);
    ctx.restore();

    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.scale(scale, scale);
    ctx.translate(-W / 2, -H / 2);

    // ── Draw Cards ──
    for (const card of cardsRef.current) {
      ctx.save();
      const cx2 = card.pos.x + card.size.w / 2;
      const cy2 = card.pos.y + card.size.h / 2;
      ctx.translate(cx2, cy2);
      ctx.rotate((card.rotation * Math.PI) / 180);
      if (card.isDragged) ctx.scale(1.05, 1.05);
      ctx.translate(-card.size.w / 2, -card.size.h / 2);

      // Glow if dragged
      if (card.isDragged) {
        ctx.shadowColor = card.color;
        ctx.shadowBlur = 20;
      }

      // Glassmorphism card
      ctx.fillStyle = card.color + "22";
      ctx.strokeStyle = card.color + (card.isDragged ? "cc" : "55");
      ctx.lineWidth = card.isDragged ? 2 : 1;
      roundRect(ctx, 0, 0, card.size.w, card.size.h, 12);
      ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0;

      // Shimmer on drag
      if (card.isDragged) {
        const shimmer = ctx.createLinearGradient(0, 0, card.size.w, 0);
        shimmer.addColorStop(0, "transparent");
        shimmer.addColorStop(0.5, "rgba(255,255,255,0.08)");
        shimmer.addColorStop(1, "transparent");
        ctx.fillStyle = shimmer;
        roundRect(ctx, 0, 0, card.size.w, card.size.h, 12);
        ctx.fill();
      }

      // Icon + label
      ctx.font = "28px serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fillText(card.icon, card.size.w / 2, 48);
      ctx.font = "bold 12px monospace";
      ctx.fillStyle = card.color;
      ctx.fillText(card.label.toUpperCase(), card.size.w / 2, 72);

      // Drag hint
      if (!card.isDragged) {
        ctx.font = "9px monospace";
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.fillText("✊ GRAB TO MOVE", card.size.w / 2, 92);
      }
      ctx.restore();
    }

    // ── Draw Pinch Buttons ──
    for (const btn of buttonsRef.current) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.5);
      ctx.save();
      // Outer glow
      if (btn.pressed) {
        ctx.shadowColor = btn.color;
        ctx.shadowBlur = 30;
      }
      // Ring
      ctx.beginPath();
      ctx.arc(btn.x, btn.y, btn.radius + (btn.pressed ? 0 : pulse * 4), 0, Math.PI * 2);
      ctx.strokeStyle = btn.color + (btn.pressed ? "dd" : "44");
      ctx.lineWidth = btn.pressed ? 3 : 1.5;
      ctx.stroke();
      // Fill
      ctx.beginPath();
      ctx.arc(btn.x, btn.y, btn.radius, 0, Math.PI * 2);
      ctx.fillStyle = btn.pressed ? btn.color + "aa" : btn.color + "22";
      ctx.fill();
      ctx.shadowBlur = 0;
      // Label
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = btn.pressed ? "#fff" : btn.color;
      ctx.fillText(btn.label, btn.x, btn.y + 1);
      ctx.font = "8px monospace";
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillText(`×${btn.pressCount}`, btn.x, btn.y + 14);
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillText("🤏 PINCH", btn.x, btn.y + btn.radius + 14);
      ctx.restore();
    }

    // ── Draw Rotatable Objects ──
    for (const obj of objectsRef.current) {
      ctx.save();
      ctx.translate(obj.x, obj.y);
      ctx.rotate((obj.rotation * Math.PI) / 180);
      // Glow
      ctx.shadowColor = obj.color;
      ctx.shadowBlur = 12;
      // Square with beveled corners
      ctx.strokeStyle = obj.color;
      ctx.fillStyle = obj.color + "22";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const s = obj.size / 2;
      ctx.moveTo(-s, -s * 0.6); ctx.lineTo(-s * 0.6, -s);
      ctx.lineTo(s * 0.6, -s); ctx.lineTo(s, -s * 0.6);
      ctx.lineTo(s, s * 0.6); ctx.lineTo(s * 0.6, s);
      ctx.lineTo(-s * 0.6, s); ctx.lineTo(-s, s * 0.6);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0;
      // Label
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = obj.color;
      ctx.fillText(obj.label.toUpperCase(), 0, 3);
      ctx.font = "8px monospace";
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fillText(`${Math.round(obj.rotation % 360)}°`, 0, 14);
      ctx.restore();
    }

    // ── Two-hand label ──
    ctx.save();
    ctx.font = "9px monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillText("🤲 Two-hand scale/rotate • 🖐 Spread to zoom out", W / 2, H - 10);
    ctx.restore();

    // ── Cursor Orb ──
    const curX = interactionState.cursorX * W;
    const curY = interactionState.cursorY * H;
    const isInteracting = interactionState.isInteracting;

    ctx.restore(); // undo workspace scale

    ctx.save();
    const cursorGlow = ctx.createRadialGradient(curX, curY, 0, curX, curY, isInteracting ? 28 : 18);
    cursorGlow.addColorStop(0, isInteracting ? "rgba(255,150,50,0.6)" : "rgba(34,211,238,0.5)");
    cursorGlow.addColorStop(1, "transparent");
    ctx.fillStyle = cursorGlow;
    ctx.beginPath();
    ctx.arc(curX, curY, isInteracting ? 28 : 18, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.arc(curX, curY, isInteracting ? 5 : 3, 0, Math.PI * 2);
    ctx.fillStyle = isInteracting ? "#ff9632" : "#22d3ee";
    ctx.fill();

    // Pulse ring
    const pulse2 = 0.5 + 0.5 * Math.sin(t * 6);
    ctx.beginPath();
    ctx.arc(curX, curY, (isInteracting ? 12 : 8) + pulse2 * 4, 0, Math.PI * 2);
    ctx.strokeStyle = isInteracting ? "rgba(255,150,50,0.4)" : "rgba(34,211,238,0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    rafRef.current = requestAnimationFrame(render);
  }, [interactionState]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(render);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [render]);

  function handleReset() {
    cardsRef.current = INITIAL_CARDS.map(c => ({ ...c, pos: { ...c.pos }, isDragged: false }));
    buttonsRef.current = INITIAL_BUTTONS.map(b => ({ ...b }));
    objectsRef.current = INITIAL_OBJECTS.map(o => ({ ...o }));
    workspaceScaleRef.current = 1;
    setWorkspaceScale(1);
    dragTargetRef.current = null;
    logEvent("🔄 Workspace reset", "#a78bfa");
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-aether-border" style={{ aspectRatio: "2/1" }}>
        <canvas ref={canvasRef} width={W} height={H} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Controls + Event log */}
      <div className="grid grid-cols-2 gap-3">
        {/* Interaction guide */}
        <div className="bg-white/3 rounded-xl border border-white/5 p-3">
          <h4 className="text-[10px] font-mono uppercase text-slate-500 mb-2">Interaction Map</h4>
          <div className="space-y-1 text-[11px] font-mono">
            {[
              { g: "✊ Grab",         a: "Drag cards around", c: "text-amber-400" },
              { g: "🤏 Pinch",        a: "Press buttons",     c: "text-orange-400" },
              { g: "🤲 Two-Hand ↔",  a: "Scale workspace",   c: "text-cyan-400" },
              { g: "🤲 Two-Hand ↕",  a: "Rotate objects",    c: "text-violet-400" },
              { g: "🖐 Spread",       a: "Zoom out",          c: "text-green-400" },
            ].map(r => (
              <div key={r.g} className="flex justify-between">
                <span className={r.c}>{r.g}</span>
                <span className="text-slate-500">{r.a}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Event log */}
        <div className="bg-white/3 rounded-xl border border-white/5 p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[10px] font-mono uppercase text-slate-500">Event Log</h4>
            <button onClick={handleReset} className="text-[10px] font-mono text-violet-400 hover:text-violet-300 transition-colors">
              ↺ Reset
            </button>
          </div>
          <div className="space-y-1 font-mono text-[10px]">
            {eventLog.length === 0
              ? <span className="text-slate-600">No interactions yet…</span>
              : eventLog.map(e => (
                  <div key={e.id} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: e.color }} />
                    <span style={{ color: e.color }}>{e.msg}</span>
                  </div>
                ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
