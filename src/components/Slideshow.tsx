import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
  wrap,
  mix,
  type MotionValue,
  type PanInfo,
} from "motion/react";
import { Children, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  startFrom?: number;
  gap?: number;
  autoPlay?: boolean;
  interval?: number;
  drag?: boolean;
  perspective?: number;
  effectsOpacity?: number;
  effectsScale?: number;
  effectsRotate?: number;
  pauseOnHover?: boolean;
  arrowSize?: number;
  arrowFill?: string;
  arrowRadius?: number;
  arrowPadding?: number;
};

const SPRING = { type: "spring", damping: 40, mass: 1.5, stiffness: 200, delay: 0 } as const;

type Size = { parent: number; children: number; item: number; viewport: number };

/**
 * Port of Framer's "Slideshow" component as configured on the site: one item at a time,
 * infinite (the slides are repeated four times and the track wraps), auto-play, side
 * arrows, and the 3D effect that tilts, shrinks and dims the slides on either side.
 */
export function Slideshow({
  children,
  startFrom = 1,
  gap = 50,
  autoPlay = true,
  interval = 2,
  drag = false,
  perspective = 2000,
  effectsOpacity = 0.25,
  effectsScale = 0.5,
  effectsRotate = 35,
  pauseOnHover = true,
  arrowSize = 40,
  arrowFill = "rgba(0, 0, 0, 0.2)",
  arrowRadius = 40,
  arrowPadding = 20,
}: Props) {
  const slides = Children.toArray(children);
  const count = slides.length;

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const firstRef = useRef<HTMLLIElement>(null);
  const lastRef = useRef<HTMLLIElement>(null);

  const [size, setSize] = useState<Size | null>(null);
  const [hovering, setHovering] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [index, setIndex] = useState(startFrom + count);

  const initialized = size !== null;
  const copies = initialized ? Math.ceil((startFrom + 1) / count) * 4 : Math.ceil((startFrom + 1) / count);

  const measure = useCallback(() => {
    const track = trackRef.current;
    const first = firstRef.current;
    const last = lastRef.current;
    if (!track || !first || !last) return;
    const start = first.offsetLeft;
    setSize({
      parent: track.offsetWidth,
      children: last.offsetLeft + last.offsetWidth - start + gap,
      item: first.offsetWidth,
      viewport: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0, track.offsetWidth),
    });
  }, [gap]);

  useLayoutEffect(() => {
    measure();
  }, [measure, count]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(track);
    return () => ro.disconnect();
  }, [measure]);

  const total = size?.children ?? 0;
  const offset = useMotionValue(total);
  const wrapped = useTransform(offset, (v) => {
    const r = wrap(-total, -total * 2, v ?? 0);
    return Number.isNaN(r) ? 0 : r;
  });

  const placed = useRef(false);
  useEffect(() => {
    if (!size) return;
    const target = -index * (size.item + gap);
    // First measurement: start on the right slide instead of spinning there.
    if (!placed.current) {
      placed.current = true;
      offset.jump(target);
      return;
    }
    if (offset.get() !== target) animate(offset, target, SPRING);
  }, [index, size, gap, offset]);

  const inView = useInView(sectionRef);
  const playing = autoPlay && !(pauseOnHover && hovering) && inView && count > 1 && !dragging && initialized;
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setIndex((i) => i + 1), interval * 1000);
    return () => clearTimeout(t);
  }, [playing, interval, index]);

  const go = (step: number) => setIndex((i) => i + step);

  // Phone: swipe through the slides.
  const panStart = useRef(0);
  const onPanStart = () => {
    setDragging(true);
    panStart.current = offset.get();
  };
  const onPan = (_: unknown, info: PanInfo) => offset.set(panStart.current + info.offset.x);
  const onPanEnd = (_: unknown, { offset: o, velocity: v }: PanInfo) => {
    setDragging(false);
    if (!size) return;
    const pages = Math.round(Math.abs(o.x) / size.item);
    const step = pages === 0 ? 1 : pages;
    if (v.x > 200) go(-step);
    else if (v.x < -200) go(step);
    else if (o.x < -size.item / 2) go(pages);
    else if (o.x > size.item / 2) go(-pages);
    else animate(offset, -index * (size.item + gap), SPRING);
  };

  const items: ReactNode[] = [];
  let counter = 0;
  for (let copy = 0; copy < copies; copy++) {
    slides.forEach((child, i) => {
      const ref = copy === 0 ? (i === 0 ? firstRef : i === count - 1 ? lastRef : undefined) : undefined;
      items.push(
        <Slide
          key={`${copy}-${i}`}
          ref={ref}
          size={size}
          gap={gap}
          wrapped={wrapped}
          counter={counter++}
          effectsOpacity={effectsOpacity}
          effectsScale={effectsScale}
          effectsRotate={effectsRotate}
        >
          {child}
        </Slide>,
      );
    });
  }

  const start = Math.max(0, Math.min(startFrom, Math.max(0, count - 1)));

  return (
    <section
      ref={sectionRef}
      className="slideshow"
      style={{ display: "flex", width: "100%", height: "100%", position: "relative", userSelect: "none", padding: 0 }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div style={{ position: "absolute", inset: 0, overflow: "visible", perspective }}>
        <motion.ul
          ref={trackRef}
          onPanStart={drag && initialized ? onPanStart : undefined}
          onPan={drag && initialized ? onPan : undefined}
          onPanEnd={drag && initialized ? onPanEnd : undefined}
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            height: "100%",
            maxWidth: "100%",
            maxHeight: "100%",
            placeItems: "center",
            margin: 0,
            padding: 0,
            listStyle: "none",
            gap,
            transformStyle: "preserve-3d",
            cursor: drag && initialized ? (dragging ? "grabbing" : "grab") : "auto",
            touchAction: drag ? "pan-y" : undefined,
            ...(initialized ? { x: wrapped } : { transform: `translateX(calc(-1 * (${start * 100}% + ${start * gap}px)))` }),
          }}
        >
          {items}
        </motion.ul>
      </div>

      <fieldset
        aria-label="Slideshow pagination controls"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pointerEvents: "none",
          border: 0,
          padding: 0,
          margin: 0,
        }}
      >
        <motion.div
          style={{
            position: "absolute",
            inset: arrowPadding,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: initialized ? 1 : 0 }}
          transition={SPRING}
        >
          {[-1, 1].map((step) => (
            <motion.button
              key={step}
              type="button"
              aria-label={step < 0 ? "Previous" : "Next"}
              onClick={() => go(step)}
              disabled={!initialized}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.15 }}
              style={{
                border: "none",
                display: "block",
                overflow: "hidden",
                padding: 0,
                margin: 0,
                cursor: "pointer",
                pointerEvents: initialized ? "auto" : "none",
                backgroundColor: arrowFill,
                width: arrowSize,
                height: arrowSize,
                borderRadius: arrowRadius,
              }}
            >
              <img
                decoding="async"
                width={arrowSize}
                height={arrowSize}
                src={step < 0 ? "/images/arrow-left.svg" : "/images/arrow-right.svg"}
                alt={step < 0 ? "Back Arrow" : "Next Arrow"}
              />
            </motion.button>
          ))}
        </motion.div>
      </fieldset>
    </section>
  );
}

