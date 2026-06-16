"use client";

import React from "react";

type Props = {
  fps: number;
  latencyMs: number;
  confidence: number;
  gesture: string;
  handedness?: string | null;
};

export default function DiagnosticsPanel({ fps, latencyMs, confidence, gesture, handedness }: Props) {
  return (
    <div className="p-4 border rounded-md">
      <h3 className="mb-2 text-lg font-medium">Diagnostics</h3>
      <ul className="text-sm space-y-2">
        <li>
          <strong>FPS:</strong> {fps}
        </li>
        <li>
          <strong>Latency:</strong> {latencyMs} ms
        </li>
        <li>
          <strong>Confidence:</strong> {confidence}%
        </li>
        <li>
          <strong>Gesture:</strong> {gesture}
        </li>
        <li>
          <strong>Hand:</strong> {handedness ?? "—"}
        </li>
      </ul>
    </div>
  );
}
