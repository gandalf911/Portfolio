import { useEffect, useState } from "react";
import { prefersReducedMotion } from "./reducedMotion";

/**
 * Faux au premier rendu, vrai à l'image suivante : une barre posée à 0 puis
 * « armée » glisse vers sa valeur par transition CSS. Sous mouvement réduit,
 * armé d'emblée : les valeurs finales s'affichent sans animation.
 */
export function useArmed(delay = 0): boolean {
  const [armed, setArmed] = useState(prefersReducedMotion);
  useEffect(() => {
    if (armed) return;
    const t = window.setTimeout(() => requestAnimationFrame(() => setArmed(true)), delay);
    return () => window.clearTimeout(t);
  }, [armed, delay]);
  return armed;
}
