import { useLayoutEffect, useRef, useState } from "react";

/** Échelle d'une fenêtre de largeur `design` posée dans `width` pixels. Jamais d'agrandissement. */
export function fitScale(width: number, design: number): number {
  if (!width) return 1;
  return Math.min(1, width / design);
}

/**
 * La fenêtre se réduit d'un bloc sous sa largeur de dessin : ses vitrines ne se
 * réorganisent jamais, elles rapetissent. Le conteneur reçoit la hauteur réduite
 * pour que la page ne garde pas un vide sous la miniature.
 */
export function useScaleToFit(design: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setScale(fitScale(el.clientWidth, design));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [design]);
  return { ref, scale };
}
