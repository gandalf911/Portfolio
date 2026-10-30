import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { ArrowDown, Circle, Hourglass, Info, LayoutGrid, Search, SlidersHorizontal, Square, Triangle, UserRound, UsersRound, Waypoints, type LucideIcon } from "lucide-react";
import { POOL, type Tone } from "../data/fiction";
import { Avatar } from "../fx/Avatar";
import { CountUp } from "../fx/CountUp";
import { prefersReducedMotion } from "../fx/reducedMotion";
import { useArmed } from "../fx/useArmed";
import { useEntrance } from "../fx/useEntrance";
import { T, TONE } from "../theme";

/* Pool d'agents d'un ACC : sa répartition en trois segments, puis, agent par agent,
   deux indicateurs (libellés neutres : la vitrine ne dit pas ce qui est suivi). */

const GROUP_ICON: Record<string, LucideIcon> = { s1: Circle, s2: Square, s3: Triangle };
const color = (t: Tone) => (t === "info" ? "#9fd6cb" : TONE[t].solid);
const COLS = 14;

function Waffle() {
  const ref = useRef<HTMLDivElement>(null);
  const cells = POOL.groups.flatMap((g) => Array.from({ length: g.count }, () => g));
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const a = animate(el.querySelectorAll("i"), {
      scale: [0, 1],
      opacity: [0, 1],
      duration: 520,
      delay: stagger(14, { grid: [COLS, Math.ceil(cells.length / COLS)], from: "first" }),
      ease: "out(3)",
    });
    return () => {
      a.revert();
    };
  }, [cells.length]);
  return (
    <div ref={ref} style={{ flex: 1, minWidth: 0, display: "grid", gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`, gap: 4, alignContent: "center" }}>
      {cells.map((g, i) => (
        <i key={i} title={g.label} style={{ display: "block", aspectRatio: "2.3", borderRadius: 4, background: color(g.tone) }} />
      ))}
    </div>
  );
}

function PoolActivity() {
  const total = POOL.groups.reduce((a, g) => a + g.count, 0);
  const [tx, pub] = POOL.groups;
  const conversion = Math.round((tx.count / (tx.count + pub.count)) * 100);
  return (
    <div className="avw-card" style={{ flexShrink: 0, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="avw-card-h">
        <LayoutGrid size={15} color={T.jadeCta} aria-hidden /> Activité du pool d'agents <Info size={12} color={T.muted} aria-hidden />
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontWeight: 400, color: T.muted, fontSize: 12 }}>
          <UsersRound size={13} aria-hidden /> {total} agents
        </span>
      </div>
      <div style={{ display: "flex", gap: 22, alignItems: "stretch" }}>
        <div style={{ width: 330, flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 9 }}>
          {POOL.groups.map((g) => {
            const Icon = GROUP_ICON[g.key];
            return (
              <div key={g.key} style={{ display: "grid", gridTemplateColumns: "12px 16px 1fr auto", alignItems: "center", gap: 9, fontSize: 12.5 }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: color(g.tone) }} />
                <Icon size={14} color={T.muted} aria-hidden />
                <span>{g.label}</span>
                <span style={{ whiteSpace: "nowrap" }}>
                  <b style={{ fontVariantNumeric: "tabular-nums" }}>{g.count}</b>{" "}
                  <span style={{ color: T.muted, fontSize: 11 }}>{Math.round((g.count / total) * 100)} %</span>
                </span>
              </div>
            );
          })}
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: T.jadeSoft, borderRadius: 10, padding: "7px 12px", marginTop: 2 }}>
            <b style={{ fontSize: 22, color: T.jadeInk, letterSpacing: "-.02em" }}>
              <CountUp value={conversion} suffix=" %" />
            </b>
            <span style={{ fontSize: 11, color: T.muted, lineHeight: 1.3 }}>du segment 2 passent au segment 1</span>
          </div>
        </div>
        <Waffle />
      </div>
    </div>
  );
}

/* ---------- lignes du pool ---------- */

function LeadLine({ label, pair, delay }: { label: string; pair: number[]; delay: number }) {
  const armed = useArmed(400 + delay);
  const [received, moved] = pair;
  const rate = received ? (moved / received) * 100 : 0;
  const w = 210;
  const fill = Math.min(1, rate / 6);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, height: 26 }}>
      <span style={{ width: 54, fontSize: 10.5, color: T.muted }}>{label}</span>
      <svg width={w} height={26} viewBox={`0 0 ${w} 26`} style={{ overflow: "visible" }}>
        <line x1={24} x2={w - 12} y1={15} y2={15} stroke={T.infoSoft} strokeWidth={3} strokeLinecap="round" />
        <line x1={24} x2={24 + (w - 36) * (armed ? Math.max(0.04, fill) : 0)} y1={15} y2={15} stroke={moved ? T.jadeCta : T.border} strokeWidth={3} strokeLinecap="round" style={{ transition: "all .9s cubic-bezier(.2,.8,.2,1)" }} />
        <text x={(w + 12) / 2} y={7} textAnchor="middle" fontSize="10" fontWeight="700" fill={moved ? T.jadeInk : T.muted}>
          {rate.toFixed(1).replace(".", ",").replace(",0", "")} %
        </text>
        <circle cx={14} cy={15} r={12.5} fill={T.surface} stroke={T.jade} strokeWidth={1.6} />
        <text x={14} y={18.5} textAnchor="middle" fontSize="9.5" fontWeight="700" fill={T.text}>{received}</text>
        <circle cx={w - 8} cy={15} r={8} fill={moved ? T.jadeCta : T.surface} stroke={moved ? T.jadeCta : T.border} strokeWidth={1.4} />
        <text x={w - 8} y={18} textAnchor="middle" fontSize="8.5" fontWeight="700" fill={moved ? "#fff" : T.muted}>{moved}</text>
      </svg>
    </div>
  );
}

const PIPE_COLS = ["Total", "Tranche 1", "Tranche 2"];

function PipeGraph({ a, b }: { a: number[]; b: number[] }) {
  const w = 300, h = 76, xs = [64, 124, 184], tx = 268, rowY = [26, 60];
  const total = a[0] + b[0];
  const dot = (x: number, y: number, v: number, tone: string, k: string) => (
    <g key={k}>
      <circle cx={x} cy={y} r={8} fill={v ? T.surface : "transparent"} stroke={v ? tone : T.border} strokeWidth={1.5} strokeDasharray={v ? undefined : "2 2"} />
      <text x={x} y={y + 3} textAnchor="middle" fontSize="8.5" fontWeight="700" fill={v ? tone : T.muted}>{v}</text>
    </g>
  );
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible", display: "block" }}>
      {[["Source A", a, T.terracotta], ["Source B", b, T.jadeCta]].map(([label, vals, tone], r) => {
        const y = rowY[r];
        const v = vals as number[];
        return (
          <g key={label as string}>
            <text x={0} y={y + 3.5} fontSize="10" fill={T.muted}>{label as string}</text>
            <path d={`M${xs[0]},${y} L${xs[2]},${y} C${xs[2] + 40},${y} ${tx - 40},${(rowY[0] + rowY[1]) / 2} ${tx - 11},${(rowY[0] + rowY[1]) / 2}`} fill="none" stroke={tone as string} strokeOpacity={0.55} strokeWidth={1.3} />
            {v.map((n, i) => dot(xs[i], y, n, tone as string, `${r}-${i}`))}
          </g>
        );
      })}
      {PIPE_COLS.map((c, i) => (
        <text key={c} x={xs[i]} y={7} textAnchor="middle" fontSize="8.5" fill={T.muted}>{c}</text>
      ))}
      <text x={tx} y={7} textAnchor="middle" fontSize="8.5" fill={T.muted}>Total</text>
      <circle cx={tx} cy={(rowY[0] + rowY[1]) / 2} r={11} fill={total ? T.jadeSoft : T.surface} stroke={T.jadeCta} strokeWidth={1.8} />
      <text x={tx} y={(rowY[0] + rowY[1]) / 2 + 3.5} textAnchor="middle" fontSize="10" fontWeight="700" fill={T.jadeInk}>{total}</text>
    </svg>
  );
}

export function AgentPool() {
  const ref = useRef<HTMLDivElement>(null);
  useEntrance(ref, ".avw-pool-row", { delay: 250, y: 10 });
  const chip = (label: string) => (
    <span key={label} style={{ fontSize: 10.5, border: `1px solid ${T.border}`, borderRadius: 999, padding: "4px 11px", whiteSpace: "nowrap" }}>{label}</span>
  );
  return (
    <div ref={ref} style={{ height: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
      <PoolActivity />
      <div className="avw-card" style={{ flex: 1, minHeight: 0, padding: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderBottom: `1px solid ${T.border}` }}>
          <b style={{ fontSize: 12.5 }}>Pool d'agents (84/84)</b>
          <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>{["Filtre 1", "Filtre 2", "Filtre 3"].map(chip)}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, color: T.muted, border: `1px solid ${T.border}`, borderRadius: 8, padding: "4px 10px", width: 150 }}>
            <Search size={11} aria-hidden /> Rechercher…
          </span>
          <SlidersHorizontal size={14} color={T.muted} aria-hidden />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "250px 330px 1fr 60px", alignItems: "center", padding: "6px 14px", fontSize: 10.5, color: T.muted, borderBottom: `1px solid ${T.border}` }}>
          <span style={{ display: "flex", gap: 6, alignItems: "center" }}><UserRound size={12} aria-hidden /> Conseiller</span>
          <span style={{ display: "flex", gap: 6, alignItems: "center", color: T.jadeInk, fontWeight: 600 }}><Waypoints size={12} aria-hidden /> Metric 1 · 30 j <ArrowDown size={11} aria-hidden /></span>
          <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <Hourglass size={12} aria-hidden /> Metric 2 <Info size={11} aria-hidden />
          </span>
          <span />
        </div>
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          {POOL.rows.map((row, i) => (
            <div key={row.who.id} className="avw-pool-row" style={{ flex: 1, display: "grid", gridTemplateColumns: "250px 330px 1fr 60px", alignItems: "center", padding: "0 14px", borderBottom: i < POOL.rows.length - 1 ? `1px solid ${T.border}` : undefined }}>
              <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <Avatar person={row.who} size={32} />
                <span style={{ fontSize: 13.5, fontWeight: 500, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {row.who.first} {row.who.last}
                </span>
              </span>
              <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <LeadLine label="Total" pair={row.leads.all} delay={i * 120} />
                <LeadLine label="Groupe B" pair={row.leads.subset} delay={i * 120 + 60} />
              </span>
              <PipeGraph a={row.pipe.srcA} b={row.pipe.srcB} />
              <span style={{ color: T.jadeInk, fontSize: 12.5, fontWeight: 500, textAlign: "right" }}>Fiche</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
