/**
 * Aether Hand Tracking — Core Library
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
  | "pinch"
  | "grab"
  | "open_palm"
  | "closed_fist"
  | "point"
  | "thumbs_up"
  | "victory"
  | "swipe_left"
  | "swipe_right"
  | "swipe_up"
  | "swipe_down"
  | "none";

export type Gesture = {
  type: GestureType;
  score: number;
  confidence?: number;
};

export type CursorPosition = { x: number; y: number };
export type SwipeState = {
  startX: number;
  startY: number;
  timestamp: number;
  handedness: string;
} | null;

export const LANDMARK_NAMES = [
  "Wrist",
  "Thumb CMC",
  "Thumb MCP",
  "Thumb IP",
  "Thumb Tip",
  "Index MCP",
  "Index PIP",
  "Index DIP",
  "Index Tip",
  "Middle MCP",
  "Middle PIP",
  "Middle DIP",
  "Middle Tip",
  "Ring MCP",
  "Ring PIP",
  "Ring DIP",
  "Ring Tip",
  "Pinky MCP",
  "Pinky PIP",
  "Pinky DIP",
  "Pinky Tip",
];

// ── Coordinate Transformation ───────────────────────────────────────────────
//
// flipCoordinateX: Converts from MediaPipe original image x to display x.
//   original x=0 (left side of camera image) → display x=1 (right side on screen)
//   This matches the CSS-mirrored video: camera-left appears at screen-right.
//
// transformLandmark: Applies X-flip so landmarks drawn on the UNMIRRORED canvas
//   will appear in the correct position relative to the MIRRORED video.

export function flipCoordinateX(x: number): number {
  return 1 - x;
}

export function transformLandmark(
  landmark: Landmark,
  flipX: boolean = true,
): Landmark {
  return {
    x: flipX ? flipCoordinateX(landmark.x) : landmark.x,
    y: landmark.y,
    z: landmark.z,
    score: landmark.score,
  };
}

export function transformHand(hand: Hand, flipX: boolean = true): Hand {
  return {
    ...hand,
    landmarks: hand.landmarks.map((lm) => transformLandmark(lm, flipX)),
  };
}

// ── Smoothing / Filtering ───────────────────────────────────────────────────

/**
 * Exponential moving average for coordinate smoothing.
 * factor ∈ [0,1]: 0 = no smoothing (instant), 1 = infinite smoothing (frozen).
 */
export function exponentialSmooth(
  current: number,
  target: number,
  factor: number = 0.3,
): number {
  return current + (target - current) * (1 - factor);
}

/**
 * Dead-zone filter: suppresses small movements around a reference point
 * to eliminate cursor jitter when the hand is nominally stationary.
 * Operates on delta from center (0.5).
 */
export function applyDeadZone(
  value: number,
  deadZoneRadius: number = 0.01,
): number {
  if (Math.abs(value) < deadZoneRadius) return 0;
  return value;
}

/**
 * Gesture stability filter: requires N consecutive identical frames
 * before a gesture is reported, eliminating transient false positives.
 */
export class GestureStabilityFilter {
  private lastGesture: GestureType = "none";
  private frameCount = 0;
  private requiredFrames: number;

  constructor(requiredFrames: number = 2) {
    this.requiredFrames = requiredFrames;
  }

  update(gesture: GestureType): GestureType {
    if (gesture === this.lastGesture) {
      this.frameCount++;
      if (this.frameCount >= this.requiredFrames) {
        return gesture;
      }
    } else {
      this.lastGesture = gesture;
      this.frameCount = 1;
    }
    return "none";
  }

  reset(): void {
    this.lastGesture = "none";
    this.frameCount = 0;
  }
}

// ── Distance helpers ────────────────────────────────────────────────────────

