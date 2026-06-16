export type Landmark = { x: number; y: number; z?: number; score?: number };

export type Hand = { landmarks: Landmark[]; handedness?: "Left" | "Right" | string; score?: number };

export type GestureType = "pinch" | "grab" | "open_palm" | "closed_fist" | "point" | "thumbs_up" | "victory" | "swipe_left" | "swipe_right" | "swipe_up" | "swipe_down" | "none";

export type Gesture = { type: GestureType; score: number; confidence?: number };

export const LANDMARK_NAMES = ["Wrist", "Thumb CMC", "Thumb MCP", "Thumb IP", "Thumb Tip", "Index MCP", "Index PIP", "Index DIP", "Index Tip", "Middle MCP", "Middle PIP", "Middle DIP", "Middle Tip", "Ring MCP", "Ring PIP", "Ring DIP", "Ring Tip", "Pinky MCP", "Pinky PIP", "Pinky DIP", "Pinky Tip"];

export function distance(a: Landmark, b: Landmark) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z ?? 0) - (b.z ?? 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function distance2D(a: Landmark, b: Landmark) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function detectPinch(hand: Hand): Gesture {
  const thumb = hand.landmarks[4];
  const index = hand.landmarks[8];
  if (!thumb || !index) return { type: "none", score: 0 };
  const d = distance(thumb, index);
  const score = Math.max(0, 1 - d * 10);
  return { type: score > 0.4 ? "pinch" : "none", score, confidence: score };
}

export function detectOpenPalm(hand: Hand): Gesture {
  const wrist = hand.landmarks[0];
  if (!wrist) return { type: "none", score: 0 };
  const tipIdx = [4, 8, 12, 16, 20];
  const dists = tipIdx.map((i) => distance(wrist, hand.landmarks[i] || wrist));
  const avg = dists.reduce((s, v) => s + v, 0) / dists.length;
  const score = Math.max(0, Math.min(1, (avg - 0.06) * 10));
  return { type: score > 0.5 ? "open_palm" : "none", score, confidence: score };
}

export function detectGrab(hand: Hand): Gesture {
  const palm = hand.landmarks[0];
  if (!palm) return { type: "none", score: 0 };
  const tipIdx = [8, 12, 16, 20];
  const dists = tipIdx.map((i) => distance(palm, hand.landmarks[i] || palm));
  const avg = dists.reduce((s, v) => s + v, 0) / dists.length;
  const score = Math.max(0, 1 - avg * 10);
  return { type: score > 0.5 ? "grab" : "none", score, confidence: score };
}

export function detectClosedFist(hand: Hand): Gesture {
  const palm = hand.landmarks[0];
  if (!palm) return { type: "none", score: 0 };
  const tipIdx = [4, 8, 12, 16, 20];
  const dists = tipIdx.map((i) => distance(palm, hand.landmarks[i] || palm));
  const avg = dists.reduce((s, v) => s + v, 0) / dists.length;
  const score = Math.max(0, 1 - avg * 8);
  return { type: score > 0.6 ? "closed_fist" : "none", score, confidence: score };
}

export function detectPoint(hand: Hand): Gesture {
  const index = hand.landmarks[8];
  const middle = hand.landmarks[12];
  const ring = hand.landmarks[16];
  const pinky = hand.landmarks[20];
  const palm = hand.landmarks[0];
  if (!index || !middle || !ring || !pinky || !palm) return { type: "none", score: 0 };
  const indexDist = distance(palm, index);
  const otherDists = [middle, ring, pinky].map((p) => distance(palm, p));
  const otherAvg = otherDists.reduce((s, v) => s + v, 0) / otherDists.length;
  const score = Math.max(0, indexDist - otherAvg);
  return { type: score > 0.02 ? "point" : "none", score: Math.min(1, score * 20), confidence: Math.min(1, score * 20) };
}

export function detectThumbsUp(hand: Hand): Gesture {
  const thumb = hand.landmarks[4];
  const palm = hand.landmarks[0];
  if (!thumb || !palm) return { type: "none", score: 0 };
  const dy = palm.y - thumb.y;
  const score = Math.max(0, dy * 2);
  return { type: score > 0.05 ? "thumbs_up" : "none", score: Math.min(1, score), confidence: Math.min(1, score) };
}

export function detectVictory(hand: Hand): Gesture {
  const index = hand.landmarks[8];
  const middle = hand.landmarks[12];
  const ring = hand.landmarks[16];
  const pinky = hand.landmarks[20];
  const palm = hand.landmarks[0];
  if (!index || !middle || !ring || !pinky || !palm) return { type: "none", score: 0 };
  const indexDist = distance(palm, index);
  const middleDist = distance(palm, middle);
  const otherDists = [ring, pinky].map((p) => distance(palm, p));
  const otherAvg = otherDists.reduce((s, v) => s + v, 0) / otherDists.length;
  const avg = (indexDist + middleDist) / 2;
  const score = Math.max(0, avg - otherAvg);
  return { type: score > 0.02 ? "victory" : "none", score: Math.min(1, score * 20), confidence: Math.min(1, score * 20) };
}

export class GestureHistory {
  private history: Array<{ type: GestureType; score: number; timestamp: number }> = [];
  private maxSize = 10;

  add(gesture: Gesture) {
    this.history.push({ type: gesture.type, score: gesture.score, timestamp: Date.now() });
    if (this.history.length > this.maxSize) this.history.shift();
  }

  getSmoothed(): Gesture {
    if (this.history.length === 0) return { type: "none", score: 0 };
    const weights = this.history.map((_, i) => (i + 1) / this.history.length);
    const total = weights.reduce((s, w) => s + w, 0);
    const weighted = this.history.reduce((acc, item, i) => {
      const w = weights[i] / total;
      acc[item.type] = (acc[item.type] ?? 0) + item.score * w;
      return acc;
    }, {} as Record<string, number>);
    const type = Object.entries(weighted).reduce((best, [k, v]) => (v > best[1] ? [k, v] : best), ["none", 0])[0] as GestureType;
    const score = weighted[type] ?? 0;
    return { type, score, confidence: score };
  }

  clear() {
    this.history = [];
  }
}

export class GestureDebouncer {
  private lastGesture: GestureType = "none";
  private lastTime = 0;
  private debounceMs = 300;

  debounce(gesture: Gesture): Gesture {
    const now = Date.now();
    if (gesture.type !== "none" && (gesture.type !== this.lastGesture || now - this.lastTime > this.debounceMs)) {
      this.lastGesture = gesture.type;
      this.lastTime = now;
      return gesture;
    }
    return { type: "none", score: 0 };
  }
}

export type SwipeState = { startX: number; startY: number; timestamp: number; handedness: string } | null;

export function detectSwipe(hand: Hand, prevHand: Hand | null, swipeThreshold = 0.15): { gesture: Gesture; swipeState?: SwipeState } {
  const palm = hand.landmarks[0];
  if (!palm) return { gesture: { type: "none", score: 0 } };
  if (!prevHand) {
    return {
      gesture: { type: "none", score: 0 },
      swipeState: { startX: palm.x, startY: palm.y, timestamp: Date.now(), handedness: hand.handedness ?? "" },
    };
  }
  const prevPalm = prevHand.landmarks[0];
  if (!prevPalm) return { gesture: { type: "none", score: 0 } };
  const dx = palm.x - prevPalm.x;
  const dy = palm.y - prevPalm.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > swipeThreshold) {
    if (Math.abs(dx) > Math.abs(dy)) {
      const type = dx > 0 ? "swipe_right" : "swipe_left";
      return { gesture: { type: type as GestureType, score: dist, confidence: Math.min(1, dist * 3) } };
    } else {
      const type = dy > 0 ? "swipe_down" : "swipe_up";
      return { gesture: { type: type as GestureType, score: dist, confidence: Math.min(1, dist * 3) } };
    }
  }
  return { gesture: { type: "none", score: 0 } };
}

export type CursorPosition = { x: number; y: number };

export class SpatialCursor {
  private position: CursorPosition = { x: 0.5, y: 0.5 };
  private velocity: CursorPosition = { x: 0, y: 0 };
  private smoothness = 0.8;
  private friction = 0.95;

  update(targetX: number, targetY: number) {
    const dx = targetX - this.position.x;
    const dy = targetY - this.position.y;
    this.velocity.x = dx * (1 - this.smoothness) + this.velocity.x * this.smoothness;
    this.velocity.y = dy * (1 - this.smoothness) + this.velocity.y * this.smoothness;
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;
    return this.position;
  }

  getPosition(): CursorPosition {
    return { ...this.position };
  }

  setPosition(x: number, y: number) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
  }
}
