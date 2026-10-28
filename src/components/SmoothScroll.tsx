import { useEffect } from "react";
import Lenis from "lenis";

let instance: Lenis | null = null;

/** The running Lenis instance, so links can scroll through it. */
export function getLenis() {
  return instance;
}

/**
 * Framer's "Smooth Scroll" component (intensity 10): Lenis with a 1 s duration-based
 * easing, plus same-page anchor links routed through Lenis and their scroll-margin-top.
 */
export function SmoothScroll({ intensity = 10 }: { intensity?: number }) {
  useEffect(() => {
    const lenis = new Lenis({ duration: (intensity || 10) / 10, lerp: 0 });
    instance = lenis;
    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    });

    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      const target = document.querySelector(decodeURIComponent(url.hash));
      if (!target) return;
      e.preventDefault();
      const margin = parseInt(getComputedStyle(target).scrollMarginTop) || 0;
      lenis.scrollTo(target as HTMLElement, { offset: -margin });
      history.replaceState(null, "", url.hash);
    };
    document.addEventListener("click", onClick);

    // Arriving from another page with a hash (e.g. /averroes → /#projects).
    if (location.hash) {
      const target = document.querySelector(decodeURIComponent(location.hash));
      if (target) setTimeout(() => lenis.scrollTo(target as HTMLElement, { immediate: true }), 50);
    }

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      lenis.destroy();
      instance = null;
    };
  }, [intensity]);

  return null;
}
