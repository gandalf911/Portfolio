import { useLayoutEffect, useRef, type ReactNode } from "react";
import type { DescentItem } from "./copy";

/**
 * Carte de la pile. Une carte plus haute que l'écran ne colle qu'une fois son bas
 * visible (top négatif), sinon la suivante la recouvrirait avant qu'on ait lu la fin.
 */
export function DescentCard({ item, index, visual }: { item: DescentItem; index: number; visual: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const base = 90 + index * 18;
    const place = () => {
      el.style.top = `${Math.min(base, window.innerHeight - el.offsetHeight - 24)}px`;
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    window.addEventListener("resize", place);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", place);
    };
  }, [index]);
  return (
    <article ref={ref} className="dcard" id={item.anchor}>
      <div className="dcard-text">
        <span className="dcard-kicker">
          <b>{item.n}</b> {item.kicker}
        </span>
        <h3 className="serif">{item.title}</h3>
        <hr />
        {item.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {item.points && (
          <dl>
            {item.points.map((pt) => (
              <div key={pt.k}>
                <dt>{pt.k}</dt>
                <dd>{pt.v}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <div className="dcard-visual">{visual}</div>
    </article>
  );
}
