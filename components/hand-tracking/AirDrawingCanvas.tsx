"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  AirDrawingSystem,
  type Landmark,
  type GestureType,
  type BrushColor,
} from "@/lib/hand-tracking";

// ── Constants ────────────────────────────────────────────────────────────────

const BRUSH_COLORS: { label: string; value: BrushColor; hsl: string }[] = [
  { label: "Cyan",    value: "#22d3ee", hsl: "hsl(188,83%,53%)" },
  { label: "Violet",  value: "#a78bfa", hsl: "hsl(258,90%,76%)" },
  { label: "Emerald", value: "#34d399", hsl: "hsl(160,68%,52%)" },
  { label: "Orange",  value: "#fb923c", hsl: "hsl(25,95%,61%)" },
  { label: "Pink",    value: "#f472b6", hsl: "hsl(330,81%,70%)" },
  { label: "Yellow",  value: "#facc15", hsl: "hsl(48,96%,53%)" },
  { label: "White",   value: "#ffffff", hsl: "hsl(0,0%,100%)" },
];

const BRUSH_SIZES = [2, 4, 8, 14, 20];

// ── Props ────────────────────────────────────────────────────────────────────

type Props = {
  landmarks: Landmark[][] | null;
  gesture: GestureType;
  width: number;
  height: number;
  isActive: boolean; // only draw when tab is active
};

// ── Component ────────────────────────────────────────────────────────────────

