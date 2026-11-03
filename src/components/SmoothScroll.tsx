import { useEffect } from "react";
import Lenis from "lenis";

let instance: Lenis | null = null;

/** The running Lenis instance, so links can scroll through it. */
export function getLenis() {
  return instance;
}

/**
 * Smooth scroll for every page (mounted once in Layout). Lenis in lerp mode: each frame the page
 * closes a fixed share of the distance to where the wheel or trackpad is heading, so the motion
 * is one continuous glide. The previous duration mode restarted a 1 s ease on every wheel tick,
 * which read as stiff steps. Nested scroll areas (drawers, lists) keep their own scroll, and
 * anything marked data-lenis-prevent-wheel (the 3D galaxy's zoom) keeps the wheel.
 * Same-page anchor links are routed through Lenis with their scroll-margin-top.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 1, allowNestedScroll: true });
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
  }, []);

  return null;
}
