import { useEffect, type RefObject } from "react";
import { animate, stagger } from "animejs";
import { prefersReducedMotion } from "./reducedMotion";

/** Entrée des cartes d'une vitrine : fondu + montée, en cascade sur `selector`. */
export function useEntrance(ref: RefObject<HTMLElement | null>, selector = ".avw-card", opts: { delay?: number; y?: number } = {}) {
  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    const els = root.querySelectorAll<HTMLElement>(selector);
    if (!els.length) return;
    const a = animate(els, {
      opacity: [0, 1],
      y: [opts.y ?? 14, 0],
      duration: 650,
      delay: stagger(70, { start: opts.delay ?? 0 }),
      ease: "out(3)",
    });
    return () => {
      a.revert();
    };
  }, [ref, selector, opts.delay, opts.y]);
}
