import { motion } from "motion/react";

/**
 * Framer text effect "Appear", per word, on mount: each word comes in from
 * blur(10px), opacity 0 and 10 px lower, as a spring (0.8 s, no bounce), 0.05 s apart.
 */
export function WordAppear({ text, className, disabled }: { text: string; className?: string; disabled?: boolean }) {
  if (disabled) return <h1 className={className}>{text}</h1>;
  const words = text.split(" ");
  return (
    <h1 className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden>
          <motion.span
            style={{ display: "inline-block", willChange: "transform, filter, opacity" }}
            initial={{ opacity: 0.001, filter: "blur(10px)", y: 10 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.8, delay: i * 0.05, restDelta: 0.001 }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </h1>
  );
}
