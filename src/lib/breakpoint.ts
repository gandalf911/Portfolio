import { useSyncExternalStore } from "react";

// Framer's three breakpoints.
export type Breakpoint = "desktop" | "tablet" | "phone";

const PHONE = "(max-width: 809.98px)";
const TABLET = "(min-width: 810px) and (max-width: 1199.98px)";

function read(): Breakpoint {
  if (typeof window === "undefined") return "desktop";
  if (window.matchMedia(PHONE).matches) return "phone";
  if (window.matchMedia(TABLET).matches) return "tablet";
  return "desktop";
}

function subscribe(onChange: () => void) {
  const queries = [PHONE, TABLET].map((q) => window.matchMedia(q));
  queries.forEach((q) => q.addEventListener("change", onChange));
  return () => queries.forEach((q) => q.removeEventListener("change", onChange));
}

export function useBreakpoint(): Breakpoint {
  return useSyncExternalStore(subscribe, read, () => "desktop");
}

/** Pick a value per breakpoint; tablet and phone fall back to the previous one. */
export function pick<T>(bp: Breakpoint, values: { desktop: T; tablet?: T; phone?: T }): T {
  if (bp === "phone") return values.phone ?? values.tablet ?? values.desktop;
  if (bp === "tablet") return values.tablet ?? values.desktop;
  return values.desktop;
}
