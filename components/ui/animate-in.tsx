"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  FADE_UP_VARIANTS,
  BLUR_FADE_VARIANTS,
  SCALE_UP_VARIANTS,
  SLIDE_IN_LEFT_VARIANTS,
  SLIDE_IN_RIGHT_VARIANTS,
  FADE_IN_VARIANTS,
  VIEWPORT_ONCE,
} from "@/lib/motion";

type AnimateInVariant =
  | "fadeUp"
  | "fadeIn"
  | "blurFade"
  | "scaleUp"
  | "slideLeft"
  | "slideRight";

type AnimateInProps = {
  children: React.ReactNode;
  variant?: AnimateInVariant;
  delay?: number;
  className?: string;
  /** Threshold fraction of element visible before triggering (0-1) */
  threshold?: number;
  /** Whether the animation should only trigger once */
  once?: boolean;
  /** HTML tag to render */
  as?: "div" | "section" | "article" | "li" | "span";
};

const variantMap = {
  fadeUp: FADE_UP_VARIANTS,
  fadeIn: FADE_IN_VARIANTS,
  blurFade: BLUR_FADE_VARIANTS,
  scaleUp: SCALE_UP_VARIANTS,
  slideLeft: SLIDE_IN_LEFT_VARIANTS,
  slideRight: SLIDE_IN_RIGHT_VARIANTS,
} as const;

/**
 * Reusable scroll-reveal wrapper.
 * Wraps children in a `motion.div` that animates in when it enters the viewport.
 *
 * @example
 * <AnimateIn variant="fadeUp" delay={0.1}>
 *   <Card>...</Card>
 * </AnimateIn>
 */
export function AnimateIn({
  children,
  variant = "fadeUp",
  delay = 0,
  className,
  threshold = 0.1,
  once = true,
  as = "div",
}: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once,
    margin: VIEWPORT_ONCE.margin,
    amount: threshold,
  });

  const variants = variantMap[variant];
  const Component = motion.create(as);

  return (
    <Component
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      custom={delay}
      className={className}
    >
      {children}
    </Component>
  );
}

/**
 * Stagger container — wrap multiple `<AnimateIn>` children
 * to automatically stagger their appearance.
 */
type StaggerContainerProps = {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  as?: "div" | "ul" | "section";
};

export function StaggerContainer({
  children,
  className,
  stagger = 0.08,
  as = "div",
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    margin: VIEWPORT_ONCE.margin,
    amount: 0.1,
  });

  const Component = motion.create(as);

  return (
    <Component
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
          },
        },
      }}
      className={className}
    >
      {children}
    </Component>
  );
}