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
} as const;

/* ─── Ease / Tween Presets ─────────────────────────────────────────── */

export const EASE_PRESETS = {
  smooth: { type: "tween" as const, ease: [0.16, 1, 0.3, 1] as const, duration: 0.6 },
  rapid: { type: "tween" as const, ease: [0.16, 1, 0.3, 1] as const, duration: 0.35 },
  slow: { type: "tween" as const, ease: [0.16, 1, 0.3, 1] as const, duration: 1.2 },
  elegant: { type: "tween" as const, ease: [0.22, 1, 0.36, 1] as const, duration: 0.8 },
  /** Standard easeInOut for drawer/panel animations */
  easeInOut: { type: "tween" as const, ease: "easeInOut" as const, duration: 0.25 },
} as const;

/* ─── Standard Durations ───────────────────────────────────────────── */

export const DURATION = {
  fast: 0.15,
  normal: 0.3,
  medium: 0.5,
  slow: 0.8,
  reveal: 0.6,
} as const;

/* ─── Stagger Delays ───────────────────────────────────────────────── */

export const STAGGER = {
  fast: 0.05,
  default: 0.08,
  slow: 0.12,
  section: 0.15,
} as const;

/* ─── Hover & Tap Presets ──────────────────────────────────────────── */

/**
 * Standard whileHover/whileTap for interactive elements.
 * Usage: <motion.div whileHover="hover" whileTap="tap" variants={HOVER_TAP_VARIANTS}>
 */
export const HOVER_TAP_VARIANTS = {
  hover: { scale: 1.03 },
  tap: { scale: 0.95 },
};

/**
 * Transition that pairs with HOVER_TAP_VARIANTS.
 * Preferred: snappy spring for tactile feedback.
 */
export const HOVER_TAP_TRANSITION = SPRING_PRESETS.snappy;

/* ─── Scale Hover (logo, icons) ────────────────────────────────────── */

export const SCALE_HOVER_VARIANTS = {
  hover: { scale: 1.03 },
  tap: { scale: 0.95 },
};

/* ─── Slide In (horizontal) ────────────────────────────────────────── */

export const SLIDE_IN_LEFT_VARIANTS = {
  hidden: { opacity: 0, x: -32 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      ...SPRING_PRESETS.default,
      delay,
    },
  }),
};

export const SLIDE_IN_RIGHT_VARIANTS = {
  hidden: { opacity: 0, x: 32 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      ...SPRING_PRESETS.default,
      delay,
    },
  }),
};

/* ─── Slide In (vertical) — for dropdown menus ─────────────────────── */

export const SLIDE_DOWN_VARIANTS = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING_PRESETS.snappy,
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: SPRING_PRESETS.navbar,
  },
};

/* ─── Fade Up ──────────────────────────────────────────────────────── */

export const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      ...SPRING_PRESETS.default,
      delay,
    },
  }),
};

/* ─── Fade In ──────────────────────────────────────────────────────── */

export const FADE_IN_VARIANTS = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: {
      ...EASE_PRESETS.rapid,
      delay,
    },
  }),
};

/* ─── Scale Up ─────────────────────────────────────────────────────── */

export const SCALE_UP_VARIANTS = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      ...SPRING_PRESETS.default,
      delay,
    },
  }),
};

/* ─── Blur Fade (premium reveal) ───────────────────────────────────── */

export const BLUR_FADE_VARIANTS = {
  hidden: { opacity: 0, y: 16, filter: "blur(8px)" },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      ...EASE_PRESETS.elegant,
      delay,
    },
  }),
};

/* ─── Stagger Container ────────────────────────────────────────────── */

export const STAGGER_CONTAINER_VARIANTS = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER.default,
    },
  },
};

export const STAGGER_CONTAINER_SLOW = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER.slow,
    },
  },
};

/* ─── Item variant for stagger children ────────────────────────────── */

export const STAGGER_ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING_PRESETS.default,
  },
};

/* ─── Mobile Drawer ────────────────────────────────────────────────── */

export const MOBILE_DRAWER_VARIANTS = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto" as const,
    transition: EASE_PRESETS.easeInOut,
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: EASE_PRESETS.easeInOut,
  },
};

/* ─── Mobile Nav Item ──────────────────────────────────────────────── */

export const MOBILE_NAV_ITEM_VARIANTS = {
  hidden: { opacity: 0, x: -10 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      ...SPRING_PRESETS.default,
      delay,
    },
  }),
};

/* ─── Nav Active Line ──────────────────────────────────────────────── */

export const NAV_ACTIVE_LINE_TRANSITION = SPRING_PRESETS.navbar;

/* ─── Nav Hover Pill / Indicator ──────────────────────────────────── */

/**
 * Underline that slides in on hover and snaps to active state.
 * Use via AnimatePresence + layoutId on the underline element.
 */
export const NAV_HOVER_INDICATOR_VARIANTS = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: {
    opacity: 1,
    scaleX: 1,
    transition: SPRING_PRESETS.snappy,
  },
};

/* ─── Nav Link Hover ──────────────────────────────────────────────── */

export const NAV_LINK_HOVER = {
  rest: { color: "var(--aether-text-muted)" },
  hover: { color: "var(--aether-text)" },
};

export const NAV_LINK_TRANSITION = {
  type: "tween" as const,
  ease: "easeOut" as const,
  duration: 0.2,
};

/* ─── Dropdown (UserNavMenu) ───────────────────────────────────────── */

export const DROPDOWN_VARIANTS = {
  hidden: { opacity: 0, scale: 0.95, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: SPRING_PRESETS.navbar,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 8,
    transition: SPRING_PRESETS.navbar,
  },
};

/* ─── Viewport config for useInView / whileInView ──────────────────── */

export const VIEWPORT_ONCE = {
  once: true,
  margin: "-80px",
} as const;

export const VIEWPORT_REPEAT = {
  once: false,
  margin: "-80px",
} as const;