import { useEffect, useMemo, useRef, useState } from "react";
import { animate } from "animejs";
import { Building, Home, Info, KeyRound, PieChart, Store, Trees, Briefcase, type LucideIcon } from "lucide-react";
import { LISTING_MIX, type SunNode } from "../data/fiction";
import { CountUp, formatFr } from "../fx/CountUp";
import { prefersReducedMotion } from "../fx/reducedMotion";
import { T } from "../theme";

/* Biens publiés : transaction › typologie › sous-typologie, en trois anneaux. */

const S = 640;
const C = S / 2;
const RINGS: [number, number][] = [
  [92, 150],
  [156, 206],
  [212, 246],
];
const PALETTE = {
  Vente: ["#1bbfa0", "#5fd3bd", "#a9e5da"],
  Location: ["#ec6048", "#f08b77", "#f6bcb0"],
} as const;
const TYPE_ICON: Record<string, LucideIcon> = { Appartement: Building, Villa: Home, "Local commercial": Store, Terrain: Trees, Bureaux: Briefcase };

type Arc = { id: string; node: SunNode; depth: number; a0: number; a1: number; color: string; root: "Vente" | "Location"; parent?: SunNode };

const total = LISTING_MIX.reduce((a, n) => a + n.value, 0);

function layout(): Arc[] {
  const arcs: Arc[] = [];
  let a = 0;
  for (const tx of LISTING_MIX) {
    const root = tx.label as "Vente" | "Location";
    const span = (tx.value / total) * Math.PI * 2;
    arcs.push({ id: root, node: tx, depth: 0, a0: a, a1: a + span, color: PALETTE[root][0], root });
    let b = a;
    tx.children?.forEach((ty, i) => {
      const sb = (ty.value / total) * Math.PI * 2;
      arcs.push({ id: `${root}/${ty.label}`, node: ty, depth: 1, a0: b, a1: b + sb, color: PALETTE[root][1], root, parent: tx });
      let c = b;
      ty.children?.forEach((st) => {
        const sc = (st.value / total) * Math.PI * 2;
        arcs.push({ id: `${root}/${ty.label}/${st.label}`, node: st, depth: 2, a0: c, a1: c + sc, color: PALETTE[root][2], root, parent: ty });
        c += sc;
      });
      b += sb;
      void i;
    });
    a += span;
  }
  return arcs;
}

const pt = (r: number, a: number) => [C + r * Math.sin(a), C - r * Math.cos(a)] as const;

function sector(r0: number, r1: number, a0: number, a1: number) {
  if (a1 - a0 < 0.0005) return "";
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const [x0, y0] = pt(r1, a0), [x1, y1] = pt(r1, a1), [x2, y2] = pt(r0, a1), [x3, y3] = pt(r0, a0);
  return `M${x0},${y0} A${r1},${r1} 0 ${large} 1 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 ${large} 0 ${x3},${y3} Z`;
}

