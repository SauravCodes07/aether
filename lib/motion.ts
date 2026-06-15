/**
 * Centralized Framer Motion animation tokens and transition presets.
 * Ensures consistent, premium interactions (springs, eases, fade-ups) across the application.
 *
 * RULES:
 * - Every motion in Aether must use a preset from this file.
 * - No random `transition={{ duration: 0.3 }}` in components.
 * - Add new variants here, import them where needed.
 */

/* ─── Spring Presets ───────────────────────────────────────────────── */

export const SPRING_PRESETS = {
  soft: { type: "spring" as const, stiffness: 100, damping: 20 },
  default: { type: "spring" as const, stiffness: 150, damping: 18 },
  stiff: { type: "spring" as const, stiffness: 300, damping: 25 },
  bouncy: { type: "spring" as const, stiffness: 200, damping: 10 },
  snappy: { type: "spring" as const, stiffness: 400, damping: 30 },
  gentle: { type: "spring" as const, stiffness: 80, damping: 20 },
  navbar: { type: "spring" as const, stiffness: 350, damping: 25 },
  floating: { type: "spring" as const, stiffness: 50, damping: 10 },
  cinematic: { type: "spring" as const, stiffness: 40, damping: 25, mass: 1.2 },
  telemetry: { type: "spring" as const, stiffness: 200, damping: 30, restDelta: 0.001 },
} as const;

/* ─── Ease / Tween Presets ─────────────────────────────────────────── */

export const EASE_PRESETS = {
  smooth: { type: "tween" as const, ease: [0.16, 1, 0.3, 1] as const, duration: 0.6 },
  rapid: { type: "tween" as const, ease: [0.16, 1, 0.3, 1] as const, duration: 0.35 },
  slow: { type: "tween" as const, ease: [0.16, 1, 0.3, 1] as const, duration: 1.2 },
  elegant: { type: "tween" as const, ease: [0.22, 1, 0.36, 1] as const, duration: 0.8 },
  easeInOut: { type: "tween" as const, ease: [0.42, 0, 0.58, 1] as const, duration: 0.25 },
  easeIn: { type: "tween" as const, ease: [0.4, 0, 1, 1] as const, duration: 0.2 },
  ambient: { type: "tween" as const, ease: [0.45, 0, 0.55, 1] as const, duration: 8 },
  ultraSlow: { type: "tween" as const, ease: [0.16, 1, 0.3, 1] as const, duration: 2.5 },
  linear: { type: "tween" as const, ease: [0, 0, 1, 1] as const, duration: 1 },
} as const;

/* ─── Standard Durations ───────────────────────────────────────────── */

export const DURATION = {
  fast: 0.15,
  normal: 0.3,
  medium: 0.5,
  slow: 0.8,
  reveal: 0.6,
  ambient: 8,
  glitch: 0.1,
} as const;

/* ─── Stagger Delays ───────────────────────────────────────────────── */

export const STAGGER = {
  fast: 0.05,
  default: 0.08,
  slow: 0.12,
  section: 0.15,
} as const;

/* ─── Micro-Interactions: Phase 1 Spec ─────────────────────────────── */
/*
 * Phase 1 Spec:
 * - Hover: scale 1.02 (spring)
 * - Click/Tap: scale 0.98 (spring)
 */
export const MICRO_INTERACTION_VARIANTS = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};
export const MICRO_INTERACTION_TRANSITION = SPRING_PRESETS.snappy;
export const MICRO_INTERACTION_SCALE = { HOVER: 1.02, TAP: 0.98 } as const;

export const HOVER_TAP_VARIANTS = MICRO_INTERACTION_VARIANTS;
export const HOVER_TAP_TRANSITION = MICRO_INTERACTION_TRANSITION;
export const SCALE_HOVER_VARIANTS = {
  hover: { scale: 1.03 },
  tap: { scale: 0.95 },
};

/* ─── Telemetry & Data Streams ────────────────────────────────────── */

export const TELEMETRY_STREAM_VARIANTS = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { ...SPRING_PRESETS.telemetry } },
};

export const DATA_FLOW_VARIANTS = {
  animate: {
    strokeDashoffset: [0, -20],
    transition: { duration: 1, repeat: Infinity, ease: EASE_PRESETS.linear.ease },
  },
};

/* ─── Floating Ambient ─────────────────────────────────────────────── */

export const FLOATING_VARIANTS = {
  animate: (delay = 0) => ({
    y: [0, -8, 0, 6, 0],
    transition: { ...SPRING_PRESETS.floating, repeat: Infinity, repeatType: "mirror" as const, delay, duration: 6 },
  }),
};

