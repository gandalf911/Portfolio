import { Suspense, useEffect, useState, type ComponentType, type LazyExoticComponent } from "react";
import { useScaleToFit } from "../averroes/window/useScaleToFit";

/**
 * A live demo drawn at its design size and scaled down as one block: it never reflows,
 * it shrinks. The demo is only mounted once the frame nears the viewport, so its entrance
 * animation plays when it is seen and heavy modules (three.js) load on demand.
 */
export function Canvas({
  demo: Demo,
  width,
  height,
  dark = false,
}: {
  demo: LazyExoticComponent<ComponentType> | ComponentType;
  width: number;
  height: number;
  dark?: boolean;
}) {
  const { ref, scale, pannable } = useScaleToFit(width);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, seen]);

  return (
    <div ref={ref} className="dv-canvas" data-pannable={pannable || undefined} style={{ height: height * scale }}>
      <div style={{ width: width * scale, height: height * scale, overflow: "hidden" }}>
      <div
        className="avw"
        data-theme={dark ? "dark" : undefined}
        style={{ width, height, transform: `scale(${scale})`, transformOrigin: "top left", background: "var(--bg)", padding: 16, boxSizing: "border-box" }}
      >
        {seen && (
          <Suspense fallback={<div className="dv-loading" />}>
            <Demo />
          </Suspense>
        )}
      </div>
      </div>
    </div>
  );
}
