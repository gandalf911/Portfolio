import { motion, type Transition } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

export const EASE: [number, number, number, number] = [0.44, 0, 0.56, 1];
export const LINEAR: [number, number, number, number] = [0, 0, 1, 1];

export type From = { opacity?: number; x?: number; y?: number; scale?: number };

/**
 * Framer's "Appear" scroll effect: the layer starts from `from` and animates to its
 * resting state the first time any part of it enters the viewport.
 * `disabled` renders the resting state directly (Framer turns some effects off on phone).
 */
export function Reveal({
  from,
  transition,
  disabled,
  className,
  style,
  children,
  as = "div",
  id,
}: {
  from: From;
  transition: Transition;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  as?: "div" | "p" | "section";
  id?: string;
}) {
  if (disabled) {
    const Tag = as;
    return (
      <Tag id={id} className={className} style={style}>
        {children}
      </Tag>
    );
  }
  const M = motion[as];
  const to = { opacity: 1, x: 0, y: 0, scale: 1 };
  return (
    <M
      id={id}
      className={className}
      style={style}
      initial={{ ...to, ...from }}
      whileInView={to}
      viewport={{ once: true, amount: 0 }}
      transition={transition}
    >
      {children}
    </M>
  );
}