export const FLOATING_SLOW = {
  animate: {
    y: [0, -12, 0, 8, 0],
    transition: { duration: 10, ease: EASE_PRESETS.easeInOut.ease, repeat: Infinity, repeatType: "mirror" as const },
  },
};

/* ─── Parallax & Perspective ───────────────────────────────────────── */

export const PERSPECTIVE_CONTAINER_VARIANTS = {
  hidden: { opacity: 0, rotateX: 20, y: 40, scale: 0.95 },
  visible: { opacity: 1, rotateX: 12, y: 0, scale: 1, transition: { ...SPRING_PRESETS.cinematic, delay: 0.2 } },
};

export const PARALLAX_LAYER_VARIANTS = {
  deep: { y: -20 },
  mid: { y: -40 },
  front: { y: -60 },
};

/* ─── Storytelling ─────────────────────────────────────────────────── */

export const SECTION_EXIT_VARIANTS = {
  visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, y: -40, scale: 0.98, filter: "blur(10px)", transition: EASE_PRESETS.elegant },
};

/* ─── Slide In ─────────────────────────────────────────────────────── */

export const SLIDE_IN_LEFT_VARIANTS = {
  hidden: { opacity: 0, x: -32 },
  visible: (delay = 0) => ({ opacity: 1, x: 0, transition: { ...SPRING_PRESETS.default, delay } }),
};

export const SLIDE_IN_RIGHT_VARIANTS = {
  hidden: { opacity: 0, x: 32 },
  visible: (delay = 0) => ({ opacity: 1, x: 0, transition: { ...SPRING_PRESETS.default, delay } }),
};

export const SLIDE_DOWN_VARIANTS = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: SPRING_PRESETS.snappy },
  exit: { opacity: 0, y: -8, transition: SPRING_PRESETS.navbar },
};

/* ─── Fade Up / In ─────────────────────────────────────────────────── */

export const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({ opacity: 1, y: 0, transition: { ...SPRING_PRESETS.default, delay } }),
};

export const FADE_IN_VARIANTS = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({ opacity: 1, transition: { ...EASE_PRESETS.rapid, delay } }),
};

export const SCALE_UP_VARIANTS = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (delay = 0) => ({ opacity: 1, scale: 1, transition: { ...SPRING_PRESETS.default, delay } }),
};

export const BLUR_FADE_VARIANTS = {
  hidden: { opacity: 0, y: 16, filter: "blur(8px)" },
  visible: (delay = 0) => ({ opacity: 1, y: 0, filter: "blur(0px)", transition: { ...EASE_PRESETS.elegant, delay } }),
};

/* ─── Stagger ──────────────────────────────────────────────────────── */

export const STAGGER_CONTAINER_VARIANTS = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER.default } },
};

export const STAGGER_CONTAINER_SLOW = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER.slow } },
};

export const STAGGER_ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: SPRING_PRESETS.default },
};

/* ─── Mobile Drawer ────────────────────────────────────────────────── */

export const MOBILE_DRAWER_VARIANTS = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto" as const, transition: EASE_PRESETS.easeInOut },
  exit: { opacity: 0, height: 0, transition: EASE_PRESETS.easeInOut },
};

export const MOBILE_NAV_ITEM_VARIANTS = {
  hidden: { opacity: 0, x: -10 },
  visible: (delay = 0) => ({ opacity: 1, x: 0, transition: { ...SPRING_PRESETS.default, delay } }),
};

/* ─── Nav ──────────────────────────────────────────────────────────── */

export const NAV_ACTIVE_LINE_TRANSITION = SPRING_PRESETS.navbar;

export const NAV_HOVER_INDICATOR_VARIANTS = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: { opacity: 1, scaleX: 1, transition: SPRING_PRESETS.snappy },
};

export const NAV_LINK_HOVER = {
  rest: { color: "var(--aether-text-muted)" },
  hover: { color: "var(--aether-text)" },
};

export const NAV_LINK_TRANSITION = { type: "tween" as const, ease: EASE_PRESETS.easeIn.ease, duration: 0.2 };

/* ─── Dropdown ─────────────────────────────────────────────────────── */

export const DROPDOWN_VARIANTS = {
  hidden: { opacity: 0, scale: 0.95, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: SPRING_PRESETS.navbar },
  exit: { opacity: 0, scale: 0.95, y: 8, transition: SPRING_PRESETS.navbar },
};

/* ─── Viewport ─────────────────────────────────────────────────────── */

