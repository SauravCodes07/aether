"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  detectPinch,
  detectOpenPalm,
  detectGrab,
  detectClosedFist,
  detectPoint,
  detectThumbsUp,
  detectVictory,
  detectSwipe,
  detectTwoHandGesture,
  Hand,
  Gesture,
  GestureType,
  GestureHistory,
  GestureDebouncer,
  SpatialCursor,
  transformLandmark,
  applyDeadZone,
  GestureStabilityFilter,
  exponentialSmooth,
  type InteractionState,
  createDefaultInteractionState,
} from "@/lib/hand-tracking";
import DiagnosticsPanel from "./DiagnosticsPanel";
import CalibrationModal from "./CalibrationModal";
import PermissionsFallback from "./PermissionsFallback";

// ── MediaPipe Types ─────────────────────────────────────────────────────────

type MPResult = {
  landmarks?: Array<Array<{ x: number; y: number; z?: number }>>;
  handedness?: Array<{ label?: string; score?: number }>;
};

type HandLandmarkerInstance = {
  detectForVideo: (video: HTMLVideoElement, timestamp: number) => MPResult;
  close?: () => void;
};

type MP = {
  FilesetResolver: {
    forVisionTasks: (path: string) => Promise<unknown>;
  };
  HandLandmarker: {
    createFromOptions: (
      filesetResolver: unknown,
      opts: {
        baseOptions: { modelAssetPath: string };
        numHands?: number;
      },
    ) => Promise<HandLandmarkerInstance>;
  };
};

// ── Canvas Drawing Helpers ──────────────────────────────────────────────────

const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
];

