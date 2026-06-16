"use client";

import type { GestureType, InteractionState } from "@/lib/hand-tracking";

type Props = {
  fps: number;
  latencyMs: number;
  confidence: number;
  gesture: GestureType;
  handedness?: string | null;
  handsDetected?: number;
  interactionState?: InteractionState;
};

const GESTURE_COLORS: Record<string, string> = {
  pinch: "text-orange-400",
  grab: "text-amber-400",
  open_palm: "text-green-400",
  closed_fist: "text-red-400",
  point: "text-cyan-400",
  thumbs_up: "text-emerald-400",
  victory: "text-violet-400",
  swipe_left: "text-sky-400",
  swipe_right: "text-sky-400",
  swipe_up: "text-blue-400",
  swipe_down: "text-blue-400",
  none: "text-slate-500",
};

function getStatusColor(value: number, thresholds: [number, number]): string {
  if (value >= thresholds[0]) return "text-green-400";
  if (value >= thresholds[1]) return "text-yellow-400";
  return "text-red-400";
}

export default function DiagnosticsPanel({
  fps,
  latencyMs,
  confidence,
  gesture,
  handedness,
  handsDetected = 0,
  interactionState,
}: Props) {
  const gestureColor = GESTURE_COLORS[gesture] ?? "text-slate-500";
  const fpsColor = getStatusColor(fps, [30, 15]);
  const latencyColor =
    latencyMs < 50
      ? "text-green-400"
      : latencyMs < 100
        ? "text-yellow-400"
        : "text-red-400";

  return (
    <div className="bg-slate-900 text-slate-100 p-4 rounded-lg border border-slate-700 space-y-3 text-sm font-mono">
      <h3 className="text-xs uppercase tracking-wider text-slate-400">
        Performance
      </h3>

      <div className="grid grid-cols-2 gap-y-2 gap-x-4">
        <div>
          <span className="text-slate-400">FPS</span>
          <span className={`ml-2 font-bold ${fpsColor}`}>
            {fps}
          </span>
        </div>
        <div>
          <span className="text-slate-400">Latency</span>
          <span className={`ml-2 font-bold ${latencyColor}`}>
            {latencyMs}ms
          </span>
        </div>
        <div>
          <span className="text-slate-400">Confidence</span>
          <span className="ml-2 text-yellow-400 font-bold">
            {confidence}%
          </span>
        </div>
        <div>
          <span className="text-slate-400">Hands</span>
          <span className="ml-2 text-cyan-400 font-bold">
            {handsDetected}
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-700">
        <span className="text-slate-400">Handedness</span>
        <span className="ml-2 text-purple-400">
          {handedness || "—"}
        </span>
      </div>

      <div className="pt-2 border-t border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Gesture</span>
          <span className={`font-bold uppercase ${gestureColor}`}>
            {gesture.replace("_", " ")}
          </span>
        </div>
      </div>

      {interactionState && (
        <div className="pt-2 border-t border-slate-700">
          <h4 className="text-xs uppercase tracking-wider text-slate-400 mb-2">
            Interaction State
          </h4>
          <div className="grid grid-cols-1 gap-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Cursor</span>
              <span className="text-green-400">
                ({interactionState.cursorX.toFixed(3)},{" "}
                {interactionState.cursorY.toFixed(3)})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mode</span>
              <span
                className={
                  interactionState.isInteracting
                    ? "text-orange-400 font-bold"
                    : "text-slate-500"
                }
              >
                {interactionState.isPinching
                  ? "🔍 Click"
                  : interactionState.isGrabbing
                    ? "✋ Drag"
                    : "○ Idle"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Landmark reference */}
      <div className="pt-2 border-t border-slate-700">
        <h4 className="text-xs uppercase tracking-wider text-slate-400 mb-1">
          Gesture Reference
        </h4>
        <div className="text-[10px] text-slate-500 grid grid-cols-2 gap-x-3 gap-y-0.5">
          <span>Pinch → Click</span>
          <span>Grab → Drag</span>
          <span>Open Palm → Reset</span>
          <span>Point → Navigate</span>
          <span>Victory → Select</span>
          <span>Fist → Hold</span>
        </div>
      </div>
    </div>
  );
}