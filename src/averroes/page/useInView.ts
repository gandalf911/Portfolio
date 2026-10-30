import { useEffect, useRef, useState } from "react";

/**
 * `inView` : vrai dès que l'élément entre dans le viewport, et le reste (entrées).
 * `live` : vrai seulement tant qu'il y est. Les boucles (minuteries, animations
 * infinies) s'y accrochent, sinon elles tournent hors champ et chargent le défilement.
 * Sans IntersectionObserver, ou en mouvement réduit : tout est vrai d'emblée.
 */
export function useInView<T extends Element>(threshold = 0.25) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  const [live, setLive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      setLive(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        setLive(e.isIntersecting);
        if (e.isIntersecting) setInView(true);
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView, live };
}