function drawHandLandmarks(
  ctx: CanvasRenderingContext2D,
  handLandmarks: Array<{ x: number; y: number; z?: number }>,
  isGrabbing: boolean,
) {
  // Draw connections
  ctx.strokeStyle = isGrabbing
    ? "rgba(255,100,50,0.7)"
    : "rgba(0,200,150,0.6)";
  ctx.lineWidth = 0.002;

  for (const [start, end] of HAND_CONNECTIONS) {
    const p1 = handLandmarks[start];
    const p2 = handLandmarks[end];
    if (p1 && p2) {
      ctx.beginPath();
      ctx.moveTo(1 - p1.x, p1.y);
      ctx.lineTo(1 - p2.x, p2.y);
      ctx.stroke();
    }
  }

  // Draw landmark points
  for (let i = 0; i < handLandmarks.length; i++) {
    const p = handLandmarks[i];
    const isFingerTip = [4, 8, 12, 16, 20].includes(i);
    const radius = isFingerTip ? 0.008 : 0.005;
    const alpha = isFingerTip ? 1.0 : 0.8;

    ctx.fillStyle = isGrabbing
      ? `rgba(255,100,50,${alpha})`
      : `rgba(0,200,150,${alpha})`;
    ctx.beginPath();
    ctx.arc(1 - p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSpatialGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) {
  ctx.strokeStyle = "rgba(139,92,246,0.06)";
  ctx.lineWidth = 1;
  const spacing = 48;

  for (let x = 0; x < w; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function drawCursor(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  gesture: GestureType,
  isInteracting: boolean,
) {
  // Cursor glow
  const glowColor =
    gesture === "pinch"
      ? "rgba(255,100,50,0.15)"
      : gesture === "grab"
        ? "rgba(255,150,0,0.12)"
        : "rgba(139,92,246,0.12)";

  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 0.04);
  gradient.addColorStop(0, glowColor);
  gradient.addColorStop(1, "transparent");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, 0.04, 0, Math.PI * 2);
  ctx.fill();

  // Cursor dot
  const dotColor =
    isInteracting
      ? "rgba(255,100,50,0.9)"
      : gesture === "pinch"
        ? "rgba(255,100,50,0.8)"
        : "rgba(139,92,246,0.7)";
  ctx.fillStyle = dotColor;
  ctx.beginPath();
  ctx.arc(cx, cy, isInteracting ? 0.012 : 0.008, 0, Math.PI * 2);
  ctx.fill();

  // Crosshair
  ctx.strokeStyle = isInteracting
    ? "rgba(255,100,50,0.4)"
    : "rgba(139,92,246,0.3)";
  ctx.lineWidth = 0.0008;
  const size = isInteracting ? 0.025 : 0.02;
  ctx.beginPath();
  ctx.moveTo(cx - size, cy);
  ctx.lineTo(cx - 0.005, cy);
  ctx.moveTo(cx + 0.005, cy);
  ctx.lineTo(cx + size, cy);
  ctx.moveTo(cx, cy - size);
  ctx.lineTo(cx, cy - 0.005);
  ctx.moveTo(cx, cy + 0.005);
  ctx.lineTo(cx, cy + size);
  ctx.stroke();
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function HandTrackingApp() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // State
  const [running, setRunning] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [fps, setFps] = useState(0);
  const [latencyMs, setLatencyMs] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [gesture, setGesture] = useState<GestureType>("none");
  const [handedness, setHandedness] = useState<string | null>(null);
  const [handsDetected, setHandsDetected] = useState(0);
  const [calibrationMode, setCalibrationMode] = useState(false);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [deadZone, setDeadZone] = useState(0.015);
  const [smoothFactor, setSmoothFactor] = useState(0.25);
  const [interactionState, setInteractionState] =
    useState<InteractionState>(createDefaultInteractionState());

  // Refs (non-reactive mutable state for per-frame updates)
  const modelRef = useRef<HandLandmarkerInstance | null>(null);
  const rafRef = useRef<number | null>(null);
  const historyRef = useRef(new GestureHistory());
  const debouncerRef = useRef(new GestureDebouncer());
  const stabilityRef = useRef(new GestureStabilityFilter());
  const cursorRef = useRef(new SpatialCursor());
  const prevHandsRef = useRef<Hand[] | null>(null);
  const calibrationRef = useRef<{
    offsetX: number;
    offsetY: number;
    scaleX: number;
    scaleY: number;
  }>({ offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 });
  const interactionRef = useRef<InteractionState>(
    createDefaultInteractionState(),
  );
  const gestureRef = useRef<GestureType>("none");

  // Keep refs in sync
  useEffect(() => {
    gestureRef.current = gesture;
  }, [gesture]);

  // ── Gesture Detection Pipeline ──────────────────────────────────────────

  const detectAllGestures = useCallback(
    (hands: Hand[]): GestureType => {
      if (hands.length === 0) return "none";

      const gestures: Gesture[] = [];
      for (const hand of hands) {
        gestures.push(detectPinch(hand));
        gestures.push(detectGrab(hand));
        gestures.push(detectOpenPalm(hand));
        gestures.push(detectClosedFist(hand));
        gestures.push(detectPoint(hand));
        gestures.push(detectThumbsUp(hand));
        gestures.push(detectVictory(hand));
        if (prevHandsRef.current && prevHandsRef.current.length > 0) {
          gestures.push(
            detectSwipe(hand, prevHandsRef.current[0]).gesture,
          );
        }
      }

      const best = gestures.reduce(
        (max, g) => (g.score > max.score ? g : max),
        { type: "none" as GestureType, score: 0 },
      );

      historyRef.current.add(best);
      const smoothed = historyRef.current.getSmoothed();
      const debounced = debouncerRef.current.debounce(smoothed);
      const stable = stabilityRef.current.update(
        debounced.type !== "none" ? debounced.type : smoothed.type,
      );
      return stable;
    },
    [],
  );

  // ── Camera Initialization ───────────────────────────────────────────────

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
        });
        if (!mounted) return;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (e) {
        if (mounted) setPermissionDenied(true);
        console.error("Camera permission denied", e);
      }
    }

    startCamera();

    return () => {
      mounted = false;
      stop();
    };
  }, []);

  // ── Model Loading ───────────────────────────────────────────────────────

  async function loadModel(): Promise<HandLandmarkerInstance> {
    const mp = (await import("@mediapipe/tasks-vision")) as unknown as MP;
    const filesetResolver = await mp.FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm",
    );
    return mp.HandLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker.task",
      },
      numHands: 2,
    });
  }

  // ── Main Tracking Loop ──────────────────────────────────────────────────

  useEffect(() => {
    if (!running) return;
    let lastTs = performance.now();

    const loop = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const t0 = performance.now();
      const mediaTs = performance.now();
      try {
        if (!modelRef.current) {
          modelRef.current = await loadModel();
        }
        const results = modelRef.current.detectForVideo(
          videoRef.current,
          mediaTs,
        );
        const t1 = performance.now();
        setLatencyMs(Math.round(t1 - t0));

        drawResults(results);

        // Diagnostics
        if (results.handedness && results.handedness.length) {
          setHandedness(results.handedness[0].label || null);
          setHandsDetected(results.handedness.length);
          setConfidence(
            Math.round((results.handedness[0].score || 0) * 100),
          );
        } else {
          setHandsDetected(0);
          setHandedness(null);
          setConfidence(0);
        }

        // Gesture detection + cursor update
        if (
          results.landmarks &&
          results.landmarks.length > 0
        ) {
          const hands: Hand[] = results.landmarks.map(
            (lm, idx) =>
              ({
                landmarks: lm.map((p) =>
                  transformLandmark(
                    { x: p.x, y: p.y, z: p.z },
                    !calibrationMode,
                  ),
                ),
                handedness: results.handedness?.[idx]?.label,
              }) satisfies Hand,
          );

          const detectedGesture = detectAllGestures(hands);
          setGesture(detectedGesture);

          // Update interaction state
          const isPinching = detectedGesture === "pinch";
          const isGrabbing = detectedGesture === "grab";
          const isInteracting = isPinching || isGrabbing;

          // Update cursor from middle finger MCP (landmark 9) with dead-zone + smoothing
          if (hands.length > 0 && hands[0].landmarks[9]) {
            const palmPos = hands[0].landmarks[9];

            // Apply calibration offsets
            const calX =
              (palmPos.x - 0.5) * calibrationRef.current.scaleX +
              calibrationRef.current.offsetX;
            const calY =
              (palmPos.y - 0.5) * calibrationRef.current.scaleY +
              calibrationRef.current.offsetY;

            // Dead-zone filtering
            const filteredX = applyDeadZone(calX, deadZone) + 0.5;
            const filteredY = applyDeadZone(calY, deadZone) + 0.5;

            // Smooth cursor position
            const curPos = cursorRef.current.getPosition();
            const targetX = filteredX;
            const targetY = filteredY;
            const sx = exponentialSmooth(curPos.x, targetX, smoothFactor);
            const sy = exponentialSmooth(curPos.y, targetY, smoothFactor);

            cursorRef.current.setPosition(sx, sy);
          }

          // Two-hand gestures
          if (hands.length >= 2) {
            const twoHand = detectTwoHandGesture(hands);
            if (twoHand.type !== "none") {
              void twoHand; // Available for resize/rotate UI
            }
          }

          const curPos = cursorRef.current.getPosition();
          const newState: InteractionState = {
            gesture: detectedGesture,
            cursorX: curPos.x,
            cursorY: curPos.y,
            isPinching,
            isGrabbing,
            isInteracting,
          };
          interactionRef.current = newState;
          setInteractionState(newState);

          prevHandsRef.current = hands;
        } else {
          // No hands detected
          setGesture("none");
          prevHandsRef.current = null;
          setInteractionState(createDefaultInteractionState());
          interactionRef.current = createDefaultInteractionState();
        }
      } catch (err) {
        console.error(err);
      }

      // FPS tracking
      const now = performance.now();
      const delta = now - lastTs;
      lastTs = now;
      setFps(Math.round(1000 / delta));

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // detectAllGestures and drawResults access refs and are stable —
    // adding them would cause the loop to restart on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, calibrationMode, deadZone, smoothFactor]);

  // ── Canvas Rendering ────────────────────────────────────────────────────

  function drawResults(results: MPResult | undefined) {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(canvas.width, canvas.height);

    // Spatial grid (optional)
    if (showGrid) {
      drawSpatialGrid(ctx, canvas.width, canvas.height);
    }

    // Draw hand landmarks with COORDINATE FLIP for mirror alignment
    if (showLandmarks && results && results.landmarks) {
      for (const handLandmarks of results.landmarks) {
        drawHandLandmarks(ctx, handLandmarks, gestureRef.current === "grab");
      }
    }

    // Draw spatial cursor
    const pos = cursorRef.current.getPosition();
    // Cursor position is in flipped coordinate space — same as canvas drawing
    // (canvas is NOT CSS-mirrored, cursor stores flipped x)
    drawCursor(ctx, pos.x, pos.y, gestureRef.current, interactionRef.current.isInteracting);

    // Draw label for current gesture
    if (gestureRef.current !== "none") {
      ctx.fillStyle = "rgba(139,92,246,0.7)";
      ctx.font = "12px monospace";
      ctx.fillText(gestureRef.current, pos.x + 0.02, pos.y - 0.02);
    }

    ctx.restore();
  }

  // ── Controls ────────────────────────────────────────────────────────────

  function stop() {
    setRunning(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    }
    if (modelRef.current && modelRef.current.close) modelRef.current.close();
    modelRef.current = null;
  }

  function startTracking() {
    setRunning(true);
    cursorRef.current.reset();
    prevHandsRef.current = null;
    historyRef.current.clear();
    debouncerRef.current.reset();
    stabilityRef.current.reset();
    interactionRef.current = createDefaultInteractionState();
  }

  function handleResetTracking() {
    stop();
    cursorRef.current.reset();
    cursorRef.current.setPosition(0.5, 0.5);
    calibrationRef.current = { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 };
    prevHandsRef.current = null;
    historyRef.current.clear();
    debouncerRef.current.reset();
    stabilityRef.current.reset();
    interactionRef.current = createDefaultInteractionState();
    setInteractionState(createDefaultInteractionState());
    setGesture("none");
    setHandsDetected(0);
    setFps(0);
    setLatencyMs(0);
    setConfidence(0);
    setHandedness(null);
  }

  function handleApplyCalibration(cal: {
    offsetX: number;
    offsetY: number;
    scaleX: number;
    scaleY: number;
  }) {
    calibrationRef.current = cal;
    setCalibrationMode(false);
  }

  // ── Permission Fallback ─────────────────────────────────────────────────

  if (permissionDenied) {
    return <PermissionsFallback />;
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Video + Canvas Feed */}
      <div className="relative w-full overflow-hidden rounded-xl border border-aether-border bg-black/90" style={{ aspectRatio: "16/9" }}>
        {/* CSS-mirrored video for natural mirror experience */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
          playsInline
          muted
        />
        {/* Canvas overlay: NOT CSS-mirrored. Landmarks are drawn at (1-x) positions
            so they align with the mirrored video. */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Interaction indicator overlay */}
        {interactionState.isInteracting && (
          <div
            className="absolute inset-0 pointer-events-none border-2 rounded-xl transition-all duration-150"
            style={{
              borderColor:
                interactionState.isPinching
                  ? "rgba(255,100,50,0.3)"
                  : "rgba(255,150,0,0.2)",
            }}
          />
        )}

        {/* Status overlay */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {running && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono bg-black/60 text-green-400 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              LIVE
            </span>
          )}
          {handsDetected > 0 && (
            <span className="px-2 py-1 rounded-md text-[10px] font-mono bg-black/60 text-cyan-400 backdrop-blur-sm">
              {handsDetected} hand{handsDetected > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Gesture indicator */}
        {gesture !== "none" && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-1 rounded-md text-[10px] font-mono bg-black/60 text-aether-accent backdrop-blur-sm uppercase">
              {gesture.replace("_", " ")}
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          className="btn-primary"
          onClick={running ? stop : startTracking}
        >
          {running ? "Stop Tracking" : "Start Tracking"}
        </button>
        <button className="btn-secondary" onClick={handleResetTracking}>
          Reset
        </button>
        <button
          className="btn-secondary"
          onClick={() => setCalibrationMode((v) => !v)}
        >
          {calibrationMode ? "Exit Calibration" : "Calibrate"}
        </button>
        <button
          className="btn-secondary"
          onClick={() => setShowLandmarks((v) => !v)}
        >
          {showLandmarks ? "Hide Landmarks" : "Show Landmarks"}
        </button>
        <button
          className="btn-secondary"
          onClick={() => setShowGrid((v) => !v)}
        >
          {showGrid ? "Hide Grid" : "Show Grid"}
        </button>
      </div>

      {/* Calibration Panel (inline) */}
      {calibrationMode && (
        <CalibrationModal
          onApply={handleApplyCalibration}
          onClose={() => setCalibrationMode(false)}
        />
      )}

      {/* Diagnostics + Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DiagnosticsPanel
          fps={fps}
          latencyMs={latencyMs}
          confidence={confidence}
          gesture={gesture}
          handedness={handedness}
          handsDetected={handsDetected}
          interactionState={interactionState}
        />

        {/* Settings Panel */}
        <div className="bg-slate-900 text-slate-100 p-4 rounded-lg border border-slate-700 space-y-4 text-sm font-mono">
          <h3 className="text-xs uppercase tracking-wider text-slate-400">
            Tracking Settings
          </h3>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Dead Zone</span>
              <span className="text-cyan-400">{deadZone.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.05"
              step="0.001"
              value={deadZone}
              onChange={(e) => setDeadZone(parseFloat(e.target.value))}
              className="w-full accent-violet-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Smoothing</span>
              <span className="text-cyan-400">
                {smoothFactor.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="0.8"
              step="0.01"
              value={smoothFactor}
              onChange={(e) =>
                setSmoothFactor(parseFloat(e.target.value))
              }
              className="w-full accent-violet-500"
            />
          </div>

          {/* Interaction State */}
          <div className="pt-3 border-t border-slate-700">
            <h4 className="text-xs uppercase tracking-wider text-slate-400 mb-2">
              Interaction
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400">Cursor: </span>
                <span className="text-green-400">
                  {interactionState.cursorX.toFixed(3)},{" "}
                  {interactionState.cursorY.toFixed(3)}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Action: </span>
                <span
                  className={
                    interactionState.isInteracting
                      ? "text-orange-400"
                      : "text-slate-500"
                  }
                >
                  {interactionState.isPinching
                    ? "Click"
                    : interactionState.isGrabbing
                      ? "Drag"
                      : "Idle"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}