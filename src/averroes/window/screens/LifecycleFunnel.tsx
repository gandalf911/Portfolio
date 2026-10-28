import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { Filter, Layers } from "lucide-react";
import { LIFECYCLE } from "../data/fiction";
import { CountUp, formatFr } from "../fx/CountUp";
import { prefersReducedMotion } from "../fx/reducedMotion";
import { T } from "../theme";

/* Cycle de vie du bien : la répartition actuelle du parc par statut, en ruban
   continu dont l'épaisseur suit l'effectif de chaque étape. */

const W = 1120;
const H = 452;
const X0 = 205;
const X1 = 1085;
const CY = 222;
const MAX_H = 128;
const INK = "#4fd6bd";
const CREAM = "rgba(254,239,224,";

const total = LIFECYCLE.reduce((a, s) => a + s.value, 0);
const max = Math.max(...LIFECYCLE.map((s) => s.value));
const step = (X1 - X0) / (LIFECYCLE.length - 1);
const xOf = (i: number) => X0 + i * step;
const pct = (v: number) => (v / total) * 100;
const pctLabel = (v: number) => `${formatFr(pct(v), 1)} %`;
/** Cumul « cette étape ou au-delà » : ce que l'étape a vu passer, ou plus loin. */
const cumulative = LIFECYCLE.map((_, i) => LIFECYCLE.slice(i).reduce((a, s) => a + s.value, 0));

function wrap(label: string): string[] {
  if (label.length <= 10 || !label.includes(" ")) return [label];
  const cut = label.indexOf(" ", 4) > 0 ? label.indexOf(" ", 4) : label.lastIndexOf(" ");
  return [label.slice(0, cut), label.slice(cut + 1)];
}