/** Arc support d'un libellé tangentiel, retourné en bas du disque pour rester lisible. */
function labelArc(r: number, a0: number, a1: number) {
  const mid = (a0 + a1) / 2;
  const bottom = Math.cos(mid) < 0;
  const [sx, sy] = pt(r, bottom ? a1 : a0), [ex, ey] = pt(r, bottom ? a0 : a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M${sx},${sy} A${r},${r} 0 ${large} ${bottom ? 0 : 1} ${ex},${ey}`;
}

/** Libellé radial au milieu d'un secteur, jamais la tête en bas. */
function radial(r: number, a0: number, a1: number) {
  const mid = (a0 + a1) / 2;
  const [x, y] = pt(r, mid);
  let deg = (mid * 180) / Math.PI - 90;
  if (Math.sin(mid) < 0) deg += 180;
  return { x, y, deg };
}

export function ListingSunburst() {
  const arcs = useMemo(layout, []);
  const [p, setP] = useState(() => (prefersReducedMotion() ? 1 : 0));
  const [hover, setHover] = useState<Arc | null>(null);
  const box = useRef({ p: 0 });

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const a = animate(box.current, { p: 1, duration: 1500, delay: 120, ease: "inOut(3)", onUpdate: () => setP(box.current.p) });
    return () => {
      a.pause();
    };
  }, []);

  const typeTotals = useMemo(() => {
    const m = new Map<string, { vente: number; location: number }>();
    for (const tx of LISTING_MIX)
      for (const ty of tx.children ?? []) {
        const e = m.get(ty.label) ?? { vente: 0, location: 0 };
        if (tx.label === "Vente") e.vente += ty.value;
        else e.location += ty.value;
        m.set(ty.label, e);
      }
    return [...m.entries()].map(([label, v]) => ({ label, ...v, total: v.vente + v.location })).sort((a, b) => b.total - a.total);
  }, []);
  const typeMax = typeTotals[0].total;
  const sweep = p * Math.PI * 2;
  const isLit = (a: Arc) => !hover || a.id === hover.id || a.id.startsWith(hover.id + "/") || hover.id.startsWith(a.id + "/");

  return (
    <div className="avw-card" style={{ height: "100%", padding: "14px 18px", display: "flex", flexDirection: "column" }}>
      <div className="avw-card-h" style={{ flexShrink: 0 }}>
        <PieChart size={16} color={T.jadeCta} aria-hidden /> Biens publiés : transaction, typologie, sous-typologie <Info size={12} color={T.muted} aria-hidden />
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 20 }}>
        <div style={{ width: 330, flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
          <div>
            <div className="avw-label">Tout le parc</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1 }}>
                <CountUp value={total} />
              </span>
              <span style={{ fontSize: 13, color: T.muted }}>biens publiés</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {LISTING_MIX.map((tx) => {
              const Icon = tx.label === "Vente" ? Home : KeyRound;
              return (
                <div key={tx.label} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 4, background: PALETTE[tx.label as "Vente"][0] }} />
                  <Icon size={14} color={T.muted} aria-hidden />
                  <span style={{ width: 80 }}>{tx.label}</span>
                  <b style={{ fontVariantNumeric: "tabular-nums" }}>{formatFr(tx.value)}</b>
                  <span style={{ color: T.muted, fontSize: 12 }}>· {Math.round((tx.value / total) * 100)} %</span>
                </div>
              );
            })}
          </div>
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="avw-label">Par typologie</div>
            {typeTotals.map((t) => {
              const Icon = TYPE_ICON[t.label] ?? Building;
              return (
                <div key={t.label} style={{ display: "grid", gridTemplateColumns: "16px 112px 1fr 44px", alignItems: "center", gap: 8, fontSize: 11.5 }}>
                  <Icon size={13} color={T.jadeCta} aria-hidden />
                  <span style={{ whiteSpace: "nowrap" }}>{t.label}</span>
                  <span style={{ display: "flex", height: 7, borderRadius: 4, overflow: "hidden", background: T.infoSoft }}>
                    <i style={{ width: `${(t.vente / typeMax) * 100 * p}%`, background: PALETTE.Vente[0] }} />
                    <i style={{ width: `${(t.location / typeMax) * 100 * p}%`, background: PALETTE.Location[0] }} />
                  </span>
                  <b style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatFr(t.total)}</b>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
          <svg viewBox={`0 0 ${S} ${S}`} width="100%" height="100%" style={{ position: "absolute", inset: 0, display: "block", overflow: "visible" }} aria-label="Répartition des biens publiés" onMouseLeave={() => setHover(null)}>
            <defs>
              {arcs.filter((a) => a.depth < 2).map((a) => (
                <path key={a.id} id={`avw-sb-${a.id.replace(/\W/g, "_")}`} d={labelArc((RINGS[a.depth][0] + RINGS[a.depth][1]) / 2, a.a0, a.a1)} />
              ))}
            </defs>
            {arcs.map((a) => {
              const [r0, r1] = RINGS[a.depth];
              const a0 = Math.min(a.a0, sweep), a1 = Math.min(a.a1, sweep);
              return (
                <path
                  key={a.id}
                  d={sector(r0, r1, a0, a1)}
                  fill={a.color}
                  stroke={T.surface}
                  strokeWidth={2.5}
                  opacity={isLit(a) ? 1 : 0.3}
                  onMouseEnter={() => setHover(a)}
                  style={{ transition: "opacity .25s", cursor: "default" }}
                />
              );
            })}
            <g style={{ opacity: p > 0.92 ? 1 : 0, transition: "opacity .5s" }} pointerEvents="none">
              {arcs.filter((a) => a.depth === 0).map((a) => (
                <text key={a.id} fontSize="15" fontWeight="700" fill="#fff" dy="5">
                  <textPath href={`#avw-sb-${a.id.replace(/\W/g, "_")}`} startOffset="50%" textAnchor="middle">
                    {a.node.label} {formatFr(a.node.value)}
                  </textPath>
                </text>
              ))}
              {arcs.filter((a) => a.depth === 1 && a.a1 - a.a0 > 0.12).map((a) => {
                const r = (RINGS[1][0] + RINGS[1][1]) / 2;
                const text = `${a.node.label} ${formatFr(a.node.value)}`;
                // le nom complet suit l'arc s'il y tient ; sinon le seul effectif, en travers
                if (text.length * 7 < r * (a.a1 - a.a0)) {
                  return (
                    <text key={a.id} fontSize="11.5" fontWeight="700" fill={T.sapin} dy="4">
                      <textPath href={`#avw-sb-${a.id.replace(/\W/g, "_")}`} startOffset="50%" textAnchor="middle">{text}</textPath>
                    </text>
                  );
                }
                const { x, y, deg } = radial(r, a.a0, a.a1);
                return (
                  <text key={a.id} x={x} y={y} transform={`rotate(${deg} ${x} ${y})`} textAnchor="middle" dominantBaseline="central" fontSize="11.5" fontWeight="700" fill={T.sapin}>
                    {formatFr(a.node.value)}
                  </text>
                );
              })}
              {arcs.filter((a) => a.depth === 2 && a.a1 - a.a0 > 0.1).map((a) => {
                const inner = radial((RINGS[2][0] + RINGS[2][1]) / 2, a.a0, a.a1);
                const outer = radial(RINGS[2][1] + 10, a.a0, a.a1);
                const right = Math.sin((a.a0 + a.a1) / 2) >= 0;
                return (
                  <g key={a.id}>
                    <text x={inner.x} y={inner.y} transform={`rotate(${inner.deg} ${inner.x} ${inner.y})`} textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="700" fill={T.sapin}>
                      {formatFr(a.node.value)}
                    </text>
                    <text x={outer.x} y={outer.y} transform={`rotate(${outer.deg} ${outer.x} ${outer.y})`} textAnchor={right ? "start" : "end"} dominantBaseline="central" fontSize="11" fill={T.muted}>
                      {a.node.label.replace("Local commercial", "Local comm.")}
                    </text>
                  </g>
                );
              })}
            </g>
            <circle cx={C} cy={C} r={RINGS[0][0] - 6} fill={T.surface} />
            <text x={C} y={C - 4} textAnchor="middle" fontSize={hover ? 22 : 30} fontWeight="700" fill={T.text}>
              {formatFr(hover ? hover.node.value : Math.round(total * p))}
            </text>
            <text x={C} y={C + 18} textAnchor="middle" fontSize="11.5" fill={T.muted}>
              {hover ? hover.node.label : "biens publiés"}
            </text>
            {hover && (
              <text x={C} y={C + 34} textAnchor="middle" fontSize="10.5" fill={T.muted}>
                {Math.round((hover.node.value / (hover.parent?.value ?? total)) * 100)} % de {hover.parent ? hover.parent.label.toLowerCase() : "tout le parc"}
              </text>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
