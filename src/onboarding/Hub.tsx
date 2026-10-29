import { useEffect, useRef, useState } from "react";
import { Building2, FileSignature, Hash, ShieldCheck, Video, type LucideIcon } from "lucide-react";
import { SYSTEMS, type SystemId } from "./data";

/* n8n au centre, les outils qu'il pilote en orbite ; les rayons s'allument un à un. */

const ICONS: Partial<Record<SystemId, LucideIcon>> = { zoom: Video, slack: Hash, portal: ShieldCheck, platform: Building2, esign: FileSignature };
const ORBIT = SYSTEMS.filter((s) => s.id !== "n8n");

export const WORKFLOWS = [
  { name: "Lifecycle launcher", nodes: 314, role: "Payment, documents, KYC, contract, accounts, activation, plus every profile change" },
  { name: "Offboarding", nodes: 197, role: "Exit pipeline, reassignment, termination, access removal, exit survey" },
  { name: "E-learning", nodes: 181, role: "Module completions, unlocks, live sessions, starter kit" },
  { name: "Document portal", nodes: 148, role: "Secure upload, OCR, files attached to the CRM" },
  { name: "Retention", nodes: 55, role: "Day 1 and day 2 follow-ups, survey scoring, manager tasks" },
];

export function Hub() {
  const ref = useRef<HTMLDivElement>(null);
  const [lit, setLit] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return setLit(ORBIT.length);
      let k = 0;
      const t = window.setInterval(() => {
        k += 1;
        setLit(k);
        if (k >= ORBIT.length) window.clearInterval(t);
      }, 160);
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const pos = (i: number) => {
    const a = (i / ORBIT.length) * Math.PI * 2 - Math.PI / 2;
    return { x: 50 + Math.cos(a) * 39, y: 50 + Math.sin(a) * 38 };
  };

  return (
    <div ref={ref} className="ob-hub">
      <svg className="ob-hub-spokes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {ORBIT.map((s, i) => {
          const p = pos(i);
          return <line key={s.id} x1="50" y1="50" x2={p.x} y2={p.y} data-on={i < lit || undefined} pathLength={1} />;
        })}
      </svg>
      <div className="ob-hub-core" data-on={lit >= ORBIT.length || undefined}>
        <img src="/images/stack-n8n.svg" alt="n8n" />
      </div>
      {ORBIT.map((s, i) => {
        const p = pos(i);
        const Icon = ICONS[s.id];
        return (
          <div key={s.id} className="ob-hub-tile" data-on={i < lit || undefined} style={{ left: `${p.x}%`, top: `${p.y}%` }}>
            <span className="ob-hub-box">{s.logo ? <img src={s.logo} alt="" /> : Icon ? <Icon size={20} aria-hidden /> : null}</span>
            <span className="ob-hub-label">{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function WorkflowInventory() {
  const max = WORKFLOWS[0].nodes;
  const total = WORKFLOWS.reduce((a, w) => a + w.nodes, 0);
  return (
    <div className="ob-inv">
      <div className="ob-inv-head">
        <span className="serif">{total}</span> nodes across five workflows
      </div>
      {WORKFLOWS.map((w, i) => (
        <div key={w.name} className="ob-inv-row" style={{ ["--w" as string]: `${(w.nodes / max) * 100}%`, animationDelay: `${i * 90}ms` }}>
          <div className="ob-inv-top">
            <b>{w.name}</b>
            <span>{w.nodes} nodes</span>
          </div>
          <div className="ob-inv-bar">
            <i />
          </div>
          <p>{w.role}</p>
        </div>
      ))}
    </div>
  );
}
