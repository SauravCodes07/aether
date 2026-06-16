/**
 * Aether Hand Tracking — Core Library v2
 *
 * Coordinate System:
 * MediaPipe returns [0,1] normalized coords in the ORIGINAL (unmirrored) image frame.
 * The video element is CSS-mirrored (scaleX(-1)) for a natural mirror experience.
 * The canvas overlay is NOT CSS-mirrored — it draws at FLIPPED positions (1-x, y)
 * so landmarks align with the mirrored video.
 * All gesture/cursor calculations use the flipped coordinate system so that
 * x increases → right on screen, y increases → down on screen.
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type Landmark = { x: number; y: number; z?: number; score?: number };

export type Hand = {
  landmarks: Landmark[];
  handedness?: "Left" | "Right" | string;
  score?: number;
};

export type GestureType =
  | "pinch" | "grab" | "open_palm" | "closed_fist" | "point"
  | "thumbs_up" | "victory" | "finger_spread"
  | "swipe_left" | "swipe_right" | "swipe_up" | "swipe_down"
  | "none";

export type Gesture = { type: GestureType; score: number; confidence?: number };
export type CursorPosition = { x: number; y: number };
export type SwipeState = { startX: number; startY: number; timestamp: number; handedness: string } | null;

export type GestureInteraction =
  | "click" | "drag" | "drop" | "hover" | "zoom" | "swipe" | "menu" | "idle";

export const LANDMARK_NAMES = [
  "Wrist","Thumb CMC","Thumb MCP","Thumb IP","Thumb Tip",
  "Index MCP","Index PIP","Index DIP","Index Tip",
  "Middle MCP","Middle PIP","Middle DIP","Middle Tip",
  "Ring MCP","Ring PIP","Ring DIP","Ring Tip",
  "Pinky MCP","Pinky PIP","Pinky DIP","Pinky Tip",
];

export const HAND_CONNECTIONS: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
];

export const FINGER_TIPS = [4, 8, 12, 16, 20];
export const PALM_INDICES = [0, 5, 9, 17];

// ── Coordinate Transformation ───────────────────────────────────────────────

export function flipCoordinateX(x: number): number { return 1 - x; }

export function transformLandmark(lm: Landmark, flipX = true): Landmark {
  return { x: flipX ? flipCoordinateX(lm.x) : lm.x, y: lm.y, z: lm.z, score: lm.score };
}

export function transformHand(hand: Hand, flipX = true): Hand {
  return { ...hand, landmarks: hand.landmarks.map(lm => transformLandmark(lm, flipX)) };
}

// ── Kalman Filter ───────────────────────────────────────────────────────────
// 3D Kalman filter for smooth landmark tracking with velocity estimation.

export class KalmanFilter3D {
  private x: Float64Array;  // [px, py, pz, vx, vy, vz]
  private P: Float64Array;  // 6x6 covariance
  private Q: Float64Array;  // 6x6 process noise
  private R: Float64Array;  // 3x3 measurement noise
  private H: Float64Array;  // 3x6 observation matrix
  private initialized = false;

  constructor(
    processNoise: number = 0.03,
    measurementNoise: number = 0.08,
  ) {
    this.x = new Float64Array(6);
    this.P = this.eye(6);
    this.Q = this.eye(6);
    this.R = this.eye(3);
    this.H = new Float64Array(18);

    // Set process noise diagonal
    for (let i = 0; i < 6; i++) this.Q[i * 6 + i] = processNoise * processNoise;
    // Set measurement noise diagonal
    for (let i = 0; i < 3; i++) this.R[i * 3 + i] = measurementNoise * measurementNoise;
    // Set observation matrix (observe position only)
    for (let i = 0; i < 3; i++) this.H[i * 6 + i] = 1;
  }

  private eye(n: number): Float64Array {
    const m = new Float64Array(n * n);
    for (let i = 0; i < n; i++) m[i * n + i] = 1;
    return m;
  }

  private matMul(a: Float64Array, b: Float64Array, rows: number, cols: number, inner: number): Float64Array {
    const c = new Float64Array(rows * cols);
    for (let r = 0; r < rows; r++)
      for (let c2 = 0; c2 < cols; c2++) {
        let sum = 0;
        for (let k = 0; k < inner; k++) sum += a[r * inner + k] * b[k * cols + c2];
        c[r * cols + c2] = sum;
      }
    return c;
  }

  private matAdd(a: Float64Array, b: Float64Array, n: number): Float64Array {
    const c = new Float64Array(n * n);
    for (let i = 0; i < n * n; i++) c[i] = a[i] + b[i];
    return c;
  }

  private matSub(a: Float64Array, b: Float64Array, n: number): Float64Array {
    const c = new Float64Array(n * n);
    for (let i = 0; i < n * n; i++) c[i] = a[i] - b[i];
    return c;
  }

  private matTrans(a: Float64Array, rows: number, cols: number): Float64Array {
    const t = new Float64Array(rows * cols);
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        t[c * rows + r] = a[r * cols + c];
    return t;
  }

  private inv3x3(m: Float64Array): Float64Array {
    const [a,b,c,d,e,f,g,h,i] = [m[0],m[1],m[2],m[3],m[4],m[5],m[6],m[7],m[8]];
    const det = a*(e*i-f*h) - b*(d*i-f*g) + c*(d*h-e*g);
    if (Math.abs(det) < 1e-10) return this.eye(3);
    const inv = 1 / det;
    return new Float64Array([
      (e*i-f*h)*inv, (c*h-b*i)*inv, (b*f-c*e)*inv,
      (f*g-d*i)*inv, (a*i-c*g)*inv, (c*d-a*f)*inv,
      (d*h-e*g)*inv, (b*g-a*h)*inv, (a*e-b*d)*inv,
    ]);
  }

  update(measurement: [number, number, number]): [number, number, number] {
    if (!this.initialized) {
      this.x[0] = measurement[0]; this.x[1] = measurement[1]; this.x[2] = measurement[2];
      this.initialized = true;
      return measurement;
    }

    // Predict state transition: position += velocity
    const dt = 1;
    const F = this.eye(6);
    for (let i = 0; i < 3; i++) F[i * 6 + i + 3] = dt;
    this.x = this.matMul(F, this.x, 6, 1, 6) as unknown as Float64Array;
    // Inline matMul for vector
    const xNew = new Float64Array(6);
    for (let r = 0; r < 6; r++) {
      let sum = 0;
      for (let k = 0; k < 6; k++) sum += F[r * 6 + k] * this.x[k];
      xNew[r] = sum;
    }
    this.x = xNew;

    const Ft = this.matTrans(F, 6, 6);
    this.P = this.matAdd(this.matMul(this.matMul(F, this.P, 6, 6, 6), Ft, 6, 6, 6), this.Q, 6);

    // Update
    const z = new Float64Array(measurement);
    const Ht = this.matTrans(this.H, 3, 6);
    const PHt = this.matMul(this.P, Ht, 6, 6, 3);
    const S = this.matAdd(this.matMul(this.H, PHt, 3, 6, 3), this.R, 3);
    const K = this.matMul(PHt, this.inv3x3(S), 6, 3, 3);

    const y = new Float64Array(3);
    const Hx = this.matMul(this.H, this.x, 3, 6, 1);
    for (let i = 0; i < 3; i++) y[i] = z[i] - Hx[i];

    const Ky = new Float64Array(6);
    for (let r = 0; r < 6; r++) {
      let sum = 0;
      for (let k = 0; k < 3; k++) sum += K[r * 3 + k] * y[k];
      Ky[r] = sum;
    }
    for (let i = 0; i < 6; i++) this.x[i] += Ky[i];

    const I = this.eye(6);
    const KH = this.matMul(K, this.H, 6, 3, 6);
    const IminusKH = this.matSub(I, KH, 6);
    this.P = this.matMul(IminusKH, this.P, 6, 6, 6);

    return [this.x[0], this.x[1], this.x[2]];
  }

  reset(): void {
    this.x.fill(0);
    this.P = this.eye(6);
    this.initialized = false;
  }
}

// ── Multi-Landmark Kalman Smoother ──────────────────────────────────────────

export class HandSmoother {
  private filters: KalmanFilter3D[];
  private confidence: number = 1;

  constructor(numLandmarks: number = 21, processNoise = 0.03, measurementNoise = 0.08) {
    this.filters = Array.from({ length: numLandmarks }, () => new KalmanFilter3D(processNoise, measurementNoise));
  }

  smooth(landmarks: Landmark[], confidence?: number): Landmark[] {
    if (confidence !== undefined) this.confidence = confidence;
    // Adjust noise based on confidence: low confidence → trust measurement more
    return landmarks.map((lm, i) => {
      const [sx, sy, sz] = this.filters[i].update([lm.x, lm.y, lm.z ?? 0]);
      return { x: sx, y: sy, z: sz, score: lm.score };
    });
  }

  reset(): void {
    this.filters.forEach(f => f.reset());
    this.confidence = 1;
  }
}

// ── Edge-of-Frame Recovery ──────────────────────────────────────────────────

export function edgeOfFrameRecovery(
  landmarks: Landmark[],
  frameWidth: number,
  frameHeight: number,
  margin: number = 0.05,
): Landmark[] {
  return landmarks.map(lm => {
    let x = lm.x;
    let y = lm.y;
    // If near edge, dampen movement to prevent loss
    if (x < margin) x = margin + (x - margin) * 0.5;
    if (x > 1 - margin) x = (1 - margin) + (x - (1 - margin)) * 0.5;
    if (y < margin) y = margin + (y - margin) * 0.5;
    if (y > 1 - margin) y = (1 - margin) + (y - (1 - margin)) * 0.5;
    return { ...lm, x, y };
  });
}

// ── Automatic Recalibration ─────────────────────────────────────────────────

export class AutoCalibrator {
  private offsetX = 0;
  private offsetY = 0;
  private driftThreshold = 0.15;
  private samples: Array<{ x: number; y: number }> = [];
  private maxSamples = 30;
  private enabled = true;

  calibrate(landmarks: Landmark[]): { offsetX: number; offsetY: number } {
    if (!this.enabled) return { offsetX: this.offsetX, offsetY: this.offsetY };

    const palm = landmarks[9];
    if (!palm) return { offsetX: this.offsetX, offsetY: this.offsetY };

    this.samples.push({ x: palm.x, y: palm.y });
    if (this.samples.length > this.maxSamples) this.samples.shift();

    if (this.samples.length >= this.maxSamples) {
      const avgX = this.samples.reduce((s, p) => s + p.x, 0) / this.samples.length;
      const avgY = this.samples.reduce((s, p) => s + p.y, 0) / this.samples.length;
      const driftX = Math.abs(avgX - 0.5);
      const driftY = Math.abs(avgY - 0.5);

      if (driftX > this.driftThreshold || driftY > this.driftThreshold) {
        this.offsetX += (0.5 - avgX) * 0.3;
        this.offsetY += (0.5 - avgY) * 0.3;
        this.samples = [];
      }
    }

    return { offsetX: this.offsetX, offsetY: this.offsetY };
  }

  reset(): void {
    this.offsetX = 0;
    this.offsetY = 0;
    this.samples = [];
  }

  getOffset(): { offsetX: number; offsetY: number } {
    return { offsetX: this.offsetX, offsetY: this.offsetY };
  }
}

// ── Smoothing / Filtering ───────────────────────────────────────────────────

export function exponentialSmooth(current: number, target: number, factor = 0.3): number {
  return current + (target - current) * (1 - factor);
}

export function applyDeadZone(value: number, deadZoneRadius = 0.01): number {
  return Math.abs(value) < deadZoneRadius ? 0 : value;
}

// ── Gesture Stability Filter ────────────────────────────────────────────────

export class GestureStabilityFilter {
  private lastGesture: GestureType = "none";
  private frameCount = 0;
  private requiredFrames: number;

  constructor(requiredFrames = 2) { this.requiredFrames = requiredFrames; }

  update(gesture: GestureType): GestureType {
    if (gesture === this.lastGesture) {
      this.frameCount++;
      if (this.frameCount >= this.requiredFrames) return gesture;
    } else {
      this.lastGesture = gesture;
      this.frameCount = 1;
    }
    return "none";
  }

  reset(): void { this.lastGesture = "none"; this.frameCount = 0; }
}

// ── Distance helpers ────────────────────────────────────────────────────────

export function distance(a: Landmark, b: Landmark): number {
  const dx = a.x - b.x, dy = a.y - b.y, dz = (a.z ?? 0) - (b.z ?? 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function distance2D(a: Landmark, b: Landmark): number {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// ── Gesture Detection ───────────────────────────────────────────────────────

export function detectPinch(hand: Hand): Gesture {
  const thumb = hand.landmarks[4], index = hand.landmarks[8];
  if (!thumb || !index) return { type: "none", score: 0 };
  const d = distance(thumb, index);
  const score = Math.max(0, 1 - d * 10);
  return { type: score > 0.4 ? "pinch" : "none", score, confidence: score };
}

export function detectOpenPalm(hand: Hand): Gesture {
  const wrist = hand.landmarks[0];
  if (!wrist) return { type: "none", score: 0 };
  const tips = [4, 8, 12, 16, 20];
  const dists = tips.map(i => distance(wrist, hand.landmarks[i] || wrist));
  const avg = dists.reduce((s, v) => s + v, 0) / dists.length;
  const score = Math.max(0, Math.min(1, (avg - 0.06) * 10));
  return { type: score > 0.5 ? "open_palm" : "none", score, confidence: score };
}

export function detectGrab(hand: Hand): Gesture {
  const palm = hand.landmarks[0];
  if (!palm) return { type: "none", score: 0 };
  const tips = [8, 12, 16, 20];
  const dists = tips.map(i => distance(palm, hand.landmarks[i] || palm));
  const avg = dists.reduce((s, v) => s + v, 0) / dists.length;
  const score = Math.max(0, 1 - avg * 10);
  return { type: score > 0.5 ? "grab" : "none", score, confidence: score };
}

export function detectClosedFist(hand: Hand): Gesture {
  const palm = hand.landmarks[0];
  if (!palm) return { type: "none", score: 0 };
  const tips = [4, 8, 12, 16, 20];
  const dists = tips.map(i => distance(palm, hand.landmarks[i] || palm));
  const avg = dists.reduce((s, v) => s + v, 0) / dists.length;
  const score = Math.max(0, 1 - avg * 8);
  return { type: score > 0.6 ? "closed_fist" : "none", score, confidence: score };
}

export function detectPoint(hand: Hand): Gesture {
  const index = hand.landmarks[8], middle = hand.landmarks[12];
  const ring = hand.landmarks[16], pinky = hand.landmarks[20], palm = hand.landmarks[0];
  if (!index || !middle || !ring || !pinky || !palm) return { type: "none", score: 0 };
  const idx = distance(palm, index);
  const others = [middle, ring, pinky].map(p => distance(palm, p));
  const avg = others.reduce((s, v) => s + v, 0) / others.length;
  const score = Math.max(0, idx - avg);
  return { type: score > 0.02 ? "point" : "none", score: Math.min(1, score * 20), confidence: Math.min(1, score * 20) };
}

export function detectThumbsUp(hand: Hand): Gesture {
  const thumb = hand.landmarks[4], palm = hand.landmarks[0];
  if (!thumb || !palm) return { type: "none", score: 0 };
  const dy = palm.y - thumb.y;
  const score = Math.max(0, dy * 2);
  return { type: score > 0.05 ? "thumbs_up" : "none", score: Math.min(1, score), confidence: Math.min(1, score) };
}

export function detectVictory(hand: Hand): Gesture {
  const index = hand.landmarks[8], middle = hand.landmarks[12];
  const ring = hand.landmarks[16], pinky = hand.landmarks[20], palm = hand.landmarks[0];
  if (!index || !middle || !ring || !pinky || !palm) return { type: "none", score: 0 };
  const id = distance(palm, index), md = distance(palm, middle);
  const others = [ring, pinky].map(p => distance(palm, p));
  const avg = others.reduce((s, v) => s + v, 0) / others.length;
  const score = Math.max(0, ((id + md) / 2) - avg);
  return { type: score > 0.02 ? "victory" : "none", score: Math.min(1, score * 20), confidence: Math.min(1, score * 20) };
}

export function detectFingerSpread(hand: Hand): Gesture {
  const tips = [8, 12, 16, 20]; // Index, Middle, Ring, Pinky tips
  const lms = tips.map(i => hand.landmarks[i]);
  if (lms.some(l => !l)) return { type: "none", score: 0 };
  // Measure spread: average distance between adjacent fingertips
  const d12 = distance2D(lms[0]!, lms[1]!);
  const d23 = distance2D(lms[1]!, lms[2]!);
  const d34 = distance2D(lms[2]!, lms[3]!);
  const avgSpread = (d12 + d23 + d34) / 3;
  // Fingers are spread when average inter-finger distance > 0.06
  const score = Math.max(0, Math.min(1, (avgSpread - 0.04) * 15));
  // Also check that fingers are extended (not a fist)
  const palm = hand.landmarks[0];
  if (!palm) return { type: "none", score: 0 };
  const avgExt = tips.reduce((s, i) => s + distance(palm, hand.landmarks[i] || palm), 0) / 4;
  const extensionBonus = avgExt > 0.12 ? 1 : avgExt / 0.12;
  const finalScore = score * extensionBonus;
  return { type: finalScore > 0.5 ? "finger_spread" : "none", score: finalScore, confidence: finalScore };
}

// ── Swipe Detection ─────────────────────────────────────────────────────────

export function detectSwipe(
  hand: Hand, prevHand: Hand | null, swipeThreshold = 0.12,
): { gesture: Gesture; swipeState?: SwipeState } {
  const palm = hand.landmarks[0];
  if (!palm) return { gesture: { type: "none", score: 0 } };
  if (!prevHand) {
    return {
      gesture: { type: "none", score: 0 },
      swipeState: { startX: palm.x, startY: palm.y, timestamp: Date.now(), handedness: hand.handedness ?? "" },
    };
  }
  const prev = prevHand.landmarks[0];
  if (!prev) return { gesture: { type: "none", score: 0 } };
  const dx = palm.x - prev.x, dy = palm.y - prev.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > swipeThreshold) {
    const horizontal = Math.abs(dx) > Math.abs(dy);
    const type: GestureType = horizontal
      ? (dx > 0 ? "swipe_right" : "swipe_left")
      : (dy > 0 ? "swipe_down" : "swipe_up");
    return { gesture: { type, score: dist, confidence: Math.min(1, dist * 3) } };
  }
  return { gesture: { type: "none", score: 0 } };
}

// ── Gesture-to-Interaction Mapping ──────────────────────────────────────────

export function gestureToInteraction(gesture: GestureType): GestureInteraction {
  switch (gesture) {
    case "pinch": return "click";
    case "grab": return "drag";
    case "point": return "hover";
    case "open_palm": return "menu";
    case "victory": return "click";
    case "thumbs_up": return "click";
    case "finger_spread": return "zoom";
    default: return "idle";
  }
}

// ── Gesture State Machine ───────────────────────────────────────────────────
// Manages gesture lifecycle with cooldowns, transitions, and visual feedback.

export class GestureStateMachine {
  private current: GestureType = "none";
  private previous: GestureType = "none";
  private cooldowns: Map<GestureType, number> = new Map();
  private cooldownMs = 500; // 500ms cooldown between same gesture re-triggers
  private stateStartTime = 0;
  private minDuration = 100; // Minimum gesture duration to register (ms)
  private maxDuration = 5000; // Force release after this duration
  private transitionFrame = 0;

  update(gesture: GestureType, timestamp: number = Date.now()): {
    gesture: GestureType;
    isNew: boolean;
    justEnded: boolean;
    stateDuration: number;
    transitionProgress: number;
  } {
    this.transitionFrame++;

    // Check if gesture is in cooldown
    const inCooldown = this.cooldowns.has(gesture) &&
      timestamp - (this.cooldowns.get(gesture) ?? 0) < this.cooldownMs;

    if (inCooldown && gesture !== "none") {
      return {
        gesture: "none",
        isNew: false,
        justEnded: false,
        stateDuration: timestamp - this.stateStartTime,
        transitionProgress: 0,
      };
    }

    let isNew = false;
    let justEnded = false;

    if (gesture !== this.current) {
      if (this.current !== "none") {
        justEnded = true;
        this.cooldowns.set(this.current, timestamp);
      }
      if (gesture !== "none") {
        isNew = true;
        this.stateStartTime = timestamp;
      }
      this.previous = this.current;
      this.current = gesture;
      this.transitionFrame = 0;
    }

    const stateDuration = timestamp - this.stateStartTime;
    const transitionProgress = Math.min(1, this.transitionFrame / 10); // 10 frames to transition

    // Force release if held too long
    if (stateDuration > this.maxDuration && this.current !== "none") {
      this.cooldowns.set(this.current, timestamp);
      this.previous = this.current;
      this.current = "none";
      return { gesture: "none", isNew: false, justEnded: true, stateDuration: 0, transitionProgress: 0 };
    }

    return { gesture: this.current, isNew, justEnded, stateDuration, transitionProgress };
  }

  getCurrent(): GestureType { return this.current; }
  getPrevious(): GestureType { return this.previous; }

  forceRelease(): void {
    if (this.current !== "none") {
      this.cooldowns.set(this.current, Date.now());
    }
    this.previous = this.current;
    this.current = "none";
    this.transitionFrame = 0;
  }

  reset(): void {
    this.current = "none";
    this.previous = "none";
    this.cooldowns.clear();
    this.stateStartTime = 0;
    this.transitionFrame = 0;
  }
}

// ── Gesture History & Smoothing ─────────────────────────────────────────────

export class GestureHistory {
  private history: Array<{ type: GestureType; score: number; timestamp: number }> = [];
  private maxSize: number;
  constructor(maxSize = 10) { this.maxSize = maxSize; }

  add(gesture: Gesture): void {
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
    const type = Object.entries(weighted).reduce(
      (best, [k, v]) => (v > best[1] ? [k, v] : best), ["none", 0],
    )[0] as GestureType;
    const score = weighted[type] ?? 0;
    return { type, score, confidence: score };
  }

  clear(): void { this.history = []; }
}

// ── Gesture Debouncer ───────────────────────────────────────────────────────

export class GestureDebouncer {
  private lastGesture: GestureType = "none";
  private lastTime = 0;
  private debounceMs: number;
  constructor(debounceMs = 300) { this.debounceMs = debounceMs; }

  debounce(gesture: Gesture): Gesture {
    const now = Date.now();
    if (gesture.type !== "none" && (gesture.type !== this.lastGesture || now - this.lastTime > this.debounceMs)) {
      this.lastGesture = gesture.type;
      this.lastTime = now;
      return gesture;
    }
    return { type: "none", score: 0 };
  }

  reset(): void { this.lastGesture = "none"; this.lastTime = 0; }
}

// ── Spatial Cursor ──────────────────────────────────────────────────────────

export class SpatialCursor {
  private position: CursorPosition = { x: 0.5, y: 0.5 };
  private velocity: CursorPosition = { x: 0, y: 0 };
  private smoothness: number;
  private friction: number;
  private maxSpeed: number;

  constructor(smoothness = 0.25, friction = 0.85, maxSpeed = 0.08) {
    this.smoothness = smoothness;
    this.friction = friction;
    this.maxSpeed = maxSpeed;
  }

  update(targetX: number, targetY: number): CursorPosition {
    const dx = targetX - this.position.x;
    const dy = targetY - this.position.y;
    const vx = exponentialSmooth(this.velocity.x, dx * (1 - this.smoothness), 0.1);
    const vy = exponentialSmooth(this.velocity.y, dy * (1 - this.smoothness), 0.1);
    this.velocity.x = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, vx));
    this.velocity.y = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, vy));
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;
    return { ...this.position };
  }

  getPosition(): CursorPosition { return { ...this.position }; }
  getVelocity(): CursorPosition { return { ...this.velocity }; }

  setPosition(x: number, y: number): void {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
  }

  reset(): void { this.position = { x: 0.5, y: 0.5 }; this.velocity = { x: 0, y: 0 }; }
}

// ── Interaction State ───────────────────────────────────────────────────────

export type InteractionState = {
  gesture: GestureType;
  interaction: GestureInteraction;
  cursorX: number;
  cursorY: number;
  isPinching: boolean;
  isGrabbing: boolean;
  isInteracting: boolean;
};

export function createDefaultInteractionState(): InteractionState {
  return { gesture: "none", interaction: "idle", cursorX: 0.5, cursorY: 0.5, isPinching: false, isGrabbing: false, isInteracting: false };
}

// ── Two-Hand Gestures ──────────────────────────────────────────────────────

export type TwoHandGesture = { type: "two_hand_scale" | "two_hand_rotate" | "none"; magnitude: number };

export function detectTwoHandGesture(hands: Hand[]): TwoHandGesture {
  if (hands.length < 2) return { type: "none", magnitude: 0 };
  const p0 = hands[0].landmarks[0], p1 = hands[1].landmarks[0];
  if (!p0 || !p1) return { type: "none", magnitude: 0 };
  const dist = distance2D(p0, p1);
  const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
  return Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))
    ? { type: "two_hand_scale", magnitude: dist }
    : { type: "two_hand_rotate", magnitude: angle };
}

// ── Motion Trail Buffer ─────────────────────────────────────────────────────

export class MotionTrail {
  private trails: Array<{ x: number; y: number; age: number }> = [];
  private maxPoints: number;
  private maxAge: number;

  constructor(maxPoints = 40, maxAge = 0.5) {
    this.maxPoints = maxPoints;
    this.maxAge = maxAge;
  }

  add(x: number, y: number): void {
    this.trails.push({ x, y, age: 0 });
    if (this.trails.length > this.maxPoints) this.trails.shift();
  }

  update(dt: number): void {
    for (const t of this.trails) t.age += dt;
    this.trails = this.trails.filter(t => t.age < this.maxAge);
  }

  getTrail(): Array<{ x: number; y: number; alpha: number }> {
    return this.trails.map(t => ({ x: t.x, y: t.y, alpha: 1 - t.age / this.maxAge }));
  }

  clear(): void { this.trails = []; }
}