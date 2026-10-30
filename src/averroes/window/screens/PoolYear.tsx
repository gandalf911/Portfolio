import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { CalendarDays, Circle, Flower2, Info, Square, Triangle, type LucideIcon } from "lucide-react";
import { POOL_YEAR } from "../data/fiction";
import { CountUp } from "../fx/CountUp";
import { prefersReducedMotion } from "../fx/reducedMotion";
import { T } from "../theme";

/* L'année du pool, mois par mois : une rose où chaque pétale empile, du centre
   vers l'extérieur, trois séries (libellés neutres dans la vitrine). */

const S = 520;
const C = S / 2;
const R = 214;
const SERIES: { key: "intake" | "listed" | "deals"; label: string; color: string; icon: LucideIcon }[] = [
  { key: "intake", label: "Metric 1", color: "#9fd6cb", icon: Circle },
  { key: "listed", label: "Metric 2", color: T.terracotta, icon: Square },
  { key: "deals", label: "Metric 3", color: T.rose, icon: Triangle },
];
const max = Math.max(...POOL_YEAR.intake);
const radius = (v: number) => R * Math.sqrt(v / max);
const pt = (r: number, a: number) => [C + r * Math.sin(a), C - r * Math.cos(a)] as const;

function wedge(r: number, a0: number, a1: number) {
  if (r < 0.5) return "";
  const [x0, y0] = pt(r, a0), [x1, y1] = pt(r, a1);
  return `M${C},${C} L${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1} Z`;
}

export function PoolYear() {
  const [p, setP] = useState(() => (prefersReducedMotion() ? 1 : 0));
  const [month, setMonth] = useState<number | null>(null);
  const box = useRef({ p: 0 });

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const a = animate(box.current, { p: 1, duration: 1600, delay: 150, ease: "out(3)", onUpdate: () => setP(box.current.p) });
    return () => {
      a.pause();
    };
  }, []);

  const n = POOL_YEAR.months.length;
  const step = (Math.PI * 2) / n;
  const sum = (k: (typeof SERIES)[number]["key"]) => POOL_YEAR[k].reduce((a, b) => a + b, 0);
  const done = POOL_YEAR.intake.filter((v) => v > 0).length;

  return (
    <div className="avw-card" style={{ height: "100%", padding: "14px 18px", display: "flex", flexDirection: "column" }}>
      <div className="avw-card-h" style={{ flexShrink: 0 }}>
        <Flower2 size={16} color={T.jadeCta} aria-hidden /> L'année 2026 du pool, mois par mois <Info size={12} color={T.muted} aria-hidden />
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 500, background: T.jadeCta, color: "#fff", borderRadius: 999, padding: "5px 12px" }}>
          <CalendarDays size={12} aria-hidden /> Au fil des mois
        </span>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 24 }}>
        <div style={{ width: 360, flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
          <div className="avw-label">{month === null ? "Cumul 2026" : `${POOL_YEAR.months[month]} 2026`}</div>
          {SERIES.map((s) => (
            <div key={s.key} style={{ display: "grid", gridTemplateColumns: "14px 18px 1fr auto", alignItems: "center", gap: 10, fontSize: 15 }}>
              <span style={{ width: 14, height: 14, borderRadius: 4, background: s.color }} />
              <s.icon size={17} color={T.muted} aria-hidden />
              <span>{s.label}</span>
              <b style={{ fontVariantNumeric: "tabular-nums" }}>{month === null ? <CountUp value={sum(s.key)} /> : POOL_YEAR[s.key][month]}</b>
            </div>
          ))}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, marginTop: 6 }}>
            <Ratio label="Metric 2 / Metric 1" value={Math.round(((month === null ? sum("listed") : POOL_YEAR.listed[month]) / (month === null ? sum("intake") : POOL_YEAR.intake[month])) * 100)} />
            <Ratio label="Metric 3 / Metric 2" value={Math.round(((month === null ? sum("deals") : POOL_YEAR.deals[month]) / (month === null ? sum("listed") : POOL_YEAR.listed[month])) * 100)} />
          </div>
          <div style={{ fontSize: 11, color: T.muted }}>{month === null ? `${done} mois écoulés · survolez un mois pour son détail` : "Mois survolé"}</div>
        </div>

        <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
          <svg viewBox={`0 0 ${S} ${S}`} width="100%" height="100%" style={{ position: "absolute", inset: 0, display: "block", overflow: "visible" }} aria-label="Année du pool, mois par mois" onMouseLeave={() => setMonth(null)}>
            {[50, 100, 200].map((g) => (
              <g key={g}>
                <circle cx={C} cy={C} r={radius(g)} fill="none" stroke={T.border} strokeDasharray="3 4" />
                <text x={C + 4} y={C - radius(g) + 11} fontSize="9.5" fontWeight="600" fill={T.muted}>{g}</text>
              </g>
            ))}
            {POOL_YEAR.months.map((m, i) => {
              const [x, y] = pt(R + 12, i * step);
              return <line key={m} x1={C} y1={C} x2={x} y2={y} stroke={T.border} />;
            })}
            {POOL_YEAR.months.map((m, i) => {
              const k = Math.max(0, Math.min(1, p * 1.5 - (i / n) * 0.5));
              const a0 = i * step + 0.02, a1 = (i + 1) * step - 0.02;
              const lit = month === null || month === i;
              return (
                <g key={m} opacity={lit ? 1 : 0.28} style={{ transition: "opacity .25s" }} onMouseEnter={() => setMonth(i)}>
                  <path d={wedge(R + 12, a0, a1)} fill="transparent" />
                  {SERIES.map((s) => (
                    <path key={s.key} d={wedge(radius(POOL_YEAR[s.key][i]) * k, a0, a1)} fill={s.color} stroke={T.surface} strokeWidth={1.5} />
                  ))}
                </g>
              );
            })}
            {POOL_YEAR.months.map((m, i) => {
              const [x, y] = pt(R + 30, (i + 0.5) * step);
              const future = POOL_YEAR.intake[i] === 0;
              return (
                <text key={m} x={x} y={y + 4} textAnchor="middle" fontSize="12" fontWeight={month === i ? 700 : 400} fill={future ? "rgb(var(--ink) / .3)" : T.muted}>
                  {m}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}

function Ratio({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: T.jadeSoft, borderRadius: 12, padding: "9px 12px" }}>
      <b style={{ fontSize: 22, color: T.jadeInk, letterSpacing: "-.02em" }}>{value} %</b>
      <div style={{ fontSize: 10.5, color: T.muted, marginTop: 1 }}>{label}</div>
    </div>
  );
}
