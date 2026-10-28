import { useEffect, useRef, useState } from "react";

/** Paragraphe qui s'allume mot à mot au défilement, comme « From finance to systems engineering » du portfolio. */
export function WordFill({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(" ");
  const [lit, setLit] = useState(() =>
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? words.length : 0,
  );
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      // 0 quand le haut du paragraphe touche 85 % de l'écran, 1 quand son bas atteint 45 %.
      const p = (vh * 0.85 - r.top) / (r.height + vh * 0.4);
      setLit(Math.round(Math.max(0, Math.min(1, p)) * words.length));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  }, [words.length]);
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <span key={i} style={{ color: i < lit ? "#fff" : "rgba(255,255,255,.22)", transition: "color .25s" }}>
          {w}{" "}
        </span>
      ))}
    </p>
  );
}
