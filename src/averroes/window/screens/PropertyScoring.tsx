import { useState } from "react";
import {
  Building2, ChevronDown, CircleDashed, Compass, FileSignature, Gauge, Handshake, Info, Layers, MapPin, Map as MapIcon, Sparkles, Target, UsersRound, Wrench,
  type LucideIcon,
} from "lucide-react";
import { PROPERTY_SCORES } from "../data/fiction";
import { CountUp, formatFr } from "../fx/CountUp";
import { useArmed } from "../fx/useArmed";
import { T } from "../theme";

/* Scoring des biens publiés : attractivité (qualité du bien) × priorité
   (intérêt commercial). Les deux médianes coupent le nuage en quatre. */

type Quad = "engine" | "blind" | "rework" | "radar";

const QUADS: Record<Quad, { label: string; text: string; color: string; icon: LucideIcon }> = {
  engine: { label: "Moteurs", text: "Attractif ET prioritaire : la cible.", color: T.jadeCta, icon: Target },
  blind: { label: "Angle mort", text: "Attractif mais peu prioritaire : sous-exploité.", color: T.terracotta, icon: Compass },
  rework: { label: "À retravailler", text: "Prioritaire mais peu attractif : photos, prix.", color: T.rose, icon: Wrench },
  radar: { label: "Hors radar", text: "Ni l'un ni l'autre : à requalifier.", color: T.jade, icon: CircleDashed },
};

const FILTERS: { label: string; icon: LucideIcon }[] = [
  { label: "ACC", icon: UsersRound },
  { label: "Ville", icon: MapPin },
  { label: "Quartier", icon: MapIcon },
  { label: "Cluster", icon: Layers },
  { label: "Catégorie", icon: Building2 },
  { label: "Transaction", icon: Handshake },
  { label: "Mandat", icon: FileSignature },
];

const W = 1120;
const H = 352;
const PAD = { l: 46, r: 18, t: 14, b: 40 };
const xs = (v: number) => PAD.l + (v / 100) * (W - PAD.l - PAD.r);
const ys = (v: number) => PAD.t + (1 - v / 80) * (H - PAD.t - PAD.b);
const maxN = Math.max(...PROPERTY_SCORES.bins.map((b) => b.n));

