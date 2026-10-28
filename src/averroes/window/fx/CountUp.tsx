import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { prefersReducedMotion } from "./reducedMotion";

export function formatFr(n: number, decimals = 0): string {
  return n
    .toLocaleString("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    .replace(/ /g, " ");
}

/** Nombre qui compte jusqu'à sa valeur (séparateur de milliers, virgule décimale). */
export function CountUp({
  value,
  decimals = 0,
  suffix = "",
  duration = 1400,
  delay = 0,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
  delay?: number;
}) {
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? value : 0));
  const box = useRef({ v: 0 });
  useEffect(() => {
    if (prefersReducedMotion()) {
      setShown(value);
      return;
    }
    box.current.v = 0;
    const a = animate(box.current, {
      v: value,
      duration,
      delay,
      ease: "out(4)",
      onUpdate: () => setShown(box.current.v),
    });
    return () => {
      a.pause();
    };
  }, [value, duration, delay]);
  return (
    <>
      {formatFr(shown, decimals)}
      {suffix}
    </>
  );
}
