"use client";

import { useCallback, useEffect, useRef } from "react";

type SpotlightOptions = {
  /** CSS variable name for the X coordinate (default: --mouse-x) */
  xVar?: string;
  /** CSS variable name for the Y coordinate (default: --mouse-y) */
  yVar?: string;
  /** Whether the spotlight is active (default: true) */
  enabled?: boolean;
};

type SpotlightResult = {
  /** Attach this to the container element's onMouseMove */
  onMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
  /** Attach this to the container element's ref */
  ref: React.RefObject<HTMLElement | null>;
};

/**
 * Custom React hook that tracks mouse position within a container element
 * and updates CSS custom variables for radial gradient spotlight effects.
 *
 * @example
 * ```tsx
 * const { ref, onMouseMove } = useSpotlight();
 * return (
 *   <div ref={ref} onMouseMove={onMouseMove} className="spotlight">
 *     <Card>Hover me for spotlight effect</Card>
 *   </div>
 * );
 * ```
 */
export function useSpotlight(options: SpotlightOptions = {}): SpotlightResult {
  const {
    xVar = "--mouse-x",
    yVar = "--mouse-y",
    enabled = true,
  } = options;

  const ref = useRef<HTMLElement | null>(null);
  const rafId = useRef<number | null>(null);
  const pendingCoords = useRef<{ x: number; y: number } | null>(null);

  const updateCoordinates = useCallback(
    (x: number, y: number) => {
      const el = ref.current;
      if (!el) return;

      el.style.setProperty(xVar, `${x}px`);
      el.style.setProperty(yVar, `${y}px`);
    },
    [xVar, yVar],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!enabled) return;

      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      pendingCoords.current = { x, y };

      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(() => {
          if (pendingCoords.current) {
            updateCoordinates(pendingCoords.current.x, pendingCoords.current.y);
            pendingCoords.current = null;
          }
          rafId.current = null;
        });
      }
    },
    [enabled, updateCoordinates],
  );

  useEffect(() => {
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return { ref, onMouseMove };
}

/**
 * Standalone utility that attaches mouse tracking to a DOM element.
 * Useful when you need to add spotlight behavior to elements you don't control directly.
 *
 * @example
 * ```ts
 * useEffect(() => {
 *   const el = document.querySelector(".my-container");
 *   return attachSpotlight(el);
 * }, []);
 * ```
 */
export function attachSpotlight(
  element: HTMLElement | null,
  options: Pick<SpotlightOptions, "xVar" | "yVar"> = {},
): (() => void) | undefined {
  if (!element) return undefined;

  const { xVar = "--mouse-x", yVar = "--mouse-y" } = options;
  let rafId: number | null = null;
  let pending: { x: number; y: number } | null = null;

  function apply(x: number, y: number): void {
    element!.style.setProperty(xVar, `${x}px`);
    element!.style.setProperty(yVar, `${y}px`);
  }

  function onMouseMove(e: MouseEvent): void {
    const rect = element!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    pending = { x, y };

    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (pending) {
          apply(pending.x, pending.y);
          pending = null;
        }
        rafId = null;
      });
    }
  }

  element.addEventListener("mousemove", onMouseMove, { passive: true });

  return () => {
    element.removeEventListener("mousemove", onMouseMove);
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
  };
}