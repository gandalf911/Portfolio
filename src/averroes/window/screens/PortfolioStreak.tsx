import { useEffect, useMemo, useRef, useState } from "react";
import { animate } from "animejs";
import { Flame, MoveHorizontal } from "lucide-react";
import { LEAD_FLOW, STREAK, type Tone } from "../data/fiction";
import { CountUp, formatFr } from "../fx/CountUp";
import { prefersReducedMotion } from "../fx/reducedMotion";
import { useArmed } from "../fx/useArmed";
import { T, TONE } from "../theme";

/* ---------- série de publications en 3D isométrique ---------- */

const LEVELS = ["#173a35", "#1a5e52", "#178f78", "#1bbfa0", "#4fd6bd", "#84c9bd"];
const MONTHS_FR = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(v * k).toString(16).padStart(2, "0");
  return `#${f(n >> 16)}${f((n >> 8) & 255)}${f(n & 255)}`;
}

type Cell = { col: number; row: number; count: number; date: string };

function useCells(): { cells: Cell[]; weeks: number; max: number } {
  return useMemo(() => {
    const cells: Cell[] = [];
    let col = 0;
    for (const d of STREAK.days) {
      const row = new Date(d.date + "T00:00:00Z").getUTCDay() - 1; // lun = 0 … ven = 4
      if (row === 0 && cells.length) col++;
      cells.push({ col, row, count: d.count, date: d.date });
    }
    return { cells, weeks: col + 1, max: Math.max(...STREAK.days.map((d) => d.count)) };
  }, []);
}

const W = 1104;
const H = 300;
const TILE = 14.5; // demi-largeur d'une case en projection
const LIFT = 3.1; // px par publication

function IsoStreak() {
  const { cells, weeks, max } = useCells();
  const [angle, setAngle] = useState(0);
  const [grow, setGrow] = useState(() => (prefersReducedMotion() ? 1 : 0));
  const [hover, setHover] = useState<Cell | null>(null);
  const drag = useRef<{ x: number; a: number } | null>(null);
  const box = useRef({ g: 0 });
  const svg = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const a = animate(box.current, { g: 1, duration: 1800, delay: 200, ease: "out(3)", onUpdate: () => setGrow(box.current.g) });
    return () => {
      a.pause();
    };
  }, []);

  // Le glisser se termine où que le pointeur soit relâché : écouteurs sur window.
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!drag.current) return;
      const next = Math.max(-35, Math.min(35, drag.current.a + (e.clientX - drag.current.x) * 0.25));
      setAngle(Math.round(next * 10) / 10);
    };
    const up = () => {
      drag.current = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    window.addEventListener("blur", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      window.removeEventListener("blur", up);
    };
  }, []);

  const rad = (angle * Math.PI) / 180;
  const c0 = (weeks - 1) / 2;
  const r0 = 2;
  const project = (c: number, r: number, z: number) => {
    const x = c - c0, y = r - r0;
    const rx = x * Math.cos(rad) - y * Math.sin(rad);
    const ry = x * Math.sin(rad) + y * Math.cos(rad);
    return [W / 2 + (rx * 1.15 - ry * 0.75) * TILE, H * 0.6 + (rx * 0.21 + ry * 0.55) * TILE - z] as const;
  };

  const prisms = cells
    .map((cell) => {
      const sx = cell.col - c0, sy = cell.row - r0;
      const rx = sx * Math.cos(rad) - sy * Math.sin(rad), ry = sx * Math.sin(rad) + sy * Math.cos(rad);
      const depth = rx * 0.21 + ry * 0.55;
      return { cell, depth };
    })
    .sort((a, b) => a.depth - b.depth);

  const lv = (n: number) => (n === 0 ? 0 : Math.min(LEVELS.length - 1, 1 + Math.floor((n / max) * (LEVELS.length - 1.01))));

  return (
    <div style={{ position: "relative", height: H }}>
      <svg
        ref={svg}
        data-testid="streak"
        data-angle={String(angle)}
        width="100%"
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ cursor: drag.current ? "grabbing" : "grab", touchAction: "none", display: "block" }}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, a: angle };
        }}
        onDoubleClick={() => setAngle(0)}
        onMouseLeave={() => setHover(null)}
        aria-label="Série de publications en 3D"
      >
        {prisms.map(({ cell }) => {
          const k = Math.max(0, Math.min(1, grow * 1.5 - (cell.col / weeks) * 0.5));
          const h = cell.count * LIFT * k + 1.5;
          const base = LEVELS[lv(cell.count)];
          const q = (dc: number, dr: number, z: number) => project(cell.col + dc - 0.42, cell.row + dr - 0.42, z).join(",");
          const s = 0.84;
          const top = [q(0, 0, h), q(s, 0, h), q(s, s, h), q(0, s, h)].join(" ");
          const left = [q(0, s, h), q(s, s, h), q(s, s, 0), q(0, s, 0)].join(" ");
          const right = [q(s, 0, h), q(s, s, h), q(s, s, 0), q(s, 0, 0)].join(" ");
          return (
            <g key={cell.date} onMouseEnter={() => setHover(cell)}>
              <polygon points={left} fill={shade(base, 0.62)} />
              <polygon points={right} fill={shade(base, 0.78)} />
              <polygon points={top} fill={hover?.date === cell.date ? T.elevated : base} />
            </g>
          );
        })}
        {MONTHS_FR.map((m, i) => {
          const first = cells.find((c) => new Date(c.date + "T00:00:00Z").getUTCMonth() === i && c.row === 0);
          if (!first) return null;
          const [x, y] = project(first.col, 5.4, 0);
          return (
            <text key={m} x={x} y={y + 6} fontSize="10" fill="rgba(254,239,224,.45)" textAnchor="middle">
              {m}
            </text>
          );
        })}
      </svg>

      <div style={{ position: "absolute", left: 18, bottom: 6, color: T.elevated, pointerEvents: "none" }}>
        <Record label="Plus longue série" value={STREAK.longest} sub="jours ouvrés" />
        <div style={{ height: 10 }} />
        <Record label="Série en cours" value={STREAK.current} sub="jours ouvrés" />
      </div>
      <div style={{ position: "absolute", right: 18, top: 10, textAlign: "right", color: T.elevated, pointerEvents: "none", minHeight: 50 }}>
        {hover && (
          <>
            <span style={{ fontSize: 34, fontWeight: 700, color: "#4fd6bd", lineHeight: 1 }}>{hover.count}</span>{" "}
            <span style={{ fontSize: 12 }}>publications</span>
            <div style={{ fontSize: 10, opacity: 0.6 }}>{new Date(hover.date + "T00:00:00Z").toLocaleDateString("fr-FR", { day: "numeric", month: "long", timeZone: "UTC" })}</div>
          </>
        )}
      </div>
      <div style={{ position: "absolute", right: 18, top: 70, display: "flex", alignItems: "center", gap: 5, fontSize: 9, color: "rgba(254,239,224,.55)", pointerEvents: "none" }}>
        <MoveHorizontal size={11} aria-hidden /> Glissez pour pivoter · double-clic pour réinitialiser
        <span style={{ marginLeft: 12 }}>Moins</span>
        {LEVELS.slice(1).map((c) => (
          <i key={c} style={{ width: 9, height: 9, borderRadius: 2, background: c, display: "inline-block" }} />
        ))}
        <span>Plus</span>
      </div>
    </div>
  );
}

