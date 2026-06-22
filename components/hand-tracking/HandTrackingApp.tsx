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
  LowLightDetector,
  TrackingLossRecovery,
  type Landmark,
  type InteractionState,
  type GestureInteraction,
  type LightLevel,
  type TrackingState,
  createDefaultInteractionState,
} from "@/lib/hand-tracking";
import HandVisualizer from "./HandVisualizer";
import DiagnosticsPanel from "./DiagnosticsPanel";
import CalibrationModal from "./CalibrationModal";
import PermissionsFallback from "./PermissionsFallback";
import AirDrawingCanvas from "./AirDrawingCanvas";
import InteractionLab from "./InteractionLab";

// ── Types ─────────────────────────────────────────────────────────────────────

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
      runningMode?: "IMAGE" | "VIDEO";
    }) => Promise<HandLandmarkerInstance>;
  };
};

type CameraStatus = "ONLINE" | "PAUSED" | "OFFLINE";
type Tab = "tracking" | "air-draw" | "interaction-lab" | "settings";

// ── Tab Config ────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: string; desc: string }[] = [
  { id: "tracking",         label: "Tracking",         icon: "👁",  desc: "Live hand visualization" },
  { id: "air-draw",         label: "Air Draw",          icon: "✏",  desc: "Draw in 3D space" },
  { id: "interaction-lab",  label: "Interaction Lab",   icon: "⚡", desc: "Gesture-driven UI" },
  { id: "settings",         label: "Settings",          icon: "⚙",  desc: "Calibration & tuning" },
];

// ── Main Component ────────────────────────────────────────────────────────────

