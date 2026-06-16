"use client";

import { useState } from "react";
import HandTrackingApp from "@/components/hand-tracking/HandTrackingApp";

export default function HandTrackingPage() {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <main
      className={`min-h-screen bg-aether-bg p-6 ${
        fullscreen
          ? "fixed inset-0 z-50 overflow-auto"
          : ""
      }`}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="heading-lg text-aether-text">
            Hand Tracking Workspace
          </h1>
          <p className="body-sm mt-1">
            Spatial gesture control — powered by MediaPipe.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-secondary text-xs"
            onClick={() => setFullscreen((v) => !v)}
          >
            {fullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
          <a
            href="/dashboard"
            className="btn-secondary text-xs"
          >
            ← Dashboard
          </a>
        </div>
      </div>

      {/* Hand Tracking App */}
      <HandTrackingApp />

      {/* Footer info */}
      <div className="mt-8 border-t border-aether-border pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-aether-text-muted">
          <div>
            <span className="block text-aether-text font-medium mb-1">
              Gestures
            </span>
            Pinch, Grab, Open Palm, Closed Fist, Point, Thumbs Up,
            Victory
          </div>
          <div>
            <span className="block text-aether-text font-medium mb-1">
              Interactions
            </span>
            Click, Drag, Swipe, Scale, Rotate
          </div>
          <div>
            <span className="block text-aether-text font-medium mb-1">
              Hands
            </span>
            Left hand, Right hand, Two-hand gestures
          </div>
          <div>
            <span className="block text-aether-text font-medium mb-1">
              Privacy
            </span>
            All processing is local. Video never leaves your device.
          </div>
        </div>
      </div>
    </main>
  );
}