export function distance(a: Landmark, b: Landmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z ?? 0) - (b.z ?? 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function distance2D(a: Landmark, b: Landmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// ── Gesture Detection ───────────────────────────────────────────────────────

export function detectPinch(hand: Hand): Gesture {
  const thumb = hand.landmarks[4];
  const index = hand.landmarks[8];
  if (!thumb || !index) return { type: "none", score: 0 };
  const d = distance(thumb, index);
  const score = Math.max(0, 1 - d * 10);
  return {
    type: score > 0.4 ? "pinch" : "none",
    score,
    confidence: score,
  };
}

export function detectOpenPalm(hand: Hand): Gesture {
  const wrist = hand.landmarks[0];
  if (!wrist) return { type: "none", score: 0 };
  const tipIdx = [4, 8, 12, 16, 20];
  const dists = tipIdx.map((i) => distance(wrist, hand.landmarks[i] || wrist));
  const avg = dists.reduce((s, v) => s + v, 0) / dists.length;
  const score = Math.max(0, Math.min(1, (avg - 0.06) * 10));
  return {
    type: score > 0.5 ? "open_palm" : "none",
    score,
    confidence: score,
  };
}

export function detectGrab(hand: Hand): Gesture {
  const palm = hand.landmarks[0];
  if (!palm) return { type: "none", score: 0 };
  const tipIdx = [8, 12, 16, 20];
  const dists = tipIdx.map((i) => distance(palm, hand.landmarks[i] || palm));
  const avg = dists.reduce((s, v) => s + v, 0) / dists.length;
  const score = Math.max(0, 1 - avg * 10);
  return {
    type: score > 0.5 ? "grab" : "none",
    score,
    confidence: score,
  };
}

export function detectClosedFist(hand: Hand): Gesture {
  const palm = hand.landmarks[0];
  if (!palm) return { type: "none", score: 0 };
  const tipIdx = [4, 8, 12, 16, 20];
  const dists = tipIdx.map((i) => distance(palm, hand.landmarks[i] || palm));
  const avg = dists.reduce((s, v) => s + v, 0) / dists.length;
  const score = Math.max(0, 1 - avg * 8);
  return {
    type: score > 0.6 ? "closed_fist" : "none",
    score,
    confidence: score,
  };
}

export function detectPoint(hand: Hand): Gesture {
  const index = hand.landmarks[8];
  const middle = hand.landmarks[12];
  const ring = hand.landmarks[16];
  const pinky = hand.landmarks[20];
  const palm = hand.landmarks[0];
  if (!index || !middle || !ring || !pinky || !palm)
    return { type: "none", score: 0 };
  const indexDist = distance(palm, index);
  const otherDists = [middle, ring, pinky].map((p) => distance(palm, p));
  const otherAvg = otherDists.reduce((s, v) => s + v, 0) / otherDists.length;
  const score = Math.max(0, indexDist - otherAvg);
  return {
    type: score > 0.02 ? "point" : "none",
    score: Math.min(1, score * 20),
    confidence: Math.min(1, score * 20),
  };
}

export function detectThumbsUp(hand: Hand): Gesture {
  const thumb = hand.landmarks[4];
  const palm = hand.landmarks[0];
  if (!thumb || !palm) return { type: "none", score: 0 };
  const dy = palm.y - thumb.y;
  const score = Math.max(0, dy * 2);
  return {
    type: score > 0.05 ? "thumbs_up" : "none",
    score: Math.min(1, score),
    confidence: Math.min(1, score),
  };
}

export function detectVictory(hand: Hand): Gesture {
  const index = hand.landmarks[8];
  const middle = hand.landmarks[12];
  const ring = hand.landmarks[16];
  const pinky = hand.landmarks[20];
  const palm = hand.landmarks[0];
  if (!index || !middle || !ring || !pinky || !palm)
    return { type: "none", score: 0 };
  const indexDist = distance(palm, index);
  const middleDist = distance(palm, middle);
  const otherDists = [ring, pinky].map((p) => distance(palm, p));
  const otherAvg =
    otherDists.reduce((s, v) => s + v, 0) / otherDists.length;
  const avg = (indexDist + middleDist) / 2;
  const score = Math.max(0, avg - otherAvg);
  return {
    type: score > 0.02 ? "victory" : "none",
    score: Math.min(1, score * 20),
    confidence: Math.min(1, score * 20),
  };
}

// ── Swipe Detection (uses FLIPPED coordinates) ──────────────────────────────
// After X-flip, dx > 0 → right on screen, dy > 0 → down on screen.

export function detectSwipe(
  hand: Hand,
  prevHand: Hand | null,
  swipeThreshold = 0.12,
): { gesture: Gesture; swipeState?: SwipeState } {
  const palm = hand.landmarks[0];
  if (!palm) return { gesture: { type: "none", score: 0 } };
  if (!prevHand) {
    return {
      gesture: { type: "none", score: 0 },
      swipeState: {
        startX: palm.x,
        startY: palm.y,
        timestamp: Date.now(),
        handedness: hand.handedness ?? "",
      },
    };
  }
  const prevPalm = prevHand.landmarks[0];
  if (!prevPalm) return { gesture: { type: "none", score: 0 } };

  // These are already in flipped coordinate space (from transformLandmark),
  // so dx > 0 = rightward on screen.
  const dx = palm.x - prevPalm.x;
  const dy = palm.y - prevPalm.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > swipeThreshold) {
    if (Math.abs(dx) > Math.abs(dy)) {
      const type: GestureType = dx > 0 ? "swipe_right" : "swipe_left";
      return {
        gesture: {
          type,
          score: dist,
          confidence: Math.min(1, dist * 3),
        },
      };
    } else {
      const type: GestureType = dy > 0 ? "swipe_down" : "swipe_up";
      return {
        gesture: {
          type,
          score: dist,
          confidence: Math.min(1, dist * 3),
        },
      };
    }
  }
  return { gesture: { type: "none", score: 0 } };
}

// ── Gesture History & Smoothing ─────────────────────────────────────────────

export class GestureHistory {
  private history: Array<{
    type: GestureType;
    score: number;
    timestamp: number;
  }> = [];
  private maxSize: number;

  constructor(maxSize: number = 10) {
    this.maxSize = maxSize;
  }

  add(gesture: Gesture): void {
    this.history.push({
      type: gesture.type,
      score: gesture.score,
      timestamp: Date.now(),
    });
    if (this.history.length > this.maxSize) this.history.shift();
  }

  getSmoothed(): Gesture {
    if (this.history.length === 0) return { type: "none", score: 0 };
    const weights = this.history.map(
      (_, i) => (i + 1) / this.history.length,
    );
    const total = weights.reduce((s, w) => s + w, 0);
    const weighted = this.history.reduce(
      (acc, item, i) => {
        const w = weights[i] / total;
        acc[item.type] = (acc[item.type] ?? 0) + item.score * w;
        return acc;
      },
      {} as Record<string, number>,
    );
    const type = Object.entries(weighted).reduce(
      (best, [k, v]) => (v > best[1] ? [k, v] : best),
      ["none", 0],
    )[0] as GestureType;
    const score = weighted[type] ?? 0;
    return { type, score, confidence: score };
  }

  clear(): void {
    this.history = [];
  }
}

// ── Gesture Debouncer ───────────────────────────────────────────────────────

export class GestureDebouncer {
  private lastGesture: GestureType = "none";
  private lastTime = 0;
  private debounceMs: number;

  constructor(debounceMs: number = 300) {
    this.debounceMs = debounceMs;
  }

  debounce(gesture: Gesture): Gesture {
    const now = Date.now();
    if (
      gesture.type !== "none" &&
      (gesture.type !== this.lastGesture ||
        now - this.lastTime > this.debounceMs)
    ) {
      this.lastGesture = gesture.type;
      this.lastTime = now;
      return gesture;
    }
    return { type: "none", score: 0 };
  }

  reset(): void {
    this.lastGesture = "none";
    this.lastTime = 0;
  }
}

// ── Spatial Cursor ──────────────────────────────────────────────────────────

export class SpatialCursor {
  private position: CursorPosition = { x: 0.5, y: 0.5 };
  private velocity: CursorPosition = { x: 0, y: 0 };
  private targetPosition: CursorPosition = { x: 0.5, y: 0.5 };
  private smoothness: number;
  private friction: number;
  private maxSpeed: number;

  constructor(
    smoothness: number = 0.25,
    friction: number = 0.85,
    maxSpeed: number = 0.08,
  ) {
    this.smoothness = smoothness;
    this.friction = friction;
    this.maxSpeed = maxSpeed;
  }

  update(targetX: number, targetY: number): CursorPosition {
    this.targetPosition = { x: targetX, y: targetY };

    const dx = targetX - this.position.x;
    const dy = targetY - this.position.y;

    // Velocity prediction with exponential smoothing
    const vx = exponentialSmooth(this.velocity.x, dx * (1 - this.smoothness), 0.1);
    const vy = exponentialSmooth(this.velocity.y, dy * (1 - this.smoothness), 0.1);

    // Clamp max speed to prevent overshoot
    this.velocity.x = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, vx));
    this.velocity.y = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, vy));

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Apply friction
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;

    return { ...this.position };
  }

  getPosition(): CursorPosition {
    return { ...this.position };
  }

  setPosition(x: number, y: number): void {
    this.position = { x, y };
    this.targetPosition = { x, y };
    this.velocity = { x: 0, y: 0 };
  }

  reset(): void {
    this.position = { x: 0.5, y: 0.5 };
    this.targetPosition = { x: 0.5, y: 0.5 };
    this.velocity = { x: 0, y: 0 };
  }
}

