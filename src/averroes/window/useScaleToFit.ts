import { useLayoutEffect, useRef, useState } from "react";

/** On a phone, a demo never shrinks below this: under it the text stops being readable. */
const PHONE_MIN_SCALE = 0.55;
const PHONE = "(max-width: 809.98px)";

/** Échelle d'une fenêtre de largeur `design` posée dans `width` pixels. Jamais d'agrandissement. */
export function fitScale(width: number, design: number, min = 0): number {
  if (!width) return 1;
  return Math.min(1, Math.max(min, width / design));
}

/**
 * La fenêtre se réduit d'un bloc sous sa largeur de dessin : ses vitrines ne se
 * réorganisent jamais, elles rapetissent. Le conteneur reçoit la hauteur réduite
 * pour que la page ne garde pas un vide sous la miniature.
 *
 * On a phone the scale has a floor: the block stays legible and the container
 * scrolls sideways instead (`pannable`).
 */
export function useScaleToFit(design: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pannable, setPannable] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const min = window.matchMedia?.(PHONE).matches ? PHONE_MIN_SCALE : 0;
      const s = fitScale(el.clientWidth, design, min);
      setScale(s);
      setPannable(design * s > el.clientWidth + 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [design]);
  return { ref, scale, pannable };
}