function Record({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, opacity: 0.7, display: "flex", alignItems: "center", gap: 5 }}>
        <Flame size={11} aria-hidden /> {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontSize: 36, fontWeight: 700, color: "#4fd6bd", lineHeight: 1 }}>
          <CountUp value={value} duration={1600} />
        </span>
        <span style={{ fontSize: 11 }}>{sub}</span>
      </div>
    </div>
  );
}

/* ---------- flux des leads ---------- */

const COLS: string[][] = [["leads"], ["platform", "advisor"], ["qualified", "unqualified"], ["listed", "rejected", "archived"]];
const FW = 1104;
const FH = 176;
const NODE_W = 128;
const NODE_H = 40;

function LeadFlow() {
  const armed = useArmed(600);
  const pos = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    COLS.forEach((ids, ci) => {
      const x = 12 + ci * ((FW - NODE_W - 24) / (COLS.length - 1));
      const gap = (FH - ids.length * NODE_H) / (ids.length + 1);
      ids.forEach((id, k) => m.set(id, { x, y: gap + k * (NODE_H + gap) }));
    });
    return m;
  }, []);
  const maxV = LEAD_FLOW.nodes[0].value;
  const node = (id: string) => LEAD_FLOW.nodes.find((n) => n.id === id)!;
  const fill: Record<Tone, string> = { ok: "#1bbfa0", info: "#5aa79b", warn: TONE.warn.solid, alert: T.rose, neutral: "#2c5a52" };

  return (
    <svg width="100%" height={FH} viewBox={`0 0 ${FW} ${FH}`} aria-label="Flux des leads" style={{ display: "block" }}>
      {LEAD_FLOW.links.map((l, i) => {
        const a = pos.get(l.from)!, b = pos.get(l.to)!;
        const x1 = a.x + NODE_W, y1 = a.y + NODE_H / 2, x2 = b.x, y2 = b.y + NODE_H / 2;
        const mx = (x1 + x2) / 2;
        return (
          <path
            key={i}
            d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
            fill="none"
            stroke={fill[node(l.to).tone]}
            strokeOpacity={0.38}
            strokeWidth={Math.max(2, (l.value / maxV) * 34)}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={armed ? 0 : 1}
            style={{ transition: `stroke-dashoffset 1.1s cubic-bezier(.3,.7,.2,1) ${i * 90}ms` }}
          />
        );
      })}
      {LEAD_FLOW.nodes.map((n) => {
        const p = pos.get(n.id)!;
        return (
          <g key={n.id} transform={`translate(${p.x},${p.y})`}>
            <rect width={NODE_W} height={NODE_H} rx={9} fill={fill[n.tone]} />
            <text x={NODE_W / 2} y={17} textAnchor="middle" fontSize="12" fontWeight="700" fill={T.elevated}>
              {formatFr(n.value)}
            </text>
            <text x={NODE_W / 2} y={31} textAnchor="middle" fontSize="9.5" fill={T.elevated} opacity={0.85}>
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function PortfolioStreak() {
  return (
    <div
      style={{
        height: "100%", borderRadius: 18, overflow: "hidden", padding: "6px 6px 8px",
        background: `radial-gradient(90% 70% at 50% 30%, #234a45 0%, ${T.sapin} 60%, ${T.sapinDeep} 100%)`,
        display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}
    >
      <IsoStreak />
      <div style={{ borderTop: "1px solid rgba(132,201,189,.15)", paddingTop: 6 }}>
        <div className="avw-label" style={{ color: "rgba(254,239,224,.6)", padding: "0 12px 2px" }}>
          Flux des leads, de la réception à la publication
        </div>
        <LeadFlow />
      </div>
    </div>
  );
}
