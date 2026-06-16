"use client";

import React, { useEffect, useRef, useState } from "react";
import { detectPinch, detectOpenPalm, detectGrab, Hand, Landmark } from "@/lib/hand-tracking";
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
  const [gesture, setGesture] = useState<string>("none");
  const [handedness, setHandedness] = useState<string | null>(null);

  const modelRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);

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
        }

        if (results.handedness && results.handedness.length) {
          setConfidence(Math.round((results.handedness[0].score || 0) * 100));
        }

        // gestures
        if (results.handedness && results.handedness.length && results.landmarks) {
          const hands: Hand[] = results.landmarks.map((lm: any, idx: number) => ({
            landmarks: lm.map((p: any) => ({ x: p.x, y: p.y, z: p.z })),
            handedness: results.handedness[idx]?.label,
          }));

          let g = "none";
          for (const h of hands) {
            const pinch = detectPinch(h);
            if (pinch.type === "pinch") {
              g = "pinch";
              break;
            }
            const grab = detectGrab(h);
            if (grab.type === "grab") {
              g = "grab";
              break;
            }
            const openPalm = detectOpenPalm(h);
            if (openPalm.type === "open_palm") {
              g = "open_palm";
              break;
            }
          }
          setGesture(g);
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
  }, [running]);

  async function loadModel() {
    // dynamically import to avoid server-side issues
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mp: any = await import("@mediapipe/tasks-vision");
    // any types for runtime
    const { FilesetResolver, HandLandmarker } = mp;
    const filesetResolver = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );

    const handLandmarker = await HandLandmarker.createFromOptions(filesetResolver, {
      baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker.task" },
      numHands: 2,
    });

    return handLandmarker;
  }

  function drawResults(results: any) {
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
      results.landmarks.forEach((handLandmarks: any, hIdx: number) => {
        ctx.strokeStyle = "rgba(0,200,150,0.9)";
        ctx.lineWidth = 0.002;
        for (let i = 0; i < handLandmarks.length; i++) {
          const p = handLandmarks[i];
          ctx.beginPath();
          ctx.arc(p.x, p.y, 0.006, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0,200,150,0.9)";
          ctx.fill();
        }
      });
    }

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
        />
      </div>
    </div>
  );
}
