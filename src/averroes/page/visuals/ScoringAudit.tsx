import { useEffect, useState } from "react";
import { useInView } from "../useInView";

// Distribution des scores : avant (écrasée sous 2) et après réglage (étalée).
const BEFORE = [0, 1, 2, 48, 96, 30, 6, 2, 1, 0, 0, 0];
const AFTER = [4, 9, 16, 24, 30, 33, 29, 22, 15, 9, 5, 2];

const FLAWS = [
  "Missing data scored as poor performance",
  "Single-track advisors dragged by an empty second track",
  "Only 17 of 89 computed indicators published",
];

export function ScoringAudit() {
  const { ref, live } = useInView<HTMLDivElement>();
  const [after, setAfter] = useState(false);
  useEffect(() => {
    if (!live || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setAfter((v) => !v), 2600);
    return () => window.clearInterval(t);
  }, [live]);
  const data = after ? AFTER : BEFORE;
  const max = 96;
  return (
    <div ref={ref} className="vis vis-audit">
      <div className="audit-head">
        <span className="audit-size">2,063 lines</span>
        <span>advisor scoring model, audited</span>
      </div>
      <div className="audit-switch">
        <span data-on={!after || undefined}>Published model</span>
        <span data-on={after || undefined}>After my tuning layer</span>
      </div>
      <div className="audit-hist">
        {data.map((v, i) => (
          <i key={i} style={{ height: `${Math.max(1.5, (v / max) * 100)}%`, background: after ? "#1bbfa0" : "#ec6048" }} />
        ))}
      </div>
      <div className="audit-axis"><span>score 1</span><span>score 5</span></div>
      <p className="audit-note">{after ? "Scores spread out: differences become readable." : "Half the network within 0.06 points."}</p>
      <ul>
        {FLAWS.map((f, i) => (
          <li key={f} className="flaw"><b>{i + 1}</b>{f}</li>
        ))}
      </ul>
    </div>
  );
}
