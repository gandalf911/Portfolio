import { useEffect, useState } from "react";
import { ArrowLeftRight, GraduationCap, LayoutGrid, Receipt, Trophy, type LucideIcon } from "lucide-react";
import { useInView } from "../useInView";

const MODULES: { label: string; icon: LucideIcon }[] = [
  { label: "Subscription billing", icon: Receipt },
  { label: "Transactions", icon: ArrowLeftRight },
  { label: "ACC sections", icon: Trophy },
  { label: "Catalogue", icon: LayoutGrid },
  { label: "Promo & formations", icon: GraduationCap },
];

/** Les cinq modules s'allument tour à tour autour du logo. */
export function ProductModules() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [on, setOn] = useState(0);
  useEffect(() => {
    if (!inView || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setOn((k) => (k + 1) % MODULES.length), 1400);
    return () => window.clearInterval(t);
  }, [inView]);
  return (
    <div ref={ref} className="vis vis-modules">
      <div className="hub-dot">31<small>screens</small></div>
      {MODULES.map(({ label, icon: Icon }, i) => {
        const a = (i / MODULES.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <span
            key={label}
            className="mod"
            data-on={i === on || undefined}
            style={{ left: `calc(50% + ${Math.cos(a) * 31}%)`, top: `calc(50% + ${Math.sin(a) * 36}%)` }}
          >
            <Icon size={14} aria-hidden /> {label}
          </span>
        );
      })}
      <svg className="mod-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {MODULES.map((m, i) => {
          const a = (i / MODULES.length) * Math.PI * 2 - Math.PI / 2;
          return <line key={m.label} x1="50" y1="50" x2={50 + Math.cos(a) * 31} y2={50 + Math.sin(a) * 36} data-on={i === on || undefined} />;
        })}
      </svg>
    </div>
  );
}
