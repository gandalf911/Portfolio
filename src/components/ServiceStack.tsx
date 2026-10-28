import { motion, transform, useMotionValue } from "motion/react";
import { useEffect, useRef, type RefObject } from "react";
import type { Service } from "../content";
import type { Breakpoint } from "../lib/breakpoint";
import "./ServiceStack.css";

/** "Service card": text on the left, picture on the right (stacked on phone). */
function ServiceCard({ service, bp }: { service: Service; bp: Breakpoint }) {
  const text = bp === "phone" && service.phoneText ? service.phoneText : service.text;
  return (
    <div className={`service-card service-card--${bp} bordered`}>
      <div className="service-card__container">
        <div className="service-card__left">
          <div className="service-card__top">
            <h3 className="t-h4 service-card__title">{service.title}</h3>
            <div className="service-card__line" />
          </div>
          <p className="t-body-lg service-card__body">{text}</p>
        </div>
        <div className="service-card__image">
          <img src={service.image} alt={service.alt} />
        </div>
      </div>
    </div>
  );
}

type Target = { opacity: number; scale: number; x: number; y: number };
const BASE: Target = { opacity: 1, scale: 1, x: 0, y: 0 };
const STEPS: Target[] = [
  { opacity: 1, scale: 0.9, x: 0, y: -50 },
  { opacity: 1, scale: 0.8, x: 0, y: -100 },
  { opacity: 1, scale: 0.7, x: 0, y: -150 },
];
const KEYS = ["opacity", "scale", "x", "y"] as const;

/** Distance from the top of the document, through the offsetParent chain (as Framer measures it). */
function documentTop(el: HTMLElement) {
  let top = 0;
  let node: Element | null = el;
  while (node && node !== document.documentElement && node instanceof HTMLElement) {
    top += node.offsetTop;
    node = node.offsetParent;
  }
  return top;
}

/**
 * Framer "Scroll Transform → Scroll Target": while each later card scrolls in (its top
 * passing the bottom of the viewport, over its own height), the card behind it steps to
 * the next target — 90 %, 80 %, 70 % and 50 px higher each time.
 *
 * On the site, the 4th target of cards 1–3 points at a layer that does not exist, so the
 * last card never shrinks and the second-to-last only shrinks once: kept as published.
 */
function useStackTransform(own: number, refs: RefObject<HTMLDivElement | null>[], enabled: boolean) {
  const values = {
    opacity: useMotionValue(1),
    scale: useMotionValue(1),
    x: useMotionValue(0),
    y: useMotionValue(0),
  };

  useEffect(() => {
    if (!enabled) {
      KEYS.forEach((k) => values[k].set(BASE[k]));
      return;
    }
    // Targets: rest, then one per later card (only cards 2→4 exist as targets).
    const targets: { ref?: RefObject<HTMLDivElement | null>; target: Target }[] = [{ target: BASE }];
    for (let step = 0; step < 3; step++) {
      const ref = refs[own + 1 + step];
      targets.push({ ref, target: STEPS[step] });
    }

    const update = () => {
      const vh = window.innerHeight;
      const input: number[] = [];
      const output: Record<(typeof KEYS)[number], number[]> = { opacity: [], scale: [], x: [], y: [] };
      const starts: number[] = [];
      for (let a = targets.length; a >= 0; a--) {
        const el = targets[a]?.ref?.current;
        if (!el) continue;
        const c = documentTop(el) - 1 - vh;
        const l = el.clientHeight;
        const prev = starts[starts.length - 1];
        const end = Math.max(c + l, 0);
        starts.push(c);
        input.unshift(Math.max(c, 0), prev === undefined ? end : Math.min(end, Math.max(prev - 1, 0)));
        const from = targets[a - 1].target;
        const to = targets[a].target;
        KEYS.forEach((k) => output[k].unshift(from[k], to[k]));
      }
      if (input.length === 0) return;
      const y = window.scrollY;
      KEYS.forEach((k) => values[k].set(transform(y, input, output[k])));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [enabled, own]);

  return values;
}

function StackItem({
  index,
  refs,
  service,
  bp,
}: {
  index: number;
  refs: RefObject<HTMLDivElement | null>[];
  service: Service;
  bp: Breakpoint;
}) {
  const { opacity, scale, x, y } = useStackTransform(index, refs, bp !== "phone");
  return (
    <motion.div ref={refs[index]} id={service.id} className="service-stack__item" style={{ opacity, scale, x, y }}>
      <ServiceCard service={service} bp={bp} />
    </motion.div>
  );
}

export function ServiceStack({ services, bp }: { services: Service[]; bp: Breakpoint }) {
  const r0 = useRef<HTMLDivElement>(null);
  const r1 = useRef<HTMLDivElement>(null);
  const r2 = useRef<HTMLDivElement>(null);
  const r3 = useRef<HTMLDivElement>(null);
  const refs = [r0, r1, r2, r3];
  return (
    <div className="service-stack">
      {services.map((s, i) => (
        <StackItem key={s.title} index={i} refs={refs} service={s} bp={bp} />
      ))}
    </div>
  );
}
