import { motion } from "motion/react";
import { useEffect, useState } from "react";
import "./CopyButton.css";

const SPRING = { type: "spring", stiffness: 500, damping: 60, mass: 1 } as const;

/**
 * "Copy Button": copies the address on click, swaps the copy icon for a check and the
 * address for "Copied", then returns to rest after 3 s.
 */
export function CopyButton({ email, phone }: { email: string; phone?: boolean }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 3000);
    return () => clearTimeout(t);
  }, [copied]);

  const onClick = () => {
    if (copied) return;
    navigator.clipboard?.writeText(email).catch(() => {});
    setCopied(true);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={`copy-btn${phone ? " copy-btn--phone" : ""}${copied ? " is-copied" : ""}`}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
    >
      <div className="copy-btn__container">
        <div className="copy-btn__text">
          <motion.p className="copy-btn__email" animate={{ opacity: copied ? 0 : 1 }} transition={SPRING}>
            {email}
          </motion.p>
          <motion.p
            layout="position"
            className="copy-btn__copied"
            initial={false}
            animate={{ opacity: copied ? 1 : 0 }}
            transition={SPRING}
          >
            Copied
          </motion.p>
        </div>
        <div className="copy-btn__icon">
          {copied ? (
            <svg viewBox="0 0 21 21" width="21" height="21" aria-hidden>
              <path
                d="M 17.719 5.907 L 8.531 15.093 L 3.939 10.5"
                fill="transparent"
                strokeWidth="1.35"
                stroke="rgb(24,24,27)"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="19" height="19" viewBox="0 0 19 19" fill="none" aria-hidden>
              <path
                d="M12.4065 12.4061H15.8943V3.10547H6.5936V6.59322"
                stroke="black"
                strokeWidth="0.86792"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.4062 6.59375H3.1055V15.8944H12.4062V6.59375Z"
                stroke="black"
                strokeWidth="0.86792"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
