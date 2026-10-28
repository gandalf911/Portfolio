import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { Banknote, FileText, GraduationCap, HandCoins, Network, TrendingUp, UserCheck, Wallet } from "lucide-react";
import { OVERVIEW } from "../data/fiction";
import { Avatar } from "../fx/Avatar";
import { Card } from "../fx/Card";
import { CountUp } from "../fx/CountUp";
import { prefersReducedMotion } from "../fx/reducedMotion";
import { useArmed } from "../fx/useArmed";
import { useEntrance } from "../fx/useEntrance";
import { T } from "../theme";

const big = (color: string = T.jadeCta) => ({ fontSize: 30, fontWeight: 600, color, letterSpacing: "-.02em", lineHeight: 1 });

function RetentionBars() {
  const armed = useArmed(250);
  const max = Math.max(...OVERVIEW.retention.buckets.map((b) => b.value));
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 40, marginTop: 8 }}>
      {OVERVIEW.retention.buckets.map((b, i) => (
        <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "stretch", gap: 3, height: "100%", justifyContent: "flex-end" }}>
          <div
            style={{
              height: armed ? `${(b.value / max) * 100}%` : "0%",
              background: i < 3 ? "#5fd0b8" : T.jade,
              borderRadius: "3px 3px 1px 1px",
              transition: `height .9s cubic-bezier(.2,.8,.2,1) ${i * 70}ms`,
            }}
          />
          <span style={{ fontSize: 7, color: T.muted, textAlign: "center", whiteSpace: "nowrap" }}>{b.label}</span>
        </div>
      ))}
    </div>
  );
}

function Ring({ value, max }: { value: number; max: number }) {
  const armed = useArmed(300);
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <svg width="54" height="54" viewBox="0 0 64 64" aria-hidden style={{ flexShrink: 0 }}>
      <circle cx="32" cy="32" r={r} fill="none" stroke={T.infoSoft} strokeWidth="6" />
      <circle
        cx="32" cy="32" r={r} fill="none" stroke={T.jadeCta} strokeWidth="6" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={armed ? c * (1 - value / max) : c}
        transform="rotate(-90 32 32)" style={{ transition: "stroke-dashoffset 1.3s cubic-bezier(.2,.8,.2,1)" }}
      />
    </svg>
  );
}

/** Radar Offre / Demande / Transactions qui passe d'un conseiller à l'autre. */
function Radar() {
  const [i, setI] = useState(0);
  const who = OVERVIEW.topScoring[i];
  const [p, setP] = useState(who.profile);
  const box = useRef({ ...who.profile });

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const t = window.setInterval(() => setI((k) => (k + 1) % OVERVIEW.topScoring.length), 3200);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const target = OVERVIEW.topScoring[i].profile;
    if (prefersReducedMotion()) return setP(target);
    const a = animate(box.current, { ...target, duration: 900, ease: "inOut(3)", onUpdate: () => setP({ ...box.current }) });
    return () => {
      a.pause();
    };
  }, [i]);

  const cx = 120, cy = 92, R = 70;
  const pt = (angle: number, v: number) => {
    const a = (angle * Math.PI) / 180;
    return `${cx + Math.cos(a) * R * v},${cy + Math.sin(a) * R * v}`;
  };
  const axes = [-90, 150, 30]; // Offre en haut, Transactions bas-gauche, Demande bas-droite
  const tri = (v: number) => axes.map((a) => pt(a, v)).join(" ");
  const shape = [pt(-90, p.offre / 5), pt(150, p.tx / 5), pt(30, p.demande / 5)].join(" ");

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
        <span className="avw-label" style={{ display: "flex", gap: 5, alignItems: "center", color: T.jadeInk }}>
          <TrendingUp size={11} aria-hidden /> Top scoring
        </span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: T.muted }}>{i + 1}/15</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 8 }}>
        <Avatar person={who.who} size={26} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {who.who.first} {who.who.last}
          </div>
          <div style={{ fontSize: 10, color: T.muted }}>{who.who.city}</div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: T.jadeInk, background: T.jadeSoft, border: `1px solid rgba(27,191,160,.35)`, borderRadius: 999, padding: "3px 9px" }}>
          {who.score.toFixed(1)}
        </span>
      </div>
      <svg viewBox="0 0 240 180" width="100%" height="178" aria-label="Profil de scoring">
        {[1, 0.66, 0.33].map((v) => (
          <polygon key={v} points={tri(v)} fill="none" stroke={T.border} strokeDasharray="3 3" />
        ))}
        {axes.map((a) => (
          <line key={a} x1={cx} y1={cy} x2={pt(a, 1).split(",")[0]} y2={pt(a, 1).split(",")[1]} stroke={T.border} strokeDasharray="3 3" />
        ))}
        <polygon points={shape} fill="rgba(27,191,160,.18)" stroke={T.jadeCta} strokeWidth="1.6" strokeLinejoin="round" />
        <text x={cx} y={12} textAnchor="middle" fontSize="10" fontWeight="600" fill={T.muted}>Offre</text>
        <text x={cx - R * 0.95} y={cy + R * 0.5 + 16} textAnchor="middle" fontSize="10" fontWeight="600" fill={T.muted}>Transactions</text>
        <text x={cx + R * 0.95} y={cy + R * 0.5 + 16} textAnchor="middle" fontSize="10" fontWeight="600" fill={T.muted}>Demande</text>
      </svg>
      <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
        {Array.from({ length: 15 }, (_, k) => (
          <span key={k} style={{ width: k === i ? 14 : 4, height: 4, borderRadius: 4, background: k === i ? T.jadeCta : T.border, transition: "width .3s" }} />
        ))}
      </div>
    </div>
  );
}

