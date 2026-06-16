type Props = {
  fps: number;
  latencyMs: number;
  confidence: number;
  gesture: string;
  handedness?: string | null;
  handsDetected?: number;
};

export default function DiagnosticsPanel({ fps, latencyMs, confidence, gesture, handedness, handsDetected = 0 }: Props) {
  return (
    <div className="bg-slate-900 text-slate-100 p-4 rounded-lg border border-slate-700 space-y-3 text-sm font-mono">
      <div>
        <span className="text-slate-400">FPS:</span>
        <span className="ml-2 text-green-400">{fps.toFixed(0)}</span>
      </div>
      <div>
        <span className="text-slate-400">Latency:</span>
        <span className="ml-2 text-blue-400">{latencyMs.toFixed(0)}ms</span>
      </div>
      <div>
        <span className="text-slate-400">Confidence:</span>
        <span className="ml-2 text-yellow-400">{confidence.toFixed(0)}%</span>
      </div>
      <div>
        <span className="text-slate-400">Hands:</span>
        <span className="ml-2 text-cyan-400">{handsDetected}</span>
      </div>
      <div>
        <span className="text-slate-400">Handedness:</span>
        <span className="ml-2 text-purple-400">{handedness || "—"}</span>
      </div>
      <div className="pt-3 border-t border-slate-700">
        <span className="text-slate-400">Gesture:</span>
        <span className="ml-2 text-orange-400 font-bold">{gesture}</span>
      </div>
    </div>
  );
}
