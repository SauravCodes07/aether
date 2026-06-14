"use client";

import { useEffect } from "react";

/**
 * Scroll reveal — activates `.animate-on-scroll` sections via IntersectionObserver.
 * Sections fade + slide up as they enter the viewport.
 *
 * Place once in the root layout. Lightweight, no Framer Motion dependency.
 */
export function ScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll(".animate-on-scroll");

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: "-80px",
        threshold: 0.08,
      },
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}