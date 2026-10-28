import { motion } from "motion/react";
import { useState } from "react";
import { EASE, Reveal } from "./Reveal";
import "./Faq.css";

const TRANSITION = { duration: 0.5, ease: EASE };

/** "Faq single": a question that opens and closes on click (each item on its own). */
function FaqItem({ q, a, defaultOpen, padding }: { q: string; a: string; defaultOpen: boolean; padding: number }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className={`faq-item bordered${open ? " is-open" : ""}`}
      style={{ padding }}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      onClick={() => setOpen((o) => !o)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen((o) => !o)}
    >
      <motion.div className="faq-item__icon" initial={false} animate={{ rotate: open ? 180 : 0 }} transition={TRANSITION}>
        <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden>
          <path
            d="M 4.18 8.211 C 4.432 7.942 4.854 7.928 5.123 8.18 L 10 12.753 L 14.877 8.18 C 15.146 7.928 15.568 7.942 15.82 8.211 C 16.072 8.479 16.058 8.901 15.789 9.153 L 10.456 14.153 C 10.2 14.393 9.8 14.393 9.544 14.153 L 4.211 9.153 C 3.942 8.901 3.929 8.479 4.18 8.211 Z"
            fill="var(--primary)"
          />
        </svg>
      </motion.div>
      <div className="faq-item__text">
        <div className="faq-item__question">
          <h3 className="t-h5">{q}</h3>
        </div>
        <motion.div
          className="faq-item__answer"
          initial={false}
          animate={{ height: open ? "auto" : 1, opacity: open ? 1 : 0 }}
          transition={TRANSITION}
        >
          <p className="t-body-lg">{a}</p>
        </motion.div>
      </div>
    </div>
  );
}

/** "FAQ's box": the five questions, the first one open. Each slides up as it appears. */
export function FaqList({ items, phone }: { items: { q: string; a: string }[]; phone: boolean }) {
  return (
    <div className="faq-list">
      {items.map((it, i) => (
        <Reveal key={it.q} from={{ opacity: 0, y: 30 }} transition={TRANSITION} disabled={phone} className="faq-list__item">
          <FaqItem q={it.q} a={it.a} defaultOpen={i === 0} padding={i === 0 && phone ? 20 : 30} />
        </Reveal>
      ))}
    </div>
  );
}