export default function HandTrackingApp() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [rawLandmarks, setRawLandmarks] = useState<Landmark[][] | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("tracking");

  // Camera & tracking state
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
  const [showCursor, setShowCursor] = useState(true);
  const [deadZone, setDeadZone] = useState(0.015);
  const [smoothFactor, setSmoothFactor] = useState(0.25);
  const [kalmanNoise, setKalmanNoise] = useState(0.03);
  const [interactionState, setInteractionState] = useState<InteractionState>(createDefaultInteractionState());
  const [gestureLog, setGestureLog] = useState<{ id: number; text: string; type: string }[]>([]);

  // Reliability state
  const [lightLevel, setLightLevel] = useState<LightLevel>("good");
  const [trackingState, setTrackingState] = useState<TrackingState>("lost");
  const [autoRestartCount, setAutoRestartCount] = useState(0);

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
  const lightDetectorRef = useRef<LowLightDetector | null>(null);
  const recoveryRef = useRef<TrackingLossRecovery | null>(null);
  const calibrationRef = useRef({ offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 });
  const interactionRef = useRef<InteractionState>(createDefaultInteractionState());
  const gestureRef = useRef<GestureType>("none");
  const stateMachineRef = useRef(new GestureStateMachine());
  const cursorPosRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => { gestureRef.current = gesture; }, [gesture]);

  // ── Logging ──────────────────────────────────────────────────────────────

  const log = useCallback((msg: string) => { console.log(`[AETHER] ${msg}`); }, []);

  useEffect(() => {
    if (gesture !== "none") {
      log(`GESTURE_DETECTED: ${gesture}`);
      setGestureLog(prev => [
        { id: Date.now(), text: `GESTURE: ${gesture.toUpperCase()}`, type: gesture },
        ...prev.slice(0, 4),
      ]);
    }
  }, [gesture, log]);

  // ── Gesture Detection Pipeline ────────────────────────────────────────────

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
        gestures.push(detectSwipe(hand, prevHandsRef.current[0]!, 0.04).gesture);
      }
    }

    if (hands.length === 2) {
      const twoHand = detectTwoHandGesture(hands[0]!, hands[1]!);
      if (twoHand.type !== "none") return twoHand.type;
    }

    const best = gestures.reduce(
      (max, g) => (g.score > max.score ? g : max),
      { type: "none" as GestureType, score: 0 },
    );

    if (best.type.startsWith("swipe_") && best.score > 0.05) return best.type;

    historyRef.current.add(best);
    const smoothed = historyRef.current.getSmoothed();
    const debounced = debouncerRef.current.debounce(smoothed);
    return stabilityRef.current.update(debounced.type !== "none" ? debounced.type : smoothed.type);
  }, []);

  // ── Camera Init ──────────────────────────────────────────────────────────

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
    } catch {
      setPermissionDenied(true);
      console.error("Camera access failed");
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
      runningMode: "VIDEO",
    });
    modelRef.current = model;
    log("MODEL_LOADED");
    return model;
  }

  // ── Main Tracking Loop ────────────────────────────────────────────────────

  useEffect(() => {
    if (cameraStatus !== "ONLINE") return;
    let frameCount = 0;
    let hasLoggedReady = false;
    let lastFpsUpdate = performance.now();

    const loop = async () => {
      if ((cameraStatus as CameraStatus) === "PAUSED") {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      if (!videoRef.current || videoRef.current.readyState < 2) {
        if (videoRef.current && videoRef.current.readyState >= 1 && !hasLoggedReady) {
           console.log("VIDEO_READY");
           hasLoggedReady = true;
        }
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      if (frameCount === 0) {
        console.log("VIDEO_READY (readyState >= 2)");
      }

      const t0 = performance.now();
      try {
        const model = await loadModel();
        
        if (frameCount % 60 === 0) {
          console.log("FRAME_RECEIVED", frameCount);
        }

        const results = model.detectForVideo(videoRef.current, performance.now());
        setLatencyMs(Math.round(performance.now() - t0));

        // Low-light detection
        if (lightDetectorRef.current && videoRef.current.readyState >= 2) {
          const level = lightDetectorRef.current.analyze(videoRef.current);
          setLightLevel(level);
        }

        const detected = results.handedness?.length ?? 0;
        if (detected > 0) {
          if (frameCount % 60 === 0) {
            console.log("LANDMARKS_DETECTED", detected, "hands");
          }
          setHandedness(results.handedness![0]!.label || null);
          setHandsDetected(detected);
          setConfidence(Math.round((results.handedness![0]!.score || 0) * 100));
        } else {
          setHandsDetected(0);
          setHandedness(null);
          setConfidence(0);
        }

        // Tracking recovery
        if (recoveryRef.current) {
          const tState = recoveryRef.current.update(detected);
          setTrackingState(tState);
          // Auto-restart if fully lost too many times
          if (recoveryRef.current.needsRestart() && cameraStatus === "ONLINE") {
            setAutoRestartCount(c => c + 1);
            recoveryRef.current.reset();
            // Trigger a soft restart after 2s
            setTimeout(() => restartCamera(), 2000);
          }
        }

        if (results.landmarks?.length) {
          const smoothedHands = results.landmarks.map(lm =>
            smootherRef.current.smooth(lm.map(p => ({ x: p.x, y: p.y, z: p.z })))
          );
          const calOffset = autoCalibratorRef.current.calibrate(smoothedHands[0]!);
          const hands: Hand[] = smoothedHands.map((lm, idx) => ({
            landmarks: lm.map(p => {
              const calX = (p.x - 0.5) * calibrationRef.current.scaleX + calOffset.offsetX + calibrationRef.current.offsetX;
              const calY = (p.y - 0.5) * calibrationRef.current.scaleY + calOffset.offsetY + calibrationRef.current.offsetY;
              return {
                ...transformLandmark(
                  { x: applyDeadZone(calX, deadZone) + 0.5, y: applyDeadZone(calY, deadZone) + 0.5, z: p.z },
                  mirrorView,
                ),
              };
            }),
            handedness: results.handedness?.[idx]?.label,
          })) satisfies Hand[];

          // Edge recovery
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
          
          if (detectedGesture !== "none" && frameCount % 60 === 0) {
             console.log("GESTURE_DETECTED", detectedGesture);
          }

          const gestureInteraction = gestureToInteraction(detectedGesture);
          setGesture(detectedGesture);
          setInteraction(gestureInteraction);

          const isPinching = detectedGesture === "pinch";
          const isGrabbing = detectedGesture === "grab";

          // Cursor update
          if (hands[0]?.landmarks[9]) {
            const palm = hands[0].landmarks[9]!;
            const curPos = cursorRef.current.getPosition();
            const sx = exponentialSmooth(curPos.x, palm.x, smoothFactor);
            const sy = exponentialSmooth(curPos.y, palm.y, smoothFactor);
            cursorRef.current.setPosition(sx, sy);
            cursorPosRef.current = { x: sx, y: sy };
          }

          if (hands[0]?.landmarks[8]) {
            motionTrailRef.current.add(hands[0].landmarks[8]!.x, hands[0].landmarks[8]!.y);
          }

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
  }, [cameraStatus, deadZone, smoothFactor, mirrorView, detectAllGestures]);

  // ── Camera Controls ───────────────────────────────────────────────────────

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
    // Init utility objects that require browser context
    if (!lightDetectorRef.current) {
      try { lightDetectorRef.current = new LowLightDetector(); } catch { /* ssr guard */ }
    }
    if (!recoveryRef.current) {
      recoveryRef.current = new TrackingLossRecovery(1500, 3, {
        onLost: () => log("TRACKING_LOST"),
        onRecovered: () => log("TRACKING_RECOVERED"),
      });
    }

    const ok = await initCamera();
    if (!ok) return;
    setCameraStatus("ONLINE");
    cursorRef.current.reset();
    prevHandsRef.current = null;
    historyRef.current.clear();
    stabilityRef.current.reset();
    recoveryRef.current?.reset();
  }, [initCamera, log]);

  const restartCamera = useCallback(async () => {
    stopCamera();
    setTimeout(() => { startTracking(); }, 400);
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
    motionTrailRef.current.clear();
    recoveryRef.current?.reset();
    setInteractionState(createDefaultInteractionState());
    setGesture("none");
    setInteraction("idle");
    setHandsDetected(0);
    setFps(0);
    setLatencyMs(0);
    setConfidence(0);
    setHandedness(null);
    setRawLandmarks(null);
    setAutoRestartCount(0);
  }

  function handleApplyCalibration(cal: { offsetX: number; offsetY: number; scaleX: number; scaleY: number }) {
    calibrationRef.current = cal;
    setCalibrationMode(false);
  }

  if (permissionDenied) return <PermissionsFallback />;

  // ── Light level color helper ──────────────────────────────────────────────

  const lightColors: Record<LightLevel, string> = {
    good: "text-green-400",
    dim: "text-yellow-400",
    dark: "text-red-400",
  };
  const lightIcons: Record<LightLevel, string> = { good: "☀", dim: "🌤", dark: "🌙" };

  const trackingStateColors: Record<TrackingState, string> = {
    tracking: "text-green-400",
    recovering: "text-yellow-400",
    lost: "text-red-400",
  };

  return (
    <div className="space-y-4">

      {/* ── Tab Bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 p-1 bg-white/4 rounded-2xl border border-white/5">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium
              transition-all duration-200
              ${activeTab === tab.id
                ? "bg-violet-600/80 text-white shadow-lg shadow-violet-900/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"}
            `}
          >
            <span className="text-sm">{tab.icon}</span>
            <span className="hidden sm:block">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Status Bar ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-black/30 rounded-xl border border-white/5 text-[10px] font-mono gap-2">
        <div className="flex items-center gap-4">
          <StatusChip label="CAM" value={cameraStatus}
            color={cameraStatus === "ONLINE" ? "text-green-400" : cameraStatus === "PAUSED" ? "text-yellow-400" : "text-red-400"} />
          <StatusChip label="FPS" value={String(fps)}
            color={fps > 45 ? "text-green-400" : fps > 20 ? "text-yellow-400" : "text-red-400"} />
          <StatusChip label="LATENCY" value={`${latencyMs}ms`}
            color={latencyMs < 50 ? "text-green-400" : latencyMs < 100 ? "text-yellow-400" : "text-red-400"} />
          <StatusChip label="CONF" value={`${confidence}%`}
            color={confidence > 70 ? "text-green-400" : confidence > 40 ? "text-yellow-400" : "text-red-400"} />
        </div>
        <div className="flex items-center gap-4">
          {cameraStatus === "ONLINE" && (
            <StatusChip label="LIGHT" value={`${lightIcons[lightLevel]} ${lightLevel.toUpperCase()}`}
              color={lightColors[lightLevel]} />
          )}
          <StatusChip label="TRACKING" value={trackingState.toUpperCase()}
            color={trackingStateColors[trackingState]} />
          {handsDetected > 0 && (
            <StatusChip label="HANDS" value={String(handsDetected)} color="text-cyan-400" />
          )}
          {autoRestartCount > 0 && (
            <StatusChip label="AUTO RESTART" value={`×${autoRestartCount}`} color="text-amber-400" />
          )}
        </div>
      </div>

      {/* ── Low-light Warning ───────────────────────────────────────────── */}
      {lightLevel === "dark" && cameraStatus === "ONLINE" && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
          <span className="text-lg">🌙</span>
          <div>
            <span className="font-semibold">Low-light detected</span>
            <span className="text-amber-400/60 ml-2">— Move to a brighter environment for better tracking accuracy.</span>
          </div>
        </div>
      )}

      {/* ── Tracking Recovery Warning ────────────────────────────────────── */}
      {trackingState === "recovering" && (
        <div className="flex items-center gap-3 px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-xs text-yellow-300">
          <span className="text-lg animate-pulse">⚠</span>
          <span>
            <span className="font-semibold">Hand lost — recovering…</span>
            <span className="text-yellow-400/60 ml-2">Show your hand to the camera.</span>
          </span>
        </div>
      )}

      {/* ── Video Feed (shared across tabs, always rendered) ─────────────── */}
      <div className={`relative w-full overflow-hidden rounded-xl border border-aether-border bg-black/90 ${activeTab !== "tracking" ? "hidden" : ""}`}
        style={{ aspectRatio: "16/9" }}>

        <video ref={videoRef} className="w-full h-full object-cover"
          style={{ transform: mirrorView ? "scaleX(-1)" : "none" }}
          playsInline muted />

        {/* Canvas overlay */}
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
            cursorPosition={cursorPosRef.current}
            showCursor={showCursor}
          />
        </div>

        {/* Grid overlay */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }} />
        )}

        {/* Interaction border flash */}
        {interactionState.isInteracting && (
          <div className="absolute inset-0 pointer-events-none border-2 rounded-xl transition-all duration-150"
            style={{ borderColor: interactionState.isPinching ? "rgba(255,100,50,0.35)" : "rgba(255,150,0,0.25)" }} />
        )}

        {/* LIVE badge */}
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
          {handedness && (
            <span className="px-2 py-1 rounded-md text-[10px] font-mono bg-black/60 text-violet-400 backdrop-blur-sm">
              {handedness}
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

        {/* Gesture event log */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end pointer-events-none">
          {gestureLog.map((entry) => (
            <div key={entry.id} className="px-2 py-1 rounded bg-black/80 border border-aether-border/30 text-[10px] font-mono text-cyan-400 backdrop-blur-md animate-in fade-in slide-in-from-right-2">
              <span className="text-aether-accent-light mr-2 opacity-50">
                {new Date(entry.id).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
              {entry.text}
            </div>
          ))}
        </div>

        {/* Offline placeholder */}
        {cameraStatus === "OFFLINE" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-3">
            <span className="text-4xl opacity-30">👁</span>
            <span className="text-xs font-mono uppercase tracking-widest opacity-40">Camera offline — press Start</span>
          </div>
        )}
      </div>



      {/* ── Air Draw Tab ─────────────────────────────────────────────────── */}
      {activeTab === "air-draw" && (
        <AirDrawingCanvas
          landmarks={rawLandmarks}
          gesture={gesture}
          width={1280}
          height={720}
          isActive={true}
        />
      )}

      {/* ── Interaction Lab Tab ──────────────────────────────────────────── */}
      {activeTab === "interaction-lab" && (
        <InteractionLab
          interactionState={interactionState}
          gesture={gesture}
          isActive={true}
        />
      )}

      {/* ── Camera Controls ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between p-3 bg-white/4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-1.5">
          <button
            className={`px-4 py-2 rounded-xl text-white text-xs font-medium transition-all ${
              cameraStatus === "OFFLINE"
                ? "bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-900/30"
                : "bg-red-600/80 hover:bg-red-500/80"
            }`}
            onClick={cameraStatus === "OFFLINE" ? startTracking : stopCamera}
          >
            {cameraStatus === "OFFLINE" ? "▶ Start Tracking" : "■ Stop"}
          </button>
          {cameraStatus !== "OFFLINE" && (
            <button className="btn-secondary" onClick={pauseCamera}>
              {cameraStatus === "PAUSED" ? "▶ Resume" : "⏸ Pause"}
            </button>
          )}
          <button className="btn-secondary" onClick={restartCamera}>🔄 Restart</button>
          <button className="btn-secondary text-red-400 hover:text-red-300" onClick={handleResetTracking}>⊘ Reset</button>
        </div>

        <div className="flex items-center gap-2">
          <button
            className={`btn-secondary text-[10px] ${mirrorView ? "border-cyan-500/40 text-cyan-400" : ""}`}
            onClick={() => setMirrorView(!mirrorView)}
          >
            {mirrorView ? "🪞 Mirror: ON" : "🪞 Mirror: OFF"}
          </button>
          <button
            className={`btn-secondary text-[10px] ${showCursor ? "border-violet-500/40 text-violet-400" : ""}`}
            onClick={() => setShowCursor(!showCursor)}
          >
            🎯 Cursor
          </button>
          <button className="btn-secondary text-[10px]" onClick={() => setCalibrationMode(v => !v)}>
            📐 Calibrate
          </button>
          <div className="h-4 w-px bg-slate-700 mx-1" />
          <button className={`p-2 rounded hover:bg-slate-800 ${showGrid ? "text-cyan-400" : "text-slate-400"}`}
            onClick={() => setShowGrid(!showGrid)} title="Toggle Grid">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Calibration ──────────────────────────────────────────────────── */}
      {calibrationMode && (
        <CalibrationModal onApply={handleApplyCalibration} onClose={() => setCalibrationMode(false)} />
      )}

      {/* ── Diagnostics + Settings Grid ──────────────────────────────────── */}
      {activeTab === "tracking" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DiagnosticsPanel
            fps={fps} latencyMs={latencyMs} confidence={confidence} gesture={gesture}
            handedness={handedness} handsDetected={handsDetected} interactionState={interactionState}
            cameraStatus={cameraStatus}
          />

          {/* Settings */}
          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg border border-slate-700 space-y-4 text-sm font-mono">
            <h3 className="text-xs uppercase tracking-wider text-slate-400">Tracking Settings</h3>
            {[
              { label: "Dead Zone",  value: deadZone,     min: 0,    max: 0.05, step: 0.001, set: setDeadZone },
              { label: "Smoothing",  value: smoothFactor, min: 0,    max: 0.8,  step: 0.01,  set: setSmoothFactor },
              { label: "Kalman Noise", value: kalmanNoise, min: 0.01, max: 0.2,  step: 0.01,  set: setKalmanNoise },
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

            <div className="border-t border-slate-700 pt-3 space-y-2">
              <h4 className="text-xs uppercase tracking-wider text-slate-400">Visuals</h4>
              {[
                { label: "Skeleton Labels", val: showLabels,    set: setShowLabels },
                { label: "Particles",       val: showParticles, set: setShowParticles },
                { label: "Motion Trails",   val: showTrails,    set: setShowTrails },
                { label: "Cursor Orb",      val: showCursor,    set: setShowCursor },
              ].map(({ label, val, set }) => (
                <label key={label} className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-400 text-xs">{label}</span>
                  <button
                    onClick={() => set(v => !v)}
                    className={`relative w-8 h-4 rounded-full transition-colors ${val ? "bg-violet-600" : "bg-slate-700"}`}
                  >
                    <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${val ? "left-4.5 translate-x-0.5" : "left-0.5"}`} />
                  </button>
                </label>
              ))}
            </div>
          </div>

          {/* Interaction map */}
          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg border border-slate-700 space-y-3 text-sm font-mono">
            <h3 className="text-xs uppercase tracking-wider text-slate-400">Gesture Map</h3>
            <div className="space-y-1 text-[11px]">
              {[
                { gesture: "pinch",          action: "Click / Select",   icon: "🤏" },
                { gesture: "grab",           action: "Drag / Move",      icon: "✊" },
                { gesture: "point",          action: "Hover / Navigate",  icon: "👆" },
                { gesture: "open_palm",      action: "Command Menu",     icon: "🖐" },
                { gesture: "closed_fist",    action: "Hold",             icon: "✊" },
                { gesture: "thumbs_up",      action: "Confirm",          icon: "👍" },
                { gesture: "victory",        action: "Select",           icon: "✌" },
                { gesture: "finger_spread",  action: "Zoom In",          icon: "🖐" },
                { gesture: "swipe_left",     action: "Prev Section",     icon: "👈" },
                { gesture: "swipe_right",    action: "Next Section",     icon: "👉" },
                { gesture: "swipe_up",       action: "Scroll Up",        icon: "👆" },
                { gesture: "swipe_down",     action: "Scroll Down",      icon: "👇" },
                { gesture: "two_hand_scale", action: "Zoom Workspace",   icon: "🤲" },
                { gesture: "two_hand_rotate","action": "Rotate Objects", icon: "🤲" },
              ].map(({ gesture: g, action, icon }) => (
                <div key={g} className="flex justify-between">
                  <span className="text-slate-400">{icon} {g.replace(/_/g, " ")}</span>
                  <span className={gesture === g ? "text-orange-400 font-bold" : "text-slate-500"}>
                    {action}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Status Chip ───────────────────────────────────────────────────────────────

function StatusChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-slate-600 uppercase">{label}:</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
  );
}
