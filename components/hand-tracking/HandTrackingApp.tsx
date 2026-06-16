"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  detectPinch,
  detectOpenPalm,
  detectGrab,
  detectClosedFist,
  detectPoint,
  detectThumbsUp,
  detectVictory,
  detectSwipe,
  Hand,
  Gesture,
  GestureType,
  GestureHistory,
  GestureDebouncer,
  SpatialCursor,
} from "@/lib/hand-tracking";
import DiagnosticsPanel from "./DiagnosticsPanel";
import CalibrationModal from "./CalibrationModal";
import PermissionsFallback from "./PermissionsFallback";

export default function HandTrackingApp() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [running, setRunning] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [fps, setFps] = useState(0);
  const [latencyMs, setLatencyMs] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [gesture, setGesture] = useState<GestureType>("none");
  const [handedness, setHandedness] = useState<string | null>(null);
  const [handsDetected, setHandsDetected] = useState(0);

  const modelRef = useRef<HandLandmarkerInstance | null>(null);
  const rafRef = useRef<number | null>(null);
  const historyRef = useRef(new GestureHistory());
  const debouncerRef = useRef(new GestureDebouncer());
  const cursorRef = useRef(new SpatialCursor());
  const prevHandsRef = useRef<Hand[] | null>(null);

  function detectAllGestures(hands: Hand[]): GestureType {
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
        gestures.push(detectSwipe(hand, prevHandsRef.current[0]).gesture);
      }
    }

    const best = gestures.reduce((max, g) => (g.score > max.score ? g : max), { type: "none" as GestureType, score: 0 });
    historyRef.current.add(best);
    const smoothed = historyRef.current.getSmoothed();
    const debounced = debouncerRef.current.debounce(smoothed);
    return debounced.type !== "none" ? debounced.type : smoothed.type;
  }

  useEffect(() => {
    let mounted = true;
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (!mounted) return;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (e) {
        setPermissionDenied(true);
        console.error("Camera permission denied", e);
      }
    }

    startCamera();

    return () => {
      mounted = false;
      stop();
    };
  }, []);

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
        const results = await modelRef.current.detectForVideo(videoRef.current, mediaTs);
        const t1 = performance.now();
        setLatencyMs(Math.round(t1 - t0));

        drawResults(results);

        // diagnostics
        if (results.handedness && results.handedness.length) {
          setHandedness(results.handedness[0].label || null);
          setHandsDetected(results.handedness.length);
        }

        if (results.handedness && results.handedness.length) {
          setConfidence(Math.round((results.handedness[0].score || 0) * 100));
        }

        // gestures
        if (results.handedness && results.handedness.length && results.landmarks) {
          const hands: Hand[] = results.landmarks.map((lm, idx) => ({
            landmarks: lm.map((p) => ({ x: p.x, y: p.y, z: p.z })),
            handedness: results.handedness?.[idx]?.label,
          } as Hand));

          const detectedGesture = detectAllGestures(hands);
          setGesture(detectedGesture);

          // Update cursor from first hand
          if (hands.length > 0 && hands[0].landmarks[9]) {
            const palmPos = hands[0].landmarks[9];
            cursorRef.current.update(palmPos.x, palmPos.y);
          }

          prevHandsRef.current = hands;
        }
      } catch (err) {
        console.error(err);
      }

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);
  type MPResult = {
    landmarks?: Array<Array<{ x: number; y: number; z?: number }>>;
    handedness?: Array<{ label?: string; score?: number }>;
  };

  type HandLandmarkerInstance = {
    detectForVideo: (video: HTMLVideoElement, timestamp: number) => Promise<MPResult>;
    close?: () => void;
  };

  type MP = {
    FilesetResolver: {
      forVisionTasks: (path: string) => Promise<unknown>;
    };
    HandLandmarker: {
      createFromOptions: (filesetResolver: unknown, opts: { baseOptions: { modelAssetPath: string }; numHands?: number }) => Promise<HandLandmarkerInstance>;
    };
  };

  async function loadModel(): Promise<HandLandmarkerInstance> {
    const mp = (await import("@mediapipe/tasks-vision")) as unknown as MP;
    const filesetResolver = await mp.FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );

    const handLandmarker = await mp.HandLandmarker.createFromOptions(filesetResolver, {
      baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker.task" },
      numHands: 2,
    });

    return handLandmarker;
  }

  function drawResults(results: MPResult | undefined) {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(canvas.width, canvas.height);

    if (results && results.landmarks) {
      results.landmarks.forEach((handLandmarks) => {
        ctx.strokeStyle = "rgba(0,200,150,0.9)";
        ctx.lineWidth = 0.002;
        ctx.fillStyle = "rgba(0,200,150,0.9)";
        for (let i = 0; i < handLandmarks.length; i++) {
          const p = handLandmarks[i];
          ctx.beginPath();
          ctx.arc(p.x, p.y, 0.006, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw connections
        const connections = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[0,9],[9,10],[10,11],[11,12],[0,13],[13,14],[14,15],[15,16],[0,17],[17,18],[18,19],[19,20]];
        ctx.strokeStyle = "rgba(0,150,120,0.6)";
        for (const [start, end] of connections) {
          const p1 = handLandmarks[start];
          const p2 = handLandmarks[end];
          if (p1 && p2) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });
    }

    // Draw spatial cursor
    const cursorPos = cursorRef.current.getPosition();
    ctx.fillStyle = gesture === "pinch" ? "rgba(255,100,50,0.8)" : "rgba(0,200,150,0.6)";
    ctx.beginPath();
    ctx.arc(cursorPos.x, cursorPos.y, 0.015, 0, Math.PI * 2);
    ctx.fill();

    // Draw cursor crosshair
    ctx.strokeStyle = "rgba(0,200,150,0.4)";
    ctx.lineWidth = 0.001;
    ctx.beginPath();
    ctx.moveTo(cursorPos.x - 0.03, cursorPos.y);
    ctx.lineTo(cursorPos.x + 0.03, cursorPos.y);
    ctx.moveTo(cursorPos.x, cursorPos.y - 0.03);
    ctx.lineTo(cursorPos.x, cursorPos.y + 0.03);
    ctx.stroke();

    ctx.restore();
  }

  function stop() {
    setRunning(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    }
    if (modelRef.current && modelRef.current.close) modelRef.current.close();
  }

  if (permissionDenied) {
    return <PermissionsFallback />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="col-span-2">
        <div className="relative w-full bg-black" style={{ aspectRatio: "16/9" }}>
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
        </div>
        <div className="mt-2 flex gap-2">
          <button
            className="btn-primary"
            onClick={() => setRunning((v) => !v)}
          >
            {running ? "Stop" : "Start"}
          </button>
          <button className="btn-secondary" onClick={stop}>
            Shutdown
          </button>
          <CalibrationModal />
        </div>
      </div>

      <div>
        <DiagnosticsPanel
          fps={fps}
          latencyMs={latencyMs}
          confidence={confidence}
          gesture={gesture}
          handedness={handedness}
          handsDetected={handsDetected}
        />
      </div>
    </div>
  );
}
