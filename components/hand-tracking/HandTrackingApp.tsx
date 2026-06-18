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
  gestureToInteraction,
  detectFingerSpread,
  detectTwoHandGesture,
  GestureStateMachine,
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
  HandSmoother,
  AutoCalibrator,
  MotionTrail,
  type Landmark,
  type InteractionState,
  type GestureInteraction,
  createDefaultInteractionState,
} from "@/lib/hand-tracking";
import HandVisualizer from "./HandVisualizer";
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
  FilesetResolver: { forVisionTasks: (path: string) => Promise<unknown> };
  HandLandmarker: {
    createFromOptions: (filesetResolver: unknown, opts: {
      baseOptions: { modelAssetPath: string };
      numHands?: number;
    }) => Promise<HandLandmarkerInstance>;
  };
};

type CameraStatus = "ONLINE" | "PAUSED" | "OFFLINE";

// ── Main Component ──────────────────────────────────────────────────────────

export default function HandTrackingApp() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [rawLandmarks, setRawLandmarks] = useState<Landmark[][] | null>(null);

  // State
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("OFFLINE");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [mirrorView, setMirrorView] = useState(true);
  const [fps, setFps] = useState(0);
  const [latencyMs, setLatencyMs] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [gesture, setGesture] = useState<GestureType>("none");
  const [interaction, setInteraction] = useState<GestureInteraction>("idle");
  const [handedness, setHandedness] = useState<string | null>(null);
  const [handsDetected, setHandsDetected] = useState(0);
  const [calibrationMode, setCalibrationMode] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [showParticles, setShowParticles] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [deadZone, setDeadZone] = useState(0.015);
  const [smoothFactor, setSmoothFactor] = useState(0.25);
  const [kalmanNoise, setKalmanNoise] = useState(0.03);
  const [interactionState, setInteractionState] =
    useState<InteractionState>(createDefaultInteractionState());
  const [gestureLog, setGestureLog] = useState<{ id: number; text: string; type: string }[]>([]);

  // Refs
  const modelRef = useRef<HandLandmarkerInstance | null>(null);
  const rafRef = useRef<number | null>(null);
  const historyRef = useRef(new GestureHistory());
  const debouncerRef = useRef(new GestureDebouncer());
  const stabilityRef = useRef(new GestureStabilityFilter());
  const cursorRef = useRef(new SpatialCursor());
  const prevHandsRef = useRef<Hand[] | null>(null);
  const smootherRef = useRef(new HandSmoother(21, 0.03, 0.08));
  const autoCalibratorRef = useRef(new AutoCalibrator());
  const motionTrailRef = useRef(new MotionTrail());
  const calibrationRef = useRef({
    offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1,
  });
  const interactionRef = useRef<InteractionState>(createDefaultInteractionState());
  const gestureRef = useRef<GestureType>("none");
  const stateMachineRef = useRef(new GestureStateMachine());

  useEffect(() => { gestureRef.current = gesture; }, [gesture]);

  // Logging System
  const log = useCallback((msg: string) => {
    console.log(`[AETHER] ${msg}`);
    if (msg.includes("DETECTED") && Math.random() > 0.95) return; // Reduce spam for detection logs
  }, []);

  useEffect(() => {
    if (gesture !== "none") {
      log(`GESTURE_DETECTED: ${gesture}`);
      setGestureLog(prev => [
        { id: Date.now(), text: `GESTURE: ${gesture.toUpperCase()}`, type: gesture },
        ...prev.slice(0, 4)
      ],);
    }
  }, [gesture]);

  // ── Gesture Detection Pipeline ──────────────────────────────────────────

  const detectAllGestures = useCallback((hands: Hand[]): GestureType => {
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
      gestures.push(detectFingerSpread(hand));
      if (prevHandsRef.current?.length) {
        gestures.push(detectSwipe(hand, prevHandsRef.current[0], 0.04).gesture);
      }
    }

    if (hands.length === 2) {
      const twoHand = detectTwoHandGesture(hands[0], hands[1]);
      if (twoHand.type !== "none") {
        return twoHand.type;
      }
    }

    const best = gestures.reduce(
      (max, g) => (g.score > max.score ? g : max),
      { type: "none" as GestureType, score: 0 },
    );

    // High-priority transient gestures (swipes) bypass the smoothing/stability pipeline
    if (best.type.startsWith("swipe_") && best.score > 0.05) return best.type;

    historyRef.current.add(best);
    const smoothed = historyRef.current.getSmoothed();
    const debounced = debouncerRef.current.debounce(smoothed);
    return stabilityRef.current.update(debounced.type !== "none" ? debounced.type : smoothed.type);
  }, []);

  // ── Camera Initialization ───────────────────────────────────────────────

  const initCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        log("CAMERA_STARTED");
        return true;
      }
    } catch (e) {
      setPermissionDenied(true);
      console.error("Camera access failed", e);
    }
    return false;
  }, [log]);

  async function loadModel(): Promise<HandLandmarkerInstance> {
    if (modelRef.current) return modelRef.current;
    const mp = (await import("@mediapipe/tasks-vision")) as unknown as MP;
    const filesetResolver = await mp.FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm",
    );
    const model = await mp.HandLandmarker.createFromOptions(filesetResolver, {
      baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker.task" },
      numHands: 2,
    });
    modelRef.current = model;
    log("MODEL_LOADED");
    return model;
  }

  // ── Main Tracking Loop ──────────────────────────────────────────────────

  useEffect(() => {
    if (cameraStatus !== "ONLINE") return;
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    const loop = async () => {
      if ((cameraStatus as CameraStatus) === "PAUSED") {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      if (!videoRef.current || videoRef.current.readyState < 2) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const t0 = performance.now();
      try {
        const model = await loadModel();
        log("FRAME_RECEIVED");
        const results = model.detectForVideo(videoRef.current, performance.now());
        setLatencyMs(Math.round(performance.now() - t0));

        if (results.handedness?.length) {
          log("LANDMARKS_DETECTED");
          setHandedness(results.handedness[0].label || null);
          setHandsDetected(results.handedness.length);
          setConfidence(Math.round((results.handedness[0].score || 0) * 100));
        } else {
          setHandsDetected(0);
          setHandedness(null);
          setConfidence(0);
        }

        if (results.landmarks?.length) {
          // Apply Kalman smoothing
          const smoothedHands = results.landmarks.map(lm =>
            smootherRef.current.smooth(lm.map(p => ({ x: p.x, y: p.y, z: p.z })))
          );

          // Auto-calibration
          const calOffset = autoCalibratorRef.current.calibrate(smoothedHands[0]);

          // Build Hand objects with coordinate flip + calibration
          const hands: Hand[] = smoothedHands.map((lm, idx) => ({
            landmarks: lm.map(p => {
              const calX = (p.x - 0.5) * calibrationRef.current.scaleX + calOffset.offsetX + calibrationRef.current.offsetX;
              const calY = (p.y - 0.5) * calibrationRef.current.scaleY + calOffset.offsetY + calibrationRef.current.offsetY;
              return {
                ...transformLandmark({ x: applyDeadZone(calX, deadZone) + 0.5, y: applyDeadZone(calY, deadZone) + 0.5, z: p.z }, mirrorView),
              };
            }),
            handedness: results.handedness?.[idx]?.label,
          })) satisfies Hand[];

          // Edge-of-frame recovery
          for (const hand of hands) {
            for (const lm of hand.landmarks) {
              if (lm.x < 0.05) lm.x = 0.05 + (lm.x - 0.05) * 0.5;
              if (lm.x > 0.95) lm.x = 0.95 + (lm.x - 0.95) * 0.5;
              if (lm.y < 0.05) lm.y = 0.05 + (lm.y - 0.05) * 0.5;
              if (lm.y > 0.95) lm.y = 0.95 + (lm.y - 0.95) * 0.5;
            }
          }

          const rawGesture = detectAllGestures(hands);
          const stateResult = stateMachineRef.current.update(rawGesture);
          const detectedGesture = stateResult.gesture;
          const gestureInteraction = gestureToInteraction(detectedGesture);
          setGesture(detectedGesture);
          setInteraction(gestureInteraction);

          const isPinching = detectedGesture === "pinch";
          const isGrabbing = detectedGesture === "grab";

          // Cursor update
          if (hands[0]?.landmarks[9]) {
            const palm = hands[0].landmarks[9];
            const curPos = cursorRef.current.getPosition();
            const sx = exponentialSmooth(curPos.x, palm.x, smoothFactor);
            const sy = exponentialSmooth(curPos.y, palm.y, smoothFactor);
            cursorRef.current.setPosition(sx, sy);
          }

          // Motion trail
          if (hands[0]?.landmarks[8]) {
            const tip = hands[0].landmarks[8];
            motionTrailRef.current.add(tip.x, tip.y);
          }

          // Update raw landmarks for visualizer (use flipped coords from hands)
          setRawLandmarks(hands.map(h => h.landmarks));

          const curPos = cursorRef.current.getPosition();
          const newState: InteractionState = {
            gesture: detectedGesture,
            interaction: gestureInteraction,
            cursorX: curPos.x,
            cursorY: curPos.y,
            isPinching,
            isGrabbing,
            isInteracting: isPinching || isGrabbing,
          };
          interactionRef.current = newState;
          setInteractionState(newState);
          prevHandsRef.current = hands;
        } else {
          setGesture("none");
          setInteraction("idle");
          setRawLandmarks(null);
          prevHandsRef.current = null;
          setInteractionState(createDefaultInteractionState());
          interactionRef.current = createDefaultInteractionState();
        }
      } catch (err) {
        console.error(err);
      }

      frameCount++;
      const now = performance.now();
      if (now - lastFpsUpdate > 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastFpsUpdate)));
        frameCount = 0;
        lastFpsUpdate = now;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [cameraStatus, calibrationMode, deadZone, smoothFactor, kalmanNoise, mirrorView, log]);

  // ── Controls ────────────────────────────────────────────────────────────

  const stopCamera = useCallback(() => {
    setCameraStatus("OFFLINE");
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (stream) { stream.getTracks().forEach(t => t.stop()); if (videoRef.current) videoRef.current.srcObject = null; }
    setRawLandmarks(null);
    setGesture("none");
    setInteraction("idle");
    setHandsDetected(0);
  }, []);

  const pauseCamera = useCallback(() => {
    setCameraStatus(prev => prev === "ONLINE" ? "PAUSED" : prev === "PAUSED" ? "ONLINE" : prev);
  }, []);

  const startTracking = useCallback(async () => {
    const ok = await initCamera();
    if (!ok) return;
    setCameraStatus("ONLINE");
    cursorRef.current.reset();
    prevHandsRef.current = null;
    historyRef.current.clear();
    stabilityRef.current.reset();
  }, [initCamera]);

  const restartCamera = useCallback(async () => {
    stopCamera();
    // Brief delay to ensure hardware release
    setTimeout(() => {
      startTracking();
    }, 300);
  }, [stopCamera, startTracking]);

  function handleResetTracking() {
    stopCamera();
    cursorRef.current.reset();
    smootherRef.current.reset();
    autoCalibratorRef.current.reset();
    calibrationRef.current = { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 };
    prevHandsRef.current = null;
    historyRef.current.clear();
    debouncerRef.current.reset();
    stabilityRef.current.reset();
    smootherRef.current.reset();
    autoCalibratorRef.current.reset();
    motionTrailRef.current.clear();
    setInteractionState(createDefaultInteractionState());
    setGesture("none");
    setInteraction("idle");
    setHandsDetected(0);
    setFps(0);
    setLatencyMs(0);
    setConfidence(0);
    setHandedness(null);
    setRawLandmarks(null);
  }

  function handleApplyCalibration(cal: { offsetX: number; offsetY: number; scaleX: number; scaleY: number }) {
    calibrationRef.current = cal;
    setCalibrationMode(false);
  }

  if (permissionDenied) return <PermissionsFallback />;

  return (
    <div className="space-y-4 bg-black/20 p-6 rounded-2xl border border-aether-border/10">
      {/* Workspace Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold tracking-tight text-white">Hand Tracking Workspace</h2>
          <p className="text-[10px] text-aether-text-muted font-mono uppercase tracking-widest">Aether Core v2.4.0</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">CAMERA:</span>
            <span className={cameraStatus === "ONLINE" ? "text-green-400" : cameraStatus === "PAUSED" ? "text-yellow-400" : "text-red-500"}>
              {cameraStatus}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">FPS:</span>
            <span className={fps > 45 ? "text-green-400" : fps > 20 ? "text-yellow-400" : "text-red-400"}>{fps}</span>
          </div>
        </div>
      </div>

      {/* Video + Visualization Feed */}
      <div className="relative w-full overflow-hidden rounded-xl border border-aether-border bg-black/90" style={{ aspectRatio: "16/9" }}>
        <video ref={videoRef} className="w-full h-full object-cover" style={{ transform: mirrorView ? "scaleX(-1)" : "none" }} playsInline muted />
        <div className="absolute inset-0 pointer-events-none">
          <HandVisualizer
            landmarks={rawLandmarks}
            gesture={gesture}
            interaction={interaction}
            confidence={confidence / 100}
            handedness={handedness}
            width={1280}
            height={720}
            showLabels={showLabels}
            showParticles={showParticles}
            showTrails={showTrails}
          />
        </div>

        {/* Grid overlay */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }} />
        )}

        {/* Interaction border overlay */}
        {interactionState.isInteracting && (
          <div className="absolute inset-0 pointer-events-none border-2 rounded-xl transition-all duration-150"
            style={{ borderColor: interactionState.isPinching ? "rgba(255,100,50,0.3)" : "rgba(255,150,0,0.2)" }} />
        )}

        {/* Status overlay */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {cameraStatus === "ONLINE" && (
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
              {gesture.replace(/_/g, " ")} → {interaction}
            </span>
          </div>
        )}

        {/* Live Status Feed */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end pointer-events-none">
          {gestureLog.map((log) => (
            <div key={log.id} className="px-2 py-1 rounded bg-black/80 border border-aether-border/30 text-[10px] font-mono text-cyan-400 backdrop-blur-md transition-all animate-in fade-in slide-in-from-right-2">
              <span className="text-aether-accent-light mr-2 opacity-50">
                {new Date(log.id).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              {log.text}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
        <div className="flex items-center gap-1.5">
          <button className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-all" onClick={cameraStatus === "OFFLINE" ? startTracking : stopCamera}>
             {cameraStatus === "OFFLINE" ? "▶ Start Tracking" : "■ Stop Camera"}
          </button>
          {cameraStatus !== "OFFLINE" && (
            <button className="btn-secondary" onClick={pauseCamera}>
              {cameraStatus === "PAUSED" ? "▶ Resume" : "⏸ Pause"}
            </button>
          )}
          <button className="btn-secondary" onClick={restartCamera}>🔄 Restart</button>
        </div>

        <div className="flex items-center gap-2">
          <button className={`btn-secondary text-[10px] ${mirrorView ? "border-cyan-500/50 text-cyan-400" : ""}`} onClick={() => setMirrorView(!mirrorView)}>
            {mirrorView ? "Mirror View: ON" : "Mirror View: OFF"}
          </button>
          <button className="btn-secondary text-[10px]" onClick={() => setCalibrationMode(v => !v)}>Calibrate</button>
          <div className="h-4 w-[1px] bg-slate-700 mx-2" />
          <button className={`p-2 rounded hover:bg-slate-800 ${showGrid ? "text-cyan-400" : "text-slate-400"}`} onClick={() => setShowGrid(!showGrid)} title="Toggle Grid">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          </button>
        </div>
      </div>

      {/* Calibration Panel */}
      {calibrationMode && <CalibrationModal onApply={handleApplyCalibration} onClose={() => setCalibrationMode(false)} />}

      {/* Diagnostics + Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DiagnosticsPanel
          fps={fps} latencyMs={latencyMs} confidence={confidence} gesture={gesture}
          handedness={handedness} handsDetected={handsDetected} interactionState={interactionState}
        />

        {/* Settings */}
        <div className="bg-slate-900 text-slate-100 p-4 rounded-lg border border-slate-700 space-y-4 text-sm font-mono">
          <h3 className="text-xs uppercase tracking-wider text-slate-400">Tracking Settings</h3>
          {[
            { label: "Dead Zone", value: deadZone, min: 0, max: 0.05, step: 0.001, set: setDeadZone },
            { label: "Smoothing", value: smoothFactor, min: 0, max: 0.8, step: 0.01, set: setSmoothFactor },
            { label: "Kalman Noise", value: kalmanNoise, min: 0.01, max: 0.2, step: 0.01, set: setKalmanNoise },
          ].map(({ label, value, min, max, step, set: setter }) => (
            <div key={label} className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">{label}</span>
                <span className="text-cyan-400">{value.toFixed(3)}</span>
              </div>
              <input type="range" min={min} max={max} step={step} value={value}
                onChange={e => setter(parseFloat(e.target.value))} className="w-full accent-violet-500" />
            </div>
          ))}
        </div>

        {/* Interaction Map */}
        <div className="bg-slate-900 text-slate-100 p-4 rounded-lg border border-slate-700 space-y-3 text-sm font-mono">
          <h3 className="text-xs uppercase tracking-wider text-slate-400">Interaction Map</h3>
          <div className="space-y-1 text-[11px]">
            {[
              { gesture: "Pinch", action: "Click / Select", icon: "🤏" },
              { gesture: "Grab", action: "Drag / Move", icon: "✊" },
              { gesture: "Point", action: "Hover / Navigate", icon: "👆" },
              { gesture: "Open Palm", action: "Command Menu", icon: "🖐" },
              { gesture: "Victory", action: "Select", icon: "✌️" },
              { gesture: "Swipe", action: "Change Section", icon: "👋" },
              { gesture: "Two Hands", action: "Zoom Workspace", icon: "🤲" },
            ].map(({ gesture: g, action, icon }) => (
              <div key={g} className="flex justify-between">
                <span className="text-slate-400">{icon} {g}</span>
                <span className={interactionState.gesture.toLowerCase().includes(g.toLowerCase()) ? "text-orange-400 font-bold" : "text-slate-500"}>
                  {action}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ label, value, status }: { label: string, value: string, status: 'success' | 'warning' | 'error' }) {
  const colors = {
    success: 'text-green-400 bg-green-400/10 border-green-400/20',
    warning: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    error: 'text-red-400 bg-red-400/10 border-red-400/20',
  };
  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded-lg border font-mono text-[10px] ${colors[status]}`}>
      <span className="opacity-50 uppercase">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
