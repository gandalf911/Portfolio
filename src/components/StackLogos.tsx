import { useEffect, useRef, useState } from "react";
import type { StackItem } from "../content";
import "./StackLogos.css";

/* The stack as 3D logos (after the Framer "Interactive Balls" component, Logos mode):
   every tool's mark extruded into a solid that tumbles, collides and gets pushed around
   by the cursor. The scene (three.js) is only fetched when the section comes near. */

type Props = {
  items: StackItem[];
  /** Restitution on impact, 0 (dead) to 1 (superball). */
  bounciness?: number;
  /** Velocity loss per second. */
  damping?: number;
  anchor?: "center" | "top" | "bottom";
};

export function StackLogos({ items, bounciness = 0.5, damping = 1.6, anchor = "center" }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    const label = labelRef.current;
    if (!host || !label) return;
    let dispose: (() => void) | null = null;
    let cancelled = false;
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        import("./stackLogosScene")
          .then(({ mountStackLogos }) => {
            if (!cancelled) dispose = mountStackLogos(host, { bounciness, damping, anchor, label });
          })
          .catch(() => setFailed(true));
      },
      { rootMargin: "600px 0px" },
    );
    near.observe(host);
    return () => {
      cancelled = true;
      near.disconnect();
      dispose?.();
    };
  }, [bounciness, damping, anchor]);

  return (
    <div className="stack-logos">
      <div ref={hostRef} className="stack-logos__stage" aria-hidden="true">
        <div ref={labelRef} className="stack-logos__label" />
      </div>
      {failed ? (
        <ul className="stack-logos__fallback">
          {items.map((it) => (
            <li key={it.name}>{it.src ? <img src={it.src} alt={it.name} /> : it.name}</li>
          ))}
        </ul>
      ) : (
        <ul className="sr-only">
          {items.map((it) => (
            <li key={it.name}>{it.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
