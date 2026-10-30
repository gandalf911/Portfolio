import { useRef } from "react";
import { Crown, Home, KeyRound, Megaphone, Square, Triangle, Trophy, UserPlus, type LucideIcon } from "lucide-react";
import { ACCS, ACC_SERIES, TROPHIES, type Person } from "../data/fiction";
import { Avatar } from "../fx/Avatar";
import { Card } from "../fx/Card";
import { useArmed } from "../fx/useArmed";
import { useEntrance } from "../fx/useEntrance";
import { SERIES, T } from "../theme";

/* ---------- podiums du mois ---------- */

function podium(values: (p: Person, i: number) => number, asc = false) {
  return ACCS.map((p, i) => ({ p, v: values(p, i) }))
    .sort((a, b) => (asc ? a.v - b.v : b.v - a.v))
    .slice(0, 3);
}

const PODIUMS: { title: string; icon: LucideIcon; rows: { p: Person; v: number }[] }[] = [
  { title: "Metric 1 (mois en cours)", icon: Trophy, rows: podium((_, i) => [19, 14, 24, 9, 12, 6][i]) },
  { title: "Metric 2 (mois en cours)", icon: Square, rows: podium((_, i) => [81, 52, 47, 33, 29, 18][i]) },
  { title: "Metric 3 (le moins)", icon: Triangle, rows: podium((_, i) => [512, 288, 161, 403, 236, 140][i], true) },
];

