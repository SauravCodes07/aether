"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ViewportState = {
  panX: number;
  panY: number;
  scale: number;
};

type ViewportWrapperProps = {
  children: React.ReactNode;
  className?: string;
  minScale?: number;
  maxScale?: number;
  enablePan?: boolean;
  enableZoom?: boolean;
  initialPan?: { x: number; y: number };
  initialScale?: number;
  onViewportChange?: (state: ViewportState) => void;
  showGrid?: boolean;
  ariaLabel?: string;
};

/**
 * Infinite 2D viewport wrapper with pan/zoom capabilities.
 * Provides a spatial canvas experience with mouse-driven navigation.
 *
 * @example
 * ```tsx
 * <ViewportWrapper>
 *   <div style={{ position: "absolute", left: 100, top: 100 }}>
 *     <Card>Node 1</Card>
 *   </div>
 *   <div style={{ position: "absolute", left: 400, top: 200 }}>
 *     <Card>Node 2</Card>
 *   </div>
 * </ViewportWrapper>
 * ```
 */
export function ViewportWrapper({
  children,
  className,
  minScale = 0.25,
  maxScale = 3,
  enablePan = true,
  enableZoom = true,
  initialPan = { x: 0, y: 0 },
  initialScale = 1,
  onViewportChange,
  showGrid = true,
  ariaLabel = "Infinite canvas viewport",
}: ViewportWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<ViewportState>({
    panX: initialPan.x,
    panY: initialPan.y,
    scale: initialScale,
  });

  const isPanning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const lastTouch = useRef({ x: 0, y: 0 });
  const pinchDistance = useRef(0);

  const clampScale = useCallback(
    (s: number): number => Math.min(maxScale, Math.max(minScale, s)),
    [minScale, maxScale],
  );

  const handleWheel = useCallback(
    (e: WheelEvent): void => {
      if (!enableZoom) return;
      e.preventDefault();

      const delta = e.deltaY * -0.001;

      setViewport((prev) => {
        const newScale = clampScale(prev.scale + delta);
        const next = { ...prev, scale: newScale };
        onViewportChange?.(next);
        return next;
      });
    },
    [enableZoom, clampScale, onViewportChange],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>): void => {
      if (!enablePan) return;
      if (e.button !== 0) return;

      isPanning.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      e.currentTarget.style.cursor = "grabbing";
    },
    [enablePan],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>): void => {
      if (!isPanning.current) return;

      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      lastMouse.current = { x: e.clientX, y: e.clientY };

      setViewport((prev) => {
        const next = {
          ...prev,
          panX: prev.panX + dx,
          panY: prev.panY + dy,
        };
        onViewportChange?.(next);
        return next;
      });
    },
    [onViewportChange],
  );

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>): void => {
    isPanning.current = false;
    e.currentTarget.style.cursor = "grab";
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>): void => {
      if (!enablePan) return;
      if (e.touches.length === 1) {
        isPanning.current = true;
        lastTouch.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      } else if (e.touches.length === 2) {
        isPanning.current = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchDistance.current = Math.sqrt(dx * dx + dy * dy);
      }
    },
    [enablePan],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>): void => {
      if (e.touches.length === 1 && isPanning.current) {
        const dx = e.touches[0].clientX - lastTouch.current.x;
        const dy = e.touches[0].clientY - lastTouch.current.y;
        lastTouch.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };

        setViewport((prev) => {
          const next = {
            ...prev,
            panX: prev.panX + dx,
            panY: prev.panY + dy,
          };
          onViewportChange?.(next);
          return next;
        });
      } else if (e.touches.length === 2 && enableZoom) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const delta = (distance - pinchDistance.current) * 0.005;
        pinchDistance.current = distance;

        setViewport((prev) => {
          const next = {
            ...prev,
            scale: clampScale(prev.scale + delta),
          };
          onViewportChange?.(next);
          return next;
        });
      }
    },
    [enableZoom, clampScale, onViewportChange],
  );

  const handleTouchEnd = useCallback((): void => {
    isPanning.current = false;
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const transform = `translate(${viewport.panX}px, ${viewport.panY}px) scale(${viewport.scale})`;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden select-none",
        enablePan && "cursor-grab",
        className,
      )}
      style={{ touchAction: "none" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="application"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "0" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          setViewport((prev) => {
            const next = { ...prev, scale: 1, panX: 0, panY: 0 };
            onViewportChange?.(next);
            return next;
          });
        }
        if (e.key === "=" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          setViewport((prev) => {
            const next = { ...prev, scale: clampScale(prev.scale + 0.1) };
            onViewportChange?.(next);
            return next;
          });
        }
        if (e.key === "-" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          setViewport((prev) => {
            const next = { ...prev, scale: clampScale(prev.scale - 0.1) };
            onViewportChange?.(next);
            return next;
          });
        }
      }}
    >
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: `${48 * viewport.scale}px ${48 * viewport.scale}px`,
            backgroundPosition: `${viewport.panX}px ${viewport.panY}px`,
          }}
          aria-hidden="true"
        />
      )}
      <div
        className="absolute inset-0"
        style={{ transform, transformOrigin: "0 0" }}
      >
        {children}
      </div>
    </div>
  );
}