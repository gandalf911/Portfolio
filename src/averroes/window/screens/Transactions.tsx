import { useRef } from "react";
import { BarChart3, Filter, GitBranch, LayoutGrid, LineChart, PieChart, type LucideIcon } from "lucide-react";
import { MONTHS, TX } from "../data/fiction";
import { Card } from "../fx/Card";
import { CountUp } from "../fx/CountUp";
import { useArmed } from "../fx/useArmed";
import { useEntrance } from "../fx/useEntrance";
import { SERIES, T } from "../theme";

/* Demande › Transactions, ses trois graphes : la courbe mensuelle, l'entonnoir des
   étapes et la répartition. Libellés neutres : la vitrine ne dit pas ce qui est suivi. */

const SUBTABS: { label: string; icon: LucideIcon }[] = [
  { label: "Hub", icon: LayoutGrid },
  { label: "Transactions", icon: GitBranch },
  { label: "Analyse", icon: BarChart3 },
];

const big = { fontSize: 30, fontWeight: 600, letterSpacing: "-.02em", lineHeight: 1 } as const;

/** Deux séries en aires, tracées de gauche à droite. */
function Trend() {
  const armed = useArmed(250);
  // the axis starts under the lowest point, not at 0, so the trend reads
  const W = 600, H = 200, top = Math.max(...TX.m1) * 1.08, floor = Math.min(...TX.m2) * 0.55;
  const pts = (v: number[]) => v.map((y, i) => [(i / (v.length - 1)) * W, H - ((y - floor) / (top - floor)) * H] as const);
  const line = (v: number[]) => pts(v).map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
  const area = (v: number[]) => `${line(v)} L${W},${H} L0,${H} Z`;
  const series = [
    { key: "m1", label: "Metric 1", values: TX.m1, color: T.jadeCta },
    { key: "m2", label: "Metric 2", values: TX.m2, color: T.terracotta },
  ];
  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", gap: 26, marginTop: 10 }}>
        {series.map((s) => (
          <div key={s.key}>
            <div style={{ ...big, color: s.color }}>
              <CountUp value={s.values.reduce((a, b) => a + b, 0)} />
            </div>
            <div className="avw-label" style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} /> {s.label} · cumul 2026
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: "relative", flex: 1, minHeight: 0, marginTop: 12 }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width="100%" height="100%" style={{ position: "absolute", inset: 0, display: "block", overflow: "visible" }} aria-label="Metric 1 et Metric 2 par mois">
          <defs>
            <clipPath id="tx-reveal">
              <rect x="0" y="-10" height={H + 20} width={armed ? W : 0} style={{ transition: "width 1.4s cubic-bezier(.2,.8,.2,1)" }} />
            </clipPath>
            {series.map((s) => (
              <linearGradient key={s.key} id={`tx-fill-${s.key}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor={s.color} stopOpacity=".28" />
                <stop offset="1" stopColor={s.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke={T.border} strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
          ))}
          <g clipPath="url(#tx-reveal)">
            {series.map((s) => (
              <g key={s.key}>
                <path d={area(s.values)} fill={`url(#tx-fill-${s.key})`} />
                <path d={line(s.values)} fill="none" stroke={s.color} strokeWidth="2.2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              </g>
            ))}
          </g>
        </svg>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        {MONTHS.map((m) => (
          <span key={m} style={{ fontSize: 9, color: T.muted }}>{m}</span>
        ))}
      </div>
    </div>
  );
}

/** Entonnoir : une barre centrée par étape, le taux de passage entre deux. */
function Funnel() {
  const armed = useArmed(350);
  const max = TX.funnel[0].value;
  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", marginTop: 12 }}>
      {TX.funnel.map((s, i) => {
        const pct = (s.value / max) * 100;
        const next = TX.funnel[i + 1];
        return (
          <div key={s.label} style={{ display: "grid", gridTemplateColumns: "52px 1fr 40px 38px", alignItems: "center", gap: 10, fontSize: 11 }}>
            <span style={{ color: T.muted }}>{s.label}</span>
            <span style={{ display: "flex", justifyContent: "center", height: 20 }}>
              <span
                style={{
                  width: armed ? `${pct}%` : "0%",
                  borderRadius: 6,
                  background: SERIES[0],
                  opacity: 1 - i * 0.13,
                  transition: `width 1s cubic-bezier(.2,.8,.2,1) ${i * 110}ms`,
                }}
              />
            </span>
            <b style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{s.value.toLocaleString("fr-FR")}</b>
            <span style={{ textAlign: "right", fontSize: 9.5, color: T.muted, fontVariantNumeric: "tabular-nums" }}>
              {next ? `→ ${Math.round((next.value / s.value) * 100)} %` : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Répartition en anneau : légende à gauche, disque à droite qui remplit son cadre. */
function Mix() {
  const armed = useArmed(450);
  const total = TX.mix.reduce((a, m) => a + m.value, 0);
  const colors = [T.jadeCta, T.jade, T.terracotta, T.rose];
  const R = 40, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", gap: 14, marginTop: 8 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 128, flexShrink: 0 }}>
        {TX.mix.map((m, i) => (
          <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5 }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: colors[i], flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{m.label}</span>
            <b style={{ fontVariantNumeric: "tabular-nums" }}>{m.value} %</b>
          </div>
        ))}
      </div>
      <div style={{ position: "relative", flex: 1, height: "100%", minHeight: 0 }}>
        <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ position: "absolute", inset: 0, display: "block" }} aria-label="Répartition par catégorie">
          <g transform="rotate(-90 50 50)">
            {TX.mix.map((m, i) => {
              const len = (m.value / total) * C;
              const off = acc;
              acc += len;
              return (
                <circle
                  key={m.label}
                  cx="50"
                  cy="50"
                  r={R}
                  fill="none"
                  stroke={colors[i]}
                  strokeWidth="17"
                  strokeDasharray={`${armed ? Math.max(0, len - 1.2) : 0} ${C}`}
                  strokeDashoffset={-off}
                  style={{ transition: `stroke-dasharray .9s cubic-bezier(.2,.8,.2,1) ${i * 160}ms` }}
                />
              );
            })}
          </g>
          <text x="50" y="49" textAnchor="middle" fontSize="11" fontWeight="600" fill={T.text}>
            {TX.mix[0].value} %
          </text>
          <text x="50" y="60" textAnchor="middle" fontSize="5.5" fill={T.muted}>
            {TX.mix[0].label}
          </text>
        </svg>
      </div>
    </div>
  );
}

export function Transactions() {
  const ref = useRef<HTMLDivElement>(null);
  useEntrance(ref);
  return (
    <div ref={ref} style={{ height: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600 }}>Transactions</div>
          <div style={{ fontSize: 11, color: T.muted }}>Chaque transaction suivie de bout en bout, mois par mois.</div>
        </div>
        <div style={{ display: "flex", gap: 2, background: T.surface, borderRadius: 12, padding: 4, border: `1px solid ${T.border}` }}>
          {SUBTABS.map(({ label, icon: Icon }) => (
            <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10.5, padding: "5px 9px", borderRadius: 9, background: label === "Transactions" ? T.jadeCta : "transparent", color: label === "Transactions" ? "#fff" : T.muted, whiteSpace: "nowrap" }}>
              <Icon size={11} aria-hidden /> {label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "grid", gap: 14, gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gridTemplateRows: "minmax(0, 1.1fr) minmax(0, 1fr)", gridTemplateAreas: `"trend trend" "funnel mix"` }}>
        <Card icon={LineChart} title="Par mois" style={{ gridArea: "trend", display: "flex", flexDirection: "column" }}>
          <Trend />
        </Card>
        <Card icon={Filter} title="Entonnoir" style={{ gridArea: "funnel", display: "flex", flexDirection: "column" }}>
          <Funnel />
        </Card>
        <Card icon={PieChart} title="Répartition" style={{ gridArea: "mix", display: "flex", flexDirection: "column" }}>
          <Mix />
        </Card>
      </div>
    </div>
  );
}