// ── Interaction State ───────────────────────────────────────────────────────

export type InteractionState = {
  gesture: GestureType;
  cursorX: number;
  cursorY: number;
  isPinching: boolean;
  isGrabbing: boolean;
  isInteracting: boolean;
};

export function createDefaultInteractionState(): InteractionState {
  return {
    gesture: "none",
    cursorX: 0.5,
    cursorY: 0.5,
    isPinching: false,
    isGrabbing: false,
    isInteracting: false,
  };
}

// ── Two-Hand Gestures ──────────────────────────────────────────────────────

export type TwoHandGesture = {
  type: "two_hand_scale" | "two_hand_rotate" | "none";
  magnitude: number;
};

export function detectTwoHandGesture(
  hands: Hand[],
): TwoHandGesture {
  if (hands.length < 2) return { type: "none", magnitude: 0 };

  const palm0 = hands[0].landmarks[0];
  const palm1 = hands[1].landmarks[0];
  if (!palm0 || !palm1) return { type: "none", magnitude: 0 };

  const dist = distance2D(palm0, palm1);
  const angle = Math.atan2(palm1.y - palm0.y, palm1.x - palm0.x);

  // Use distance as magnitude for scale, angle for rotation
  const isHorizontal = Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle));

  if (isHorizontal) {
    return { type: "two_hand_scale", magnitude: dist };
  } else {
    return { type: "two_hand_rotate", magnitude: angle };
  }
}