function Activated() {
  const armed = useArmed(500);
  const vals = [22, 31, 27, 38, 29, 44, 41, 18, 47, 35];
  const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];
  return (
    <div style={{ marginTop: 10 }}>
      <div className="avw-label">Agents activés / mois</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 46, marginTop: 6 }}>
        {vals.map((v, k) => (
          <div key={k} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%", gap: 2 }}>
            <div style={{ height: armed ? `${(v / 47) * 100}%` : "0%", background: k === vals.length - 1 ? T.jadeCta : T.jade, borderRadius: 3, transition: `height .8s ease-out ${k * 50}ms` }} />
            <span style={{ fontSize: 6.5, color: T.muted, textAlign: "center" }}>{months[k]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Spotlight() {
  const { acc, recruits, month } = OVERVIEW.spotlight;
  return (
    <div
      className="avw-card"
      style={{
        gridArea: "spot", padding: 0, overflow: "hidden", border: 0, color: T.elevated,
        background: `radial-gradient(120% 80% at 70% 20%, #2c5a52 0%, ${T.sapin} 55%, ${T.sapinDeep} 100%)`,
      }}
    >
      <span
        className="avw-label"
        style={{ position: "absolute", top: 14, left: 14, color: T.elevated, background: "rgba(0,0,0,.28)", borderRadius: 999, padding: "5px 10px", display: "flex", gap: 6, alignItems: "center" }}
      >
        <TrendingUp size={10} aria-hidden /> ACC recruteur du mois
      </span>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", paddingBottom: 60 }}>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", inset: -26, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(132,201,189,.35), transparent)" }} />
          <Avatar person={acc} size={112} dark />
        </div>
      </div>
      <div style={{ position: "absolute", left: 18, right: 18, bottom: 16 }}>
        <div style={{ fontSize: 17, fontWeight: 600 }}>
          {acc.first} {acc.last}
        </div>
        <div style={{ fontSize: 11, opacity: 0.75 }}>Account manager</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
          <span style={{ fontSize: 30, fontWeight: 700, lineHeight: 1 }}>
            <CountUp value={recruits} delay={300} />
          </span>
          <span style={{ fontSize: 11, opacity: 0.85 }}>recrutements en {month}</span>
        </div>
      </div>
    </div>
  );
}

export function Overview() {
  const ref = useRef<HTMLDivElement>(null);
  useEntrance(ref);
  const o = OVERVIEW;
  return (
    <div
      ref={ref}
      style={{
        height: "100%", display: "grid", gap: 14,
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gridTemplateRows: "repeat(3, minmax(0, 1fr))",
        gridTemplateAreas: `"ret net rec" "onb net spot" "imp net spot"`,
      }}
    >
      <Card icon={UserCheck} style={{ gridArea: "ret" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 10 }}>
          <span style={big()}>
            <CountUp value={o.retention.pct} decimals={1} suffix="%" />
          </span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Rétention</span>
        </div>
        <div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>
          {o.retention.remaining} encore dans le réseau sur {o.retention.total.toLocaleString("fr-FR").replace(/ /g, " ")} · durée de vie moy. <b style={{ color: T.text }}>{String(o.retention.avgMonths).replace(".", ",")} mois</b>
        </div>
        <RetentionBars />
      </Card>

      <Card icon={GraduationCap} style={{ gridArea: "onb" }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginTop: 10 }}>Onboarding</div>
        <div style={{ fontSize: 10, color: T.muted }}>Satisfaction du survey, note moyenne.</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8 }}>
          <Ring value={o.onboarding.score} max={5} />
          <div>
            <span style={big()}>
              <CountUp value={o.onboarding.score} decimals={1} />
            </span>
            <span style={{ fontSize: 12, color: T.muted }}> / 5</span>
            <div style={{ fontSize: 10, color: T.muted }}>sur {o.onboarding.responses} réponses</div>
          </div>
        </div>
      </Card>

      <Card icon={Wallet} tone="alert" style={{ gridArea: "imp" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 12 }}>
          <span style={big(T.rose)}>
            <CountUp value={o.unpaid.count} />
          </span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Impayés &gt; 3 mois</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 18, fontSize: 11 }}>
          <Avatar person={o.unpaid.example} size={22} />
          <b>
            {o.unpaid.example.first} {o.unpaid.example.last}
          </b>
          <span style={{ color: T.muted }}>· {o.unpaid.months} mois</span>
          <span style={{ marginLeft: "auto", display: "flex", gap: 5, color: T.muted }}>
            <FileText size={12} aria-hidden /> <HandCoins size={12} aria-hidden />
          </span>
        </div>
      </Card>

      <Card icon={Network} style={{ gridArea: "net" }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginTop: 12 }}>Réseau conseillers</div>
        <div style={{ ...big(), fontSize: 38, marginTop: 6 }}>
          <CountUp value={o.network.active} />
        </div>
        <div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>{o.network.recruitedThisYear} recrutés en 2026</div>
        <Radar />
        <Activated />
      </Card>

      <Card icon={Banknote} style={{ gridArea: "rec" }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginTop: 12 }}>Taux de recouvrement</div>
        <div style={{ ...big(), marginTop: 8 }}>
          <CountUp value={o.recoveryPct} decimals={1} suffix="%" />
        </div>
        <RecoveryBar pct={o.recoveryPct} />
      </Card>

      <Spotlight />
    </div>
  );
}

function RecoveryBar({ pct }: { pct: number }) {
  const armed = useArmed(400);
  return (
    <div style={{ marginTop: 12, height: 6, borderRadius: 6, background: T.infoSoft, overflow: "hidden" }}>
      <div style={{ height: "100%", width: armed ? `${pct}%` : "0%", background: T.jadeCta, borderRadius: 6, transition: "width 1.2s cubic-bezier(.2,.8,.2,1)" }} />
    </div>
  );
}
