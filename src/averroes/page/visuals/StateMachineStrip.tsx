import { useEffect, useState } from "react";
import { useInView } from "../useInView";

const STAGES = ["Recruitment", "Payment", "KYC", "Contract", "Accounts", "E-learning", "Activation", "Retention", "Offboarding"];

/** Le cycle de vie du conseiller : un jeton parcourt les étapes, comme un dossier dans le vrai flux. */
export function StateMachineStrip() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [at, setAt] = useState(0);
  useEffect(() => {
    if (!inView || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setAt((k) => (k + 1) % STAGES.length), 900);
    return () => window.clearInterval(t);
  }, [inView]);
  return (
    <div ref={ref} className="vis vis-states">
      <ol>
        {STAGES.map((s, i) => (
          <li key={s} data-state={i < at ? "done" : i === at ? "now" : undefined}>
            <span className="st-dot" />
            <span className="st-label">{s}</span>
            {i === at && <span className="st-badge">n8n</span>}
          </li>
        ))}
      </ol>
      <div className="st-foot">
        <span><b>29</b> workflows</span>
        <span><b>~280</b> steps in the lifecycle</span>
      </div>
    </div>
  );
}