export function LifecycleFunnel() {
  const [grow, setGrow] = useState(() => (prefersReducedMotion() ? 1 : 0));
  const [hover, setHover] = useState<number | null>(null);
  const box = useRef({ g: 0 });

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const a = animate(box.current, { g: 1, duration: 1700, delay: 150, ease: "out(3)", onUpdate: () => setGrow(box.current.g) });
    return () => {
      a.pause();
    };
  }, []);

  const n = LIFECYCLE.length;
  const half = LIFECYCLE.map((s, i) => {
    const k = Math.max(0, Math.min(1, grow * 1.6 - (i / n) * 0.6));
    return Math.max(2.5, (s.value / max) * MAX_H) * k;
  });

  return (
    <div
      style={{
        height: "100%", borderRadius: 18, overflow: "hidden", padding: "14px 18px 6px", color: T.elevated,
        background: `radial-gradient(90% 70% at 50% 30%, #234a45 0%, ${T.sapin} 60%, ${T.sapinDeep} 100%)`,
        display: "flex", flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <span style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(79,214,189,.14)", color: INK, display: "grid", placeItems: "center" }}>
          <Filter size={14} aria-hidden />
        </span>
        <span style={{ fontSize: 14, fontWeight: 600 }}>Cycle de vie du bien · funnel</span>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: `${CREAM}.62)` }}>
          <Layers size={12} aria-hidden /> Répartition actuelle des {formatFr(total)} biens par statut (état courant)
        </span>
      </div>

      <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ display: "block" }} aria-label="Cycle de vie du bien" onMouseLeave={() => setHover(null)}>
          <defs>
            {LIFECYCLE.slice(0, -1).map((_, i) => (
              <linearGradient key={i} id={`avw-lc-${i}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor={INK} stopOpacity={i % 2 ? 0.55 : 0.88} />
                <stop offset="1" stopColor={INK} stopOpacity={i % 2 ? 0.88 : 0.5} />
              </linearGradient>
            ))}
          </defs>

          {/* total du parc */}
          <text x={18} y={CY + 4} fontSize="40" fontWeight="700" fill={T.elevated} letterSpacing="-1">
            {formatFr(Math.round(total * Math.min(1, grow * 1.2)))}
          </text>
          <text x={20} y={CY + 30} fontSize="13" fill={`${CREAM}.6)`}>Total parc</text>

          {LIFECYCLE.map((s, i) => (
            <g key={s.label}>
              {hover === i && <rect x={xOf(i) - step / 2} y={64} width={step} height={330} rx={10} fill="rgba(254,239,224,.06)" />}
              <line x1={xOf(i)} x2={xOf(i)} y1={78} y2={372} stroke="rgba(254,239,224,.08)" />
              {wrap(s.label).map((line, k) => (
                <text key={k} x={xOf(i)} y={48 + k * 15} textAnchor="middle" fontSize="12" fill={hover === i ? T.elevated : `${CREAM}.62)`}>
                  {line}
                </text>
              ))}
              <text x={xOf(i)} y={404} textAnchor="middle" fontSize="13.5" fontWeight="700" fill={T.elevated}>
                {pctLabel(s.value)}
              </text>
              <text x={xOf(i)} y={423} textAnchor="middle" fontSize="11" fill={`${CREAM}.55)`}>
                {formatFr(s.value)}
              </text>
            </g>
          ))}

          {/* le ruban, segment par segment */}
          {LIFECYCLE.slice(0, -1).map((_, i) => {
            const a = xOf(i), b = xOf(i + 1), ha = half[i], hb = half[i + 1];
            return (
              <polygon
                key={i}
                points={`${a},${CY - ha} ${b},${CY - hb} ${b},${CY + hb} ${a},${CY + ha}`}
                fill={`url(#avw-lc-${i})`}
                stroke={INK}
                strokeOpacity={0.25}
                strokeWidth={0.6}
              />
            );
          })}

          {/* zones de survol, une par étape */}
          {LIFECYCLE.map((s, i) => (
            <rect key={s.label} x={xOf(i) - step / 2} y={30} width={step} height={400} fill="transparent" onMouseEnter={() => setHover(i)} style={{ cursor: "default" }} />
          ))}
        </svg>

        {hover !== null && (
          <div
            style={{
              position: "absolute", top: 70, left: `${(xOf(hover) / W) * 100}%`,
              transform: hover > n - 4 ? "translateX(-100%)" : "translateX(12px)",
              marginLeft: hover > n - 4 ? -12 : 0,
              background: "rgba(20,40,38,.94)", border: "1px solid rgba(132,201,189,.25)", borderRadius: 12,
              padding: "10px 14px", fontSize: 12, lineHeight: 1.6, whiteSpace: "nowrap", pointerEvents: "none",
              boxShadow: "0 12px 30px rgba(0,0,0,.35)",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 2 }}>{LIFECYCLE[hover].label}</div>
            <div style={{ color: `${CREAM}.75)` }}>
              Actuellement : <b style={{ color: T.elevated }}>{formatFr(LIFECYCLE[hover].value)}</b> ({pctLabel(LIFECYCLE[hover].value)})
            </div>
            <div style={{ color: `${CREAM}.75)` }}>
              Cumulé (cette étape ou au-delà) : <b style={{ color: INK }}>{formatFr(cumulative[hover])}</b>
            </div>
          </div>
        )}
      </div>

      <div style={{ flexShrink: 0, display: "flex", gap: 18, fontSize: 10.5, color: `${CREAM}.55)`, padding: "2px 2px 6px" }}>
        <span>
          Publiés aujourd'hui : <b style={{ color: T.elevated }}><CountUp value={LIFECYCLE[6].value} /></b>
        </span>
        <span>
          Vendus (plateforme et hors PF) : <b style={{ color: T.elevated }}><CountUp value={LIFECYCLE[8].value + LIFECYCLE[9].value} /></b>
        </span>
        <span style={{ marginLeft: "auto" }}>Survolez une étape pour son cumul</span>
      </div>
    </div>
  );
}