type SlideProps = {
  ref?: React.Ref<HTMLLIElement>;
  size: Size | null;
  gap: number;
  wrapped: MotionValue<number>;
  counter: number;
  effectsOpacity: number;
  effectsScale: number;
  effectsRotate: number;
  children: ReactNode;
};

function Slide({ ref, size, gap, wrapped, counter, effectsOpacity, effectsScale, effectsRotate, children }: SlideProps) {
  const item = size?.item ?? 0;
  const parent = size?.parent ?? 0;
  const shift = (item + gap) * counter;
  const range = [-item, 0, parent - item + gap, parent].map((v) => v - shift);

  const rotateY = useTransform(wrapped, range, [-effectsRotate, 0, 0, effectsRotate]);
  const opacity = useTransform(wrapped, range, [effectsOpacity, 1, 1, effectsOpacity]);
  const scale = useTransform(wrapped, range, [effectsScale, 1, 1, effectsScale]);
  const originX = useTransform(wrapped, range, [1, 1, 0, 0]);
  const viewport = size?.viewport ?? 0;
  const visibility = useTransform(
    wrapped,
    [range[0] - viewport, mix(range[1], range[2], 0.5), range[3] + viewport],
    ["hidden", "visible", "hidden"],
  );

  return (
    <motion.li
      ref={ref}
      aria-hidden={undefined}
      style={{
        flexShrink: 0,
        userSelect: "none",
        width: "100%",
        height: "100%",
        position: "relative",
        zIndex: 1,
        ...(size ? { opacity, scale, originX, originY: 0.5, rotateY, visibility } : {}),
      }}
    >
      {children}
    </motion.li>
  );
}
