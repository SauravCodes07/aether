"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

type CounterProps = {
  /** Target value to count up to */
  value: number;
  /** Duration of the count-up animation in milliseconds */
  duration?: number;
  /** Suffix to append (e.g. "+", "%", "ms") */
  suffix?: string;
  /** Prefix to prepend (e.g. "$") */
  prefix?: string;
  /** Number of decimal places */
  decimals?: number;
  className?: string;
};

/**
 * Animated number counter that counts up when the element scrolls into view.
 * Uses requestAnimationFrame for smooth 60fps animation.
 */
export function Counter({
  value,
  duration = 2000,
  suffix = "",
  prefix = "",
  decimals = 0,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const startTime = performance.now();
    let animationFrame: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for decelerating count
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * value;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isInView, value, duration]);

  const formatted = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString();

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