export default function AirDrawingCanvas({
  landmarks,
  gesture,
  width,
  height,
  isActive,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const systemRef = useRef(new AirDrawingSystem());
  const rafRef = useRef<number | null>(null);
  const prevGestureRef = useRef<GestureType>("none");
  const [brushColor, setBrushColor] = useState<BrushColor>("#22d3ee");
  const [brushSize, setBrushSize] = useState(4);
  const [strokeCount, setStrokeCount] = useState(0);
  const [canUndo, setCanUndo] = useState(false);
  const [isDrawingState, setIsDrawingState] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Point to draw · Pinch to lift pen");

  // Sync brush settings into system
  useEffect(() => {
    systemRef.current.setBrushColor(brushColor);
  }, [brushColor]);

  useEffect(() => {
    systemRef.current.setBrushSize(brushSize);
  }, [brushSize]);

  // ── Gesture → Draw Logic ─────────────────────────────────────────────────

  useEffect(() => {
    if (!isActive || !landmarks?.[0]) return;
    const sys = systemRef.current;
    const indexTip = landmarks[0][8]; // index fingertip
    if (!indexTip) return;

    const { x, y } = indexTip;

    // Pinch = lift pen (end stroke)
    const isPinching = gesture === "pinch";
    const wasDrawing = sys.isCurrentlyDrawing();

    if (isPinching) {
      if (wasDrawing) {
        sys.endStroke();
        setIsDrawingState(false);
        setStatusMsg("Pen lifted · Release pinch to draw");
      }
    } else if (gesture === "point" || gesture === "none") {
      // Point gesture = draw
      if (!wasDrawing) {
        sys.startStroke(x, y);
        setIsDrawingState(true);
        setStatusMsg("Drawing… · Pinch to lift pen");
      } else {
        sys.addPoint(x, y);
      }
    } else {
      // Any other gesture = end stroke
      if (wasDrawing) { sys.endStroke(); setIsDrawingState(false); }
    }

    setStrokeCount(sys.strokeCount());
    setCanUndo(sys.canUndo());
    prevGestureRef.current = gesture;
  }, [landmarks, gesture, isActive]);

  // ── Refs for stable RAF loop ──────────────────────────────────────────────
  const landmarksRef = useRef(landmarks);
  const gestureRefLocal = useRef(gesture);
  const isActiveRef = useRef(isActive);
  const brushColorRef = useRef(brushColor);

  landmarksRef.current = landmarks;
  gestureRefLocal.current = gesture;
  isActiveRef.current = isActive;
  brushColorRef.current = brushColor;

  // ── Canvas Render — stable RAF, reads refs ───────────────────────────────

  useEffect(() => {
    let running = true;

    const render = () => {
      if (!running) return;
      const canvas = canvasRef.current;
      if (!canvas) { rafRef.current = requestAnimationFrame(render); return; }
      const ctx = canvas.getContext("2d");
      if (!ctx) { rafRef.current = requestAnimationFrame(render); return; }

      const active = isActiveRef.current;
      const lm = landmarksRef.current;
      const color = brushColorRef.current;

      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = "rgba(7,7,8,0.95)";
      ctx.fillRect(0, 0, width, height);

      // Subtle grid
      ctx.strokeStyle = "rgba(139,92,246,0.04)";
      ctx.lineWidth = 1;
      for (let x2 = 0; x2 < width; x2 += 48) {
        ctx.beginPath(); ctx.moveTo(x2, 0); ctx.lineTo(x2, height); ctx.stroke();
      }
      for (let y2 = 0; y2 < height; y2 += 48) {
        ctx.beginPath(); ctx.moveTo(0, y2); ctx.lineTo(width, y2); ctx.stroke();
      }

      const sys = systemRef.current;
      const allStrokes = sys.getAllStrokes();

      // Draw strokes
      for (const stroke of allStrokes) {
        if (stroke.points.length < 2) continue;
        const isCurrent = stroke === sys.getCurrentStroke();

        // Glow pass
        ctx.save();
        ctx.filter = `blur(${stroke.size * 0.8}px)`;
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size * 1.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalAlpha = isCurrent ? 0.35 : 0.2;
        drawStrokePath(ctx, stroke.points, width, height);
        ctx.restore();

        // Core pass
        ctx.save();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalAlpha = isCurrent ? 1 : 0.88;
        drawStrokePath(ctx, stroke.points, width, height);
        ctx.restore();

        // Highlight pass
        ctx.save();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = Math.max(1, stroke.size * 0.3);
        ctx.lineCap = "round";
        ctx.globalAlpha = isCurrent ? 0.4 : 0.18;
        drawStrokePath(ctx, stroke.points, width, height);
        ctx.restore();
      }

      // Draw index finger cursor
      if (active && lm?.[0]?.[8]) {
        const tip = lm[0][8]!;
        const cx = tip.x * width;
        const cy = tip.y * height;
        const isDrawing = sys.isCurrentlyDrawing();

        // Outer ring
        ctx.beginPath();
        ctx.arc(cx, cy, isDrawing ? 16 : 10, 0, Math.PI * 2);
        ctx.strokeStyle = isDrawing ? color : "rgba(255,255,255,0.3)";
        ctx.lineWidth = isDrawing ? 2 : 1;
        ctx.globalAlpha = 0.7;
        ctx.stroke();

        // Inner dot
        ctx.beginPath();
        ctx.arc(cx, cy, isDrawing ? 4 : 2, 0, Math.PI * 2);
        ctx.fillStyle = isDrawing ? color : "rgba(255,255,255,0.6)";
        ctx.globalAlpha = 1;
        ctx.fill();

        // Glow
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 24);
        grad.addColorStop(0, color + "55");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.globalAlpha = isDrawing ? 0.8 : 0.3;
        ctx.beginPath();
        ctx.arc(cx, cy, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Hint text when empty
      if (allStrokes.length === 0 && !active) {
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.font = "bold 18px monospace";
        ctx.textAlign = "center";
        ctx.fillText("Activate the Air Draw tab to start drawing", width / 2, height / 2);
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => { running = false; if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [width, height]);

  // ── Controls ─────────────────────────────────────────────────────────────

  function handleUndo() {
    systemRef.current.undo();
    setStrokeCount(systemRef.current.strokeCount());
    setCanUndo(systemRef.current.canUndo());
  }

  function handleClear() {
    systemRef.current.clear();
    setStrokeCount(0);
    setCanUndo(systemRef.current.canUndo());
    setStatusMsg("Canvas cleared");
  }

  function handleSave() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `aether-drawing-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setStatusMsg("Drawing saved as PNG!");
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-aether-border" style={{ aspectRatio: "16/9" }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{ width: "100%", height: "100%" }}
        />
        {/* Status bar overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2 py-1 rounded-md text-[10px] font-mono bg-black/70 text-cyan-400 backdrop-blur-sm">
            {isActive ? statusMsg : "Activate Air Draw tab"}
          </span>
          <div className="flex items-center gap-2">
            {isDrawingState && (
              <span className="px-2 py-1 rounded-md text-[10px] font-mono bg-violet-600/80 text-white animate-pulse">
                ✏ DRAWING
              </span>
            )}
            <span className="px-2 py-1 rounded-md text-[10px] font-mono bg-black/70 text-slate-400">
              {strokeCount} stroke{strokeCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
        {/* Color palette */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 font-mono uppercase mr-1">Color</span>
          {BRUSH_COLORS.map((c) => (
            <button
              key={c.value}
              title={c.label}
              onClick={() => setBrushColor(c.value)}
              className="w-6 h-6 rounded-full border-2 transition-all hover:scale-110 focus:outline-none"
              style={{
                background: c.hsl,
                borderColor: brushColor === c.value ? "white" : "transparent",
                boxShadow: brushColor === c.value ? `0 0 8px ${c.hsl}` : "none",
              }}
            />
          ))}
        </div>

        <div className="h-4 w-px bg-slate-700 mx-1" />

        {/* Brush size */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 font-mono uppercase mr-1">Size</span>
          {BRUSH_SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setBrushSize(s)}
              title={`${s}px`}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:bg-white/10"
              style={{
                background: brushSize === s ? "rgba(139,92,246,0.2)" : undefined,
                border: brushSize === s ? "1px solid rgba(139,92,246,0.5)" : "1px solid transparent",
              }}
            >
              <div
                className="rounded-full bg-white"
                style={{ width: Math.max(4, s * 0.6), height: Math.max(4, s * 0.6) }}
              />
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 text-slate-300 border border-white/5"
          >
            ↩ Undo
          </button>
          <button
            onClick={handleClear}
            disabled={strokeCount === 0}
            className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-500/10 text-red-400 border border-white/5"
          >
            🗑 Clear
          </button>
          <button
            onClick={handleSave}
            disabled={strokeCount === 0}
            className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-violet-600 hover:bg-violet-500 text-white"
          >
            💾 Save PNG
          </button>
        </div>
      </div>

      {/* Gesture guide */}
      <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-500">
        <div className="p-2 bg-white/3 rounded-lg border border-white/5 text-center">
          <span className="block text-lg mb-1">👆</span>
          <span className="text-cyan-400 block">Point</span>
          Draw lines
        </div>
        <div className="p-2 bg-white/3 rounded-lg border border-white/5 text-center">
          <span className="block text-lg mb-1">🤏</span>
          <span className="text-orange-400 block">Pinch</span>
          Lift pen
        </div>
        <div className="p-2 bg-white/3 rounded-lg border border-white/5 text-center">
          <span className="block text-lg mb-1">✊</span>
          <span className="text-amber-400 block">Fist</span>
          Pause drawing
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function drawStrokePath(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  w: number,
  h: number,
) {
  ctx.beginPath();
  ctx.moveTo(points[0]!.x * w, points[0]!.y * h);
  for (let i = 1; i < points.length - 1; i++) {
    const curr = points[i]!;
    const next = points[i + 1]!;
    const mx = ((curr.x + next.x) / 2) * w;
    const my = ((curr.y + next.y) / 2) * h;
    ctx.quadraticCurveTo(curr.x * w, curr.y * h, mx, my);
  }
  const last = points[points.length - 1]!;
  ctx.lineTo(last.x * w, last.y * h);
  ctx.stroke();
}
