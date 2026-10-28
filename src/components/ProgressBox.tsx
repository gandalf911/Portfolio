import { useEffect, useRef, useState } from "react";

/**
 * The site's count-up code component: once half visible, it adds 1 every
 * (speed × 1000 / end) ms until it reaches `end`. Like the original, it counts in whole
 * numbers, so 99.9 ends on 100.
 */
function Counter({ end, speed, size, suffix }: { end: number; speed: number; size: number; suffix: string }) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setStarted(true);
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => {
      if (value < end) setValue((v) => v + 1);
      else clearInterval(id);
    }, (speed * 1000) / end);
    return () => clearInterval(id);
  }, [value, end, speed, started]);

  return (
    <span ref={ref} style={{ fontSize: `${size}px`, fontWeight: 500, color: "var(--primary)", fontFamily: "Instrument Serif" }}>
      {value + suffix}
    </span>
  );
}

/** "Progress box": a counter with its caption. */
export function ProgressBox({ end, suffix, label, size }: { end: number; suffix: string; label: string; size: number }) {
  return (
    <div className="progress-box">
      <div className="progress-box__counter">
        <Counter end={end} speed={3} size={size} suffix={suffix} />
      </div>
      <p className="t-body-lg ta-center progress-box__label">{label}</p>
    </div>
  );
}
