export type Landmark = { x: number; y: number; z?: number; score?: number };

export type Hand = {
  landmarks: Landmark[];
  handedness?: "Left" | "Right" | string;
  score?: number;
};

export type Gesture =
  | { type: "pinch" | "grab" | "open_palm" | "swipe" | "none"; score: number }
  | { type: string; score: number };

export function distance(a: Landmark, b: Landmark) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z ?? 0) - (b.z ?? 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function detectPinch(hand: Hand) {
  // thumb tip (4) and index tip (8)
  const thumb = hand.landmarks[4];
  const index = hand.landmarks[8];
  if (!thumb || !index) return { type: "none", score: 0 } as Gesture;
  const d = distance(thumb, index);
  // normalized threshold tuned empirically
  const score = Math.max(0, 1 - d * 10);
  return score > 0.4 ? { type: "pinch", score } : { type: "none", score };
}

export function detectOpenPalm(hand: Hand) {
  // measure average distance between finger tips and wrist (0)
  const wrist = hand.landmarks[0];
  if (!wrist) return { type: "none", score: 0 } as Gesture;
  const tipIdx = [4, 8, 12, 16, 20];
  const dists = tipIdx.map((i) => distance(wrist, hand.landmarks[i] || wrist));
  const avg = dists.reduce((s, v) => s + v, 0) / dists.length;
  const score = Math.max(0, Math.min(1, (avg - 0.06) * 10));
  return score > 0.5 ? { type: "open_palm", score } : { type: "none", score };
}

export function detectGrab(hand: Hand) {
  // grab if tips are close to palm center
  const palm = hand.landmarks[0];
  if (!palm) return { type: "none", score: 0 } as Gesture;
  const tipIdx = [8, 12, 16, 20];
  const dists = tipIdx.map((i) => distance(palm, hand.landmarks[i] || palm));
  const avg = dists.reduce((s, v) => s + v, 0) / dists.length;
  const score = Math.max(0, 1 - avg * 10);
  return score > 0.5 ? { type: "grab", score } : { type: "none", score };
}