function Podium({ title, icon: Icon, rows }: (typeof PODIUMS)[number]) {
  return (
    <div className="avw-card" style={{ padding: "11px 14px" }}>
      <div className="avw-label" style={{ display: "flex", alignItems: "center", gap: 6, color: T.jadeInk }}>
        <Icon size={11} aria-hidden /> {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 8 }}>
        {rows.map(({ p, v }, i) => (
          <div key={p.id} data-podium-row style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5 }}>
            {i === 0 ? <Crown size={12} color={T.terracotta} aria-hidden /> : <span style={{ width: 12, fontSize: 9, color: T.muted, textAlign: "center" }}>{i + 1}</span>}
            <Avatar person={p} size={16} />
            <span style={{ fontWeight: i === 0 ? 600 : 400, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {p.first} {p.last}
            </span>
            <b style={{ fontVariantNumeric: "tabular-nums" }}>{v}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- courbes de recrutement ---------- */

const CW = 1100;
const CH = 210;
const PAD = { l: 30, r: 24, t: 14, b: 22 };

function smooth(pts: [number, number][]) {
  // Catmull-Rom → Bézier : la courbe passe par chaque point, sans dépassement marqué.
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
}

function Curves() {
  const armed = useArmed(250);
  const max = 45;
  const n = ACC_SERIES.months.length;
  const x = (i: number) => PAD.l + (i / (n - 1)) * (CW - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - v / max) * (CH - PAD.t - PAD.b);
  return (
    <svg viewBox={`0 0 ${CW} ${CH}`} width="100%" height="100%" preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }} aria-label="Metric 1 mensuel par ACC">
      {[0, 15, 30, 45].map((g) => (
        <g key={g}>
          <line x1={PAD.l} x2={CW - PAD.r} y1={y(g)} y2={y(g)} stroke={T.border} strokeDasharray="3 4" />
          <text x={PAD.l - 8} y={y(g) + 3} fontSize="9" fill={T.muted} textAnchor="end">{g}</text>
        </g>
      ))}
      {ACC_SERIES.months.map((m, i) => (
        <text key={m} x={x(i)} y={CH - 4} fontSize="9" fill={T.muted} textAnchor="middle">{m}</text>
      ))}
      {ACC_SERIES.series.map((s, k) => (
        <path
          key={s.acc.id}
          data-series={s.acc.id}
          d={smooth(s.values.map((v, i) => [x(i), y(v)]))}
          fill="none"
          stroke={SERIES[k % SERIES.length]}
          strokeWidth={2}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={armed ? 0 : 1}
          vectorEffect="non-scaling-stroke"
          style={{ transition: `stroke-dashoffset 1.6s cubic-bezier(.3,.6,.2,1) ${k * 120}ms` }}
        />
      ))}
      {ACC_SERIES.series.map((s, k) => {
        // Le visage chevauche le pic de chaque ACC : on voit qui a porté quel mois.
        const peak = s.values.indexOf(Math.max(...s.values));
        const cx = x(peak), cy = y(s.values[peak]);
        const initials = (s.acc.first[0] + s.acc.last[0]).toUpperCase();
        return (
          <g key={s.acc.id} style={{ opacity: armed ? 1 : 0, transition: `opacity .4s ease ${1200 + k * 120}ms` }}>
            <title>{`${s.acc.first} ${s.acc.last}`}</title>
            <circle cx={cx} cy={cy} r={10} fill={T.surface} stroke={SERIES[k % SERIES.length]} strokeWidth={2} vectorEffect="non-scaling-stroke" />
            <text x={cx} y={cy + 3} fontSize="7.5" fontWeight="700" textAnchor="middle" fill={T.sapin}>{initials}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- mur des trophées ---------- */

const TROPHY_STYLE: Record<(typeof TROPHIES)[number]["tone"], { bg: string; fg: string; icon: LucideIcon }> = {
  jade: { bg: "linear-gradient(120deg, #84c9bd, #1bbfa0)", fg: T.sapin, icon: UserPlus },
  gold: { bg: "linear-gradient(120deg, #f4a08f, #ec6048)", fg: "#fff", icon: Megaphone },
  sapin: { bg: `linear-gradient(120deg, #2c5a52, ${T.sapin})`, fg: T.cream, icon: Home },
  rose: { bg: "linear-gradient(120deg, #e0668f, #c03163)", fg: "#fff", icon: KeyRound },
};

function TrophyWall() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
      {TROPHIES.map((t) => {
        const s = TROPHY_STYLE[t.tone];
        const Icon = s.icon;
        return (
          <div key={t.title} className="avw-card" style={{ padding: 10 }}>
            <div style={{ background: s.bg, color: s.fg, borderRadius: 10, padding: "8px 11px", display: "flex", alignItems: "center", gap: 9, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.18)" }}>
              <Icon size={18} aria-hidden />
              <div style={{ lineHeight: 1.15 }}>
                <div style={{ fontSize: 7.5, letterSpacing: ".12em", opacity: 0.8, textTransform: "uppercase" }}>Averröes · octobre 2026</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{t.title}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 8, fontSize: 11 }}>
              <Avatar person={t.acc} size={20} />
              <b style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.acc.first}</b>
              <span style={{ marginLeft: "auto", color: T.muted, fontSize: 10, flexShrink: 0 }}>{t.detail}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AccCurves() {
  const ref = useRef<HTMLDivElement>(null);
  useEntrance(ref);
  const totals = ACC_SERIES.series.map((s) => ({ acc: s.acc, total: s.values.reduce((a, b) => a + b, 0) })).sort((a, b) => b.total - a.total);
  return (
    <div ref={ref} style={{ height: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
        {PODIUMS.map((p) => (
          <Podium key={p.title} {...p} />
        ))}
      </div>
      <Card title="Metric 1 mensuel par ACC · 2026" arrow={false} style={{ flex: 1, display: "flex", flexDirection: "column", padding: "12px 16px 10px" }}>
        <span style={{ position: "absolute", top: 13, right: 16, fontSize: 10, color: T.muted }}>
          <b style={{ color: T.text }}>{totals.reduce((a, t) => a + t.total, 0)}</b> · Metric 1
        </span>
        <div style={{ flex: 1, minHeight: 0, position: "relative", marginTop: 6 }}>
          <div style={{ position: "absolute", inset: 0 }}>
            <Curves />
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 6, fontSize: 10.5 }}>
          {totals.map(({ acc, total }) => (
            <span key={acc.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Avatar person={acc} size={18} />
              {acc.first} {acc.last} <b>{total}</b>
            </span>
          ))}
        </div>
      </Card>
      <TrophyWall />
    </div>
  );
}
