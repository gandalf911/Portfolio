import { motion, useAnimationFrame, useMotionValue, useTransform, wrap } from "motion/react";
import { Children, useLayoutEffect, useRef, useState, type ReactNode } from "react";

/**
 * Framer's "Ticker" effect as set on the stack rows: an endless row moving at 50 px/s,
 * 30 px gap, items centred, overflow visible, draggable, same speed on hover.
 * `reverse` runs it the other way.
 */
export function Ticker({
  children,
  velocity = 50,
  gap = 30,
  reverse = false,
  className,
}: {
  children: ReactNode;
  velocity?: number;
  gap?: number;
  reverse?: boolean;
  className?: string;
}) {
  const items = Children.toArray(children);
  const rowRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const [setWidth, setSetWidth] = useState(0);
  const [copies, setCopies] = useState(2);

  useLayoutEffect(() => {
    const measure = () => {
      const row = rowRef.current;
      const set = setRef.current;
      if (!row || !set) return;
      const w = set.offsetWidth + gap;
      setSetWidth(w);
      setCopies(Math.max(2, Math.ceil(row.offsetWidth / w) + 1));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (rowRef.current) ro.observe(rowRef.current);
    if (setRef.current) ro.observe(setRef.current);
    return () => ro.disconnect();
  }, [gap, items.length]);

  const offset = useMotionValue(0);
  const dragging = useRef(false);
  const x = useTransform(offset, (v) => (setWidth ? wrap(-setWidth, 0, v) : 0));

  useAnimationFrame((_, delta) => {
    if (dragging.current || !setWidth) return;
    const dir = reverse ? 1 : -1;
    offset.set(offset.get() + (dir * velocity * Math.min(delta, 100)) / 1000);
  });

  const panFrom = useRef(0);

  return (
    <div ref={rowRef} className={className} style={{ position: "relative", overflow: "visible" }}>
      <motion.div
        style={{ x, display: "flex", gap, alignItems: "center", width: "max-content", cursor: "grab", touchAction: "pan-y" }}
        onPanStart={() => {
          dragging.current = true;
          panFrom.current = offset.get();
        }}
        onPan={(_, info) => offset.set(panFrom.current + info.offset.x)}
        onPanEnd={() => {
          dragging.current = false;
        }}
      >
        {Array.from({ length: copies }, (_, c) => (
          <div
            key={c}
            ref={c === 0 ? setRef : undefined}
            aria-hidden={c > 0 || undefined}
            style={{ display: "flex", gap, alignItems: "center", flex: "none" }}
          >
            {items}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