export const VIEWPORT_ONCE = { once: true, margin: "-80px" } as const;
export const VIEWPORT_REPEAT = { once: false, margin: "-80px" } as const;

/* ─── Card / Panel ─────────────────────────────────────────────────── */

export const CARD_HOVER_VARIANTS = {
  rest: { scale: 1, y: 0 },
  hover: { scale: MICRO_INTERACTION_SCALE.HOVER, y: -4, transition: SPRING_PRESETS.snappy },
};

export const PANEL_FLOAT_VARIANTS = {
  animate: (i = 0) => ({
    y: [0, -6, 0, 4, 0],
    transition: { duration: 5 + i, ease: EASE_PRESETS.easeInOut.ease, repeat: Infinity, repeatType: "mirror" as const },
  }),
};

/* ─── Section Reveal ───────────────────────────────────────────────── */

export const SECTION_REVEAL_VARIANTS = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { ...SPRING_PRESETS.gentle, staggerChildren: 0.1 } },
};

/* ─── Page Transitions ─────────────────────────────────────────────── */

export const PAGE_TRANSITION_VARIANTS = {
  hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring" as const, stiffness: 80, damping: 20, duration: 0.5 } },
  exit: { opacity: 0, y: -8, filter: "blur(4px)", transition: { duration: 0.25, ease: EASE_PRESETS.easeIn.ease } },
};

/* ─── Command Palette ─────────────────────────────────────────────── */

export const COMMAND_PALETTE_VARIANTS = {
  hidden: { opacity: 0, scale: 0.96, y: -12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 25, mass: 0.8 } },
  exit: { opacity: 0, scale: 0.96, y: -12, transition: { duration: 0.15, ease: EASE_PRESETS.easeIn.ease } },
};

export const COMMAND_ITEM_VARIANTS = {
  hidden: { opacity: 0, x: -12 },
  visible: (delay = 0) => ({ opacity: 1, x: 0, transition: { ...SPRING_PRESETS.default, delay } }),
  exit: { opacity: 0, x: -12 },
};

/* ─── File Tree ────────────────────────────────────────────────────── */

export const FILE_TREE_ITEM_VARIANTS = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: { opacity: 1, height: "auto", marginTop: 2, transition: { ...SPRING_PRESETS.gentle, duration: 0.3 } },
  exit: { opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.2, ease: EASE_PRESETS.easeIn.ease } },
};

/* ─── Resizable Panels ─────────────────────────────────────────────── */

export const RESIZE_HANDLE_VARIANTS = {
  rest: { opacity: 0, scaleX: 0.5 },
  hover: { opacity: 1, scaleX: 1, transition: SPRING_PRESETS.snappy },
};

/* ─── AI Streaming ─────────────────────────────────────────────────── */

export const AI_STREAMING_CURSOR_VARIANTS = {
  animate: { opacity: [1, 0.3, 1], transition: { duration: 1.2, repeat: Infinity, ease: EASE_PRESETS.easeInOut.ease } },
};

export const AI_MESSAGE_VARIANTS = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { ...SPRING_PRESETS.gentle } },
};

/* ─── Canvas Node ─────────────────────────────────────────────────── */

export const CANVAS_NODE_VARIANTS = {
  hidden: { opacity: 0, scale: 0.8, y: 16 },
  visible: (delay = 0) => ({ opacity: 1, scale: 1, y: 0, transition: { ...SPRING_PRESETS.bouncy, delay } }),
  exit: { opacity: 0, scale: 0.8, y: 16, transition: { duration: 0.2 } },
};

export const CANVAS_EDGE_VARIANTS = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1, transition: { duration: 0.8, ease: EASE_PRESETS.smooth.ease } },
};

/* ─── Multiplayer Cursor ───────────────────────────────────────────── */

export const REMOTE_CURSOR_VARIANTS = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { opacity: 1, scale: 1, transition: SPRING_PRESETS.bouncy },
  exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } },
};

/* ─── Toast / Notification ─────────────────────────────────────────── */

export const TOAST_VARIANTS = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: SPRING_PRESETS.bouncy },
  exit: { opacity: 0, y: -8, scale: 0.96, transition: { duration: 0.2, ease: EASE_PRESETS.easeIn.ease } },
};

/* ─── Modal / Overlay ──────────────────────────────────────────────── */

export const MODAL_OVERLAY_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const MODAL_CONTENT_VARIANTS = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: SPRING_PRESETS.navbar },
  exit: { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.15, ease: EASE_PRESETS.easeIn.ease } },
};