export function PropertyScoring() {
  const armed = useArmed(150);
  const [focus, setFocus] = useState<Quad | null>(null);
  const [hover, setHover] = useState<{ x: number; y: number; n: number } | null>(null);
  const { total, medianX, medianY, counts, bins, quad } = PROPERTY_SCORES;
  const share = (q: Quad) => Math.round((counts[q] / total) * 100);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "nowrap", flexShrink: 0 }}>
        {FILTERS.map(({ label, icon: Icon }) => (
          <span
            key={label}
            style={{
              display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T.muted, background: T.surface,
              border: `1px solid ${T.border}`, borderRadius: 9, padding: "5px 10px", whiteSpace: "nowrap",
            }}
          >
            <Icon size={12} aria-hidden /> {label} <b style={{ color: T.text, fontWeight: 600 }}>Tous</b> <ChevronDown size={10} aria-hidden />
          </span>
        ))}
      </div>

      <div className="avw-card" style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 24, padding: "9px 16px", fontSize: 11.5 }}>
        <Kpi icon={Building2} value={total} label="biens publiés" />
        <Kpi icon={Target} value={share("engine")} suffix=" %" label="moteurs" color={T.jadeCta} />
        <Kpi icon={Compass} value={share("blind")} suffix=" %" label="angle mort" color={T.terracotta} />
        <Kpi icon={Wrench} value={share("rework")} suffix=" %" label="à retravailler" color={T.rose} />
        <Kpi icon={Sparkles} value={medianX} decimals={1} label="attractivité médiane" />
        <Kpi icon={Gauge} value={medianY} label="priorité médiane" />
      </div>

      <div className="avw-card" style={{ flex: 1, minHeight: 0, padding: "8px 10px 4px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 600, padding: "2px 6px 0" }}>
          <Gauge size={14} color={T.jadeCta} aria-hidden /> Scoring des biens : attractivité × priorité <Info size={12} color={T.muted} aria-hidden />
          <span style={{ marginLeft: "auto", fontSize: 10.5, fontWeight: 400, color: T.muted, minHeight: 14 }}>
            {hover ? (
              <>
                <b style={{ color: T.text }}>{hover.n}</b> biens · attractivité ≈ {formatFr(hover.x, 0)} · priorité {hover.y}
              </>
            ) : (
              "En bas à droite : attractif mais peu prioritaire"
            )}
          </span>
        </div>
        <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ position: "absolute", inset: 0, display: "block" }} aria-label="Attractivité et priorité des biens publiés" onMouseLeave={() => setHover(null)}>
            {[0, 20, 40, 60, 80].map((g) => (
              <g key={`y${g}`}>
                <line x1={PAD.l} x2={W - PAD.r} y1={ys(g)} y2={ys(g)} stroke={T.border} strokeDasharray="3 5" />
                <text x={PAD.l - 10} y={ys(g) + 3.5} fontSize="10.5" fill={T.muted} textAnchor="end">{g}</text>
              </g>
            ))}
            {[0, 20, 40, 60, 80, 100].map((g) => (
              <g key={`x${g}`}>
                <line x1={xs(g)} x2={xs(g)} y1={PAD.t} y2={H - PAD.b} stroke={T.border} strokeDasharray="3 5" />
                <text x={xs(g)} y={H - PAD.b + 16} fontSize="10.5" fill={T.muted} textAnchor="middle">{g}</text>
              </g>
            ))}
            <text x={(PAD.l + W - PAD.r) / 2} y={H - 4} fontSize="11" fill={T.muted} textAnchor="middle">Attractivité · qualité du bien</text>
            <text x={12} y={(PAD.t + H - PAD.b) / 2} fontSize="11" fill={T.muted} textAnchor="middle" transform={`rotate(-90 12 ${(PAD.t + H - PAD.b) / 2})`}>Priorité · commerciale</text>
            <line x1={xs(medianX)} x2={xs(medianX)} y1={PAD.t} y2={H - PAD.b} stroke={T.sapin} strokeOpacity={0.45} strokeDasharray="5 4" />
            <line x1={PAD.l} x2={W - PAD.r} y1={ys(medianY)} y2={ys(medianY)} stroke={T.sapin} strokeOpacity={0.45} strokeDasharray="5 4" />

            {bins.map((b) => {
              const q = quad(b.x, b.y) as Quad;
              const r = 2.2 + Math.sqrt(b.n / maxN) * 13;
              const dim = focus && focus !== q;
              return (
                <circle
                  key={`${b.x}|${b.y}`}
                  cx={xs(b.x)}
                  cy={ys(b.y)}
                  r={r}
                  fill={QUADS[q].color}
                  fillOpacity={dim ? 0.08 : 0.5}
                  stroke={QUADS[q].color}
                  strokeOpacity={dim ? 0.15 : 0.9}
                  strokeWidth={1}
                  onMouseEnter={() => setHover(b)}
                  style={{
                    transform: armed ? "scale(1)" : "scale(0)", transformBox: "fill-box", transformOrigin: "center",
                    transition: `transform .7s cubic-bezier(.2,.9,.3,1.25) ${Math.round(b.x * 9)}ms, fill-opacity .3s, stroke-opacity .3s`,
                  }}
                />
              );
            })}
          </svg>
        </div>
      </div>

      <div style={{ flexShrink: 0, display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }}>
        {(Object.keys(QUADS) as Quad[]).map((q) => {
          const Q = QUADS[q];
          return (
            <div
              key={q}
              className="avw-card"
              onMouseEnter={() => setFocus(q)}
              onMouseLeave={() => setFocus(null)}
              style={{ padding: "8px 12px", cursor: "default", outline: focus === q ? `1.5px solid ${Q.color}` : "none", transition: "outline-color .2s" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: Q.color, flexShrink: 0 }} />
                <b>{Q.label}</b>
                <b style={{ color: Q.color, fontVariantNumeric: "tabular-nums" }}>{formatFr(counts[q])}</b>
                <span style={{ color: T.muted, fontSize: 10.5 }}>{share(q)} %</span>
              </div>
              <div style={{ fontSize: 10.5, color: T.muted, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{Q.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, value, label, suffix = "", decimals = 0, color = T.text }: { icon: LucideIcon; value: number; label: string; suffix?: string; decimals?: number; color?: string }) {
  return (
    <span style={{ display: "flex", alignItems: "baseline", gap: 6, whiteSpace: "nowrap" }}>
      <Icon size={13} color={color === T.text ? T.jadeCta : color} aria-hidden style={{ alignSelf: "center" }} />
      <b style={{ fontSize: 17, color, fontVariantNumeric: "tabular-nums" }}>
        <CountUp value={value} decimals={decimals} suffix={suffix} />
      </b>
      <span style={{ color: T.muted }}>{label}</span>
    </span>
  );
}
