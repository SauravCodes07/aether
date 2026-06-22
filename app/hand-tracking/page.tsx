"use client";

import { useState } from "react";
import HandTrackingApp from "@/components/hand-tracking/HandTrackingApp";

// ── Feature Badge ─────────────────────────────────────────────────────────────

function FeatureBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/8 text-[10px] font-mono text-slate-400 hover:text-slate-300 hover:bg-white/8 transition-all">
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

// ── Stat Item ─────────────────────────────────────────────────────────────────

function StatItem({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-xl font-bold font-mono ${color}`}>{value}</span>
      <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HandTrackingPage() {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <main
      className={`min-h-screen bg-aether-bg ${fullscreen ? "fixed inset-0 z-50 overflow-auto" : ""}`}
    >
      {/* ── Ambient background glows ─────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(34,211,238,0.3) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/2 left-0 w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)" }}
        />
      </div>

      <div className={`relative z-10 ${fullscreen ? "p-4" : "p-6 max-w-7xl mx-auto"}`}>

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">

            {/* Left: title + description */}
            <div className="flex-1 min-w-0">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600 mb-3">
                <a href="/dashboard" className="hover:text-slate-400 transition-colors">Dashboard</a>
                <span>/</span>
                <span className="text-aether-cyan">Hand Tracking</span>
              </div>

              {/* Title */}
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, rgba(34,211,238,0.2), rgba(139,92,246,0.2))", border: "1px solid rgba(34,211,238,0.2)" }}
                >
                  🖐
                </div>
                <div>
                  <h1 className="heading-lg text-aether-text leading-tight">
                    Hand Tracking Workspace
                  </h1>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-mono text-aether-cyan/60 uppercase tracking-widest">
                      Aether Core v3.0.0
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                    <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
                      Powered by MediaPipe
                    </span>
                  </div>
                </div>
              </div>

              <p className="body-sm text-aether-text-muted max-w-xl">
                Spatial gesture control with sub-20ms latency. Draw in air, interact with UI, and
                control the workspace — all without touching a screen.
              </p>

              {/* Feature badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                <FeatureBadge icon="👁"  label="21-point skeleton" />
                <FeatureBadge icon="🧠"  label="Kalman smoothing" />
                <FeatureBadge icon="✏"  label="Air drawing" />
                <FeatureBadge icon="🤲" label="Two-hand gestures" />
                <FeatureBadge icon="⚡" label="60 FPS target" />
                <FeatureBadge icon="🔒" label="100% local — no upload" />
                <FeatureBadge icon="📐" label="Auto-calibration" />
                <FeatureBadge icon="🌙" label="Low-light detection" />
              </div>
            </div>

            {/* Right: stats + controls */}
            <div className="flex flex-col items-end gap-3 flex-shrink-0">
              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  className="btn-secondary text-xs"
                  onClick={() => setFullscreen(v => !v)}
                >
                  {fullscreen ? "⊠ Exit Fullscreen" : "⊡ Fullscreen"}
                </button>
                <a href="/dashboard" className="btn-secondary text-xs">
                  ← Dashboard
                </a>
              </div>

              {/* Quick stats */}
              <div className="flex items-center gap-6 px-4 py-3 bg-white/3 rounded-xl border border-white/5">
                <StatItem value="13"  label="Gestures"  color="text-aether-cyan" />
                <div className="w-px h-6 bg-slate-800" />
                <StatItem value="21"  label="Landmarks" color="text-violet-400" />
                <div className="w-px h-6 bg-slate-800" />
                <StatItem value="60"  label="FPS target" color="text-green-400" />
                <div className="w-px h-6 bg-slate-800" />
                <StatItem value="2"   label="Hands"      color="text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Main App ─────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-aether-border bg-black/20 p-5 backdrop-blur-sm"
          style={{ boxShadow: "0 0 80px rgba(34,211,238,0.03), 0 0 40px rgba(139,92,246,0.04)" }}>
          <HandTrackingApp />
        </div>

        {/* ── Info Footer ──────────────────────────────────────────────────── */}
        <div className="mt-8 border-t border-aether-border pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs text-aether-text-muted">

            <div>
              <span className="block text-aether-text font-semibold mb-2 text-sm">Supported Gestures</span>
              <ul className="space-y-0.5 text-slate-500">
                {["Open Palm", "Closed Fist", "Pinch", "Grab", "Point", "Victory", "Thumbs Up",
                  "Swipe L/R/U/D", "Two-Hand Scale", "Two-Hand Rotate"].map(g => (
                  <li key={g} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-aether-cyan/40" />
                    {g}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="block text-aether-text font-semibold mb-2 text-sm">Visual Elements</span>
              <ul className="space-y-0.5 text-slate-500">
                {["Glowing skeletal lines", "Joint glow orbs", "Fingertip bloom", "Palm pulse",
                  "Confidence ring", "Motion trails", "Gesture labels", "Particle bursts",
                  "Spatial cursor orb", "Pointer beam"].map(v => (
                  <li key={v} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-violet-400/40" />
                    {v}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="block text-aether-text font-semibold mb-2 text-sm">Air Drawing</span>
              <ul className="space-y-0.5 text-slate-500">
                {["Index-finger drawing", "Pinch to lift pen", "7 brush colors", "5 brush sizes",
                  "Smooth Bézier strokes", "Glow + highlight passes", "Undo (50 levels)", "Clear canvas",
                  "Save as PNG"].map(f => (
                  <li key={f} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-400/40" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="block text-aether-text font-semibold mb-2 text-sm">Reliability</span>
              <ul className="space-y-0.5 text-slate-500">
                {["60 FPS target", "Sub-20ms latency", "3D Kalman filter", "Dead zone filtering",
                  "Edge-of-frame recovery", "Auto-calibration", "Mirror mode", "Calibration wizard",
                  "Low-light detection", "Tracking loss recovery", "Auto restart", "Local processing only"].map(r => (
                  <li key={r} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-amber-400/40" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Privacy note */}
          <div className="mt-6 flex items-center gap-3 p-4 bg-green-500/5 border border-green-500/10 rounded-xl">
            <span className="text-lg">🔒</span>
            <div>
              <span className="text-xs font-semibold text-green-400">100% Private</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                All hand tracking runs entirely in your browser using WebAssembly.
                No video frames, landmarks, or gesture data ever leave your device.
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}