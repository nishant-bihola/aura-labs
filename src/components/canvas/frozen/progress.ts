/**
 * Shared mutable refs for the frozen hero scene. Written by DOM-side
 * rAF (scroll measurement) and pointer listeners; read inside the R3F
 * frame loop. Deliberately not React state — zero re-renders per tick.
 */
export const heroProgress = { value: 0 };
export const heroPointer = { x: 0, y: 0 };

export const isCoarsePointer = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768);

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
