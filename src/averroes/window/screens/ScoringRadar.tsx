import { useRef } from "react";
import { Building2, Gauge, Phone, Receipt, Save, SlidersHorizontal, Star, TrendingDown, TrendingUp } from "lucide-react";
import { ACCS, ADVISORS, SCORING, type Person } from "../data/fiction";
import { Avatar } from "../fx/Avatar";
import { useArmed } from "../fx/useArmed";
import { useEntrance } from "../fx/useEntrance";
import { T } from "../theme";

function ProfileRadar() {
  const armed = useArmed(250);
  const { profile } = SCORING;
  const cx = 150, cy = 112, R = 98;
  const pt = (deg: number, v: number) => {
    const a = (deg * Math.PI) / 180;
    return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v];
  };
  const axes = [-90, 150, 30];
  const tri = (v: number) => axes.map((a) => pt(a, v).join(",")).join(" ");
  const k = armed ? 1 : 0.02;
  const shape = [pt(-90, (profile.offre / 5) * k), pt(150, (profile.tx / 5) * k), pt(30, (profile.demande / 5) * k)].map((p) => p.join(",")).join(" ");
  return (
    <svg viewBox="0 -4 300 232" width="100%" height="100%" aria-label="Profil de scoring" style={{ display: "block" }}>
      {[1, 0.66, 0.33].map((v) => (
        <polygon key={v} points={tri(v)} fill="none" stroke={T.border} strokeDasharray="3 3" />
      ))}
      <polygon points={shape} fill="rgba(27,191,160,.2)" stroke={T.jadeCta} strokeWidth="1.8" strokeLinejoin="round" style={{ transition: "all 1s cubic-bezier(.2,.8,.2,1)" }} />
      <text x={cx} y={12} textAnchor="middle" fontSize="10" fontWeight="600" fill={T.muted}>Offre</text>
      <text x={cx - R * 0.9} y={cy + R * 0.5 + 18} textAnchor="middle" fontSize="10" fontWeight="600" fill={T.muted}>Transactions</text>
      <text x={cx + R * 0.9} y={cy + R * 0.5 + 18} textAnchor="middle" fontSize="10" fontWeight="600" fill={T.muted}>Demande</text>
    </svg>
  );
}

function Mover({ who, from, to }: { who: Person; from: number; to: number }) {
  const up = to < from;
  const d = Math.abs(from - to);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11 }}>
      <Avatar person={who} size={18} />
      <span style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {who.first} {who.last}
      </span>
      <span style={{ color: T.muted, fontSize: 10, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
        {from} → {to}
      </span>
      <span
        style={{
          flexShrink: 0, minWidth: 42, textAlign: "center", fontSize: 10, fontWeight: 600, borderRadius: 6, padding: "2px 5px",
          color: up ? T.jadeInk : "#a32550", background: up ? T.jadeSoft : T.roseSoft, border: `1px solid ${up ? "rgba(27,191,160,.35)" : "rgba(192,49,99,.3)"}`,
        }}
      >
        {up ? `+${d}` : `−${d}`}
      </span>
    </div>
  );
}

const RANKING: { who: Person; acc: Person; o: number; d: number; t: number; g: number; evo: number }[] = [
  { who: ADVISORS[0], acc: ACCS[2], o: SCORING.profile.offre, d: SCORING.profile.demande, t: SCORING.profile.tx, g: SCORING.global, evo: 9 },
  { who: ADVISORS[6], acc: ACCS[0], o: 3.4, d: 3.9, t: 3.6, g: 3.61, evo: 2 },
  { who: ADVISORS[3], acc: ACCS[3], o: 4.6, d: 1.8, t: 3.9, g: 3.52, evo: 23 },
  { who: ADVISORS[14], acc: ACCS[2], o: 3.1, d: 3.3, t: 4.1, g: 3.49, evo: -2 },
];

function Bar({ v, armed, delay }: { v: number; armed: boolean; delay: number }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <span style={{ width: 52, height: 5, borderRadius: 5, background: T.infoSoft, overflow: "hidden" }}>
        <span style={{ display: "block", height: "100%", width: armed ? `${(v / 5) * 100}%` : "0%", background: T.jadeCta, borderRadius: 5, transition: `width .9s ease ${delay}ms` }} />
      </span>
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{v.toFixed(1)}</span>
    </span>
  );
}

function Ranking() {
  const armed = useArmed(350);
  const cols = "28px 1.6fr 1fr 1fr 1fr 1fr 70px 50px";
  return (
    <div style={{ fontSize: 11 }}>
      <div className="avw-label" style={{ display: "grid", gridTemplateColumns: cols, gap: 10, padding: "0 6px 6px" }}>
        <span>#</span>
        <span>Conseiller</span>
        <span>ACC</span>
        <span style={{ display: "flex", gap: 4, alignItems: "center" }}><Building2 size={10} aria-hidden /> Offre</span>
        <span style={{ display: "flex", gap: 4, alignItems: "center" }}><Phone size={10} aria-hidden /> Demande</span>
        <span style={{ display: "flex", gap: 4, alignItems: "center" }}><Receipt size={10} aria-hidden /> Transac.</span>
        <span style={{ color: T.jadeInk }}>Global</span>
        <span>Évol.</span>
      </div>
      {RANKING.map((r, i) => (
        <div key={r.who.id} style={{ display: "grid", gridTemplateColumns: cols, gap: 10, alignItems: "center", padding: "7px 6px", borderTop: `1px solid ${T.border}` }}>
          <span style={{ width: 18, height: 18, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 9, fontWeight: 700, color: "#fff", background: [T.terracotta, "#6b8a85", "#a0523d", "rgba(26,52,49,.35)"][i] }}>{i + 1}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
            <Avatar person={r.who} size={20} />
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 500 }}>
              {r.who.first} {r.who.last}
            </span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
            <Avatar person={r.acc} size={18} dark />
            {r.acc.first}
          </span>
          <Bar v={r.o} armed={armed} delay={i * 60} />
          <Bar v={r.d} armed={armed} delay={i * 60 + 80} />
          <Bar v={r.t} armed={armed} delay={i * 60 + 160} />
          <span style={{ justifySelf: "start", fontWeight: 700, color: T.jadeInk, background: T.jadeSoft, border: "1px solid rgba(27,191,160,.35)", borderRadius: 999, padding: "2px 9px" }}>{r.g.toFixed(2)}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 600, color: r.evo >= 0 ? T.jadeInk : "#a32550" }}>
            {r.evo >= 0 ? <TrendingUp size={11} aria-hidden /> : <TrendingDown size={11} aria-hidden />}
            {Math.abs(r.evo)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ScoringRadar() {
  const ref = useRef<HTMLDivElement>(null);
  useEntrance(ref);
  const p = SCORING.profile;
  return (
    <div ref={ref} style={{ height: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.4fr)", gap: 14 }}>
        <div className="avw-card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="avw-label" style={{ display: "flex", alignItems: "center", gap: 6, color: T.jadeInk }}>
            <Gauge size={11} aria-hidden /> Profil de scoring
          </div>
          <div style={{ alignSelf: "center", marginTop: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, border: `1.5px solid ${T.jadeCta}`, borderRadius: 999, padding: "3px 10px 3px 4px" }}>
            <Avatar person={SCORING.who} size={18} /> {SCORING.who.first} {SCORING.who.last}
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ProfileRadar />
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, fontSize: 11 }}>
            <span><Building2 size={11} color={T.jadeCta} aria-hidden /> Offre <b>{p.offre.toFixed(1)}</b></span>
            <span><Phone size={11} color={T.jadeCta} aria-hidden /> Dem. <b>{p.demande.toFixed(1)}</b></span>
            <span><Receipt size={11} color={T.jadeCta} aria-hidden /> Tx <b>{p.tx.toFixed(1)}</b></span>
            <span style={{ fontWeight: 700, color: T.jadeInk, background: T.jadeSoft, borderRadius: 999, padding: "0 8px" }}>{SCORING.global.toFixed(2)}</span>
          </div>
        </div>

        <div className="avw-card" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="avw-label" style={{ display: "flex", alignItems: "center", gap: 6, color: T.jadeInk }}>
              <TrendingUp size={11} aria-hidden /> Évolution dans le classement
            </span>
            <span style={{ fontSize: 10, color: T.muted }}>598 conseillers suivis</span>
          </div>
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginTop: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <span className="avw-label" style={{ color: T.jadeInk, display: "flex", gap: 5, alignItems: "center" }}><TrendingUp size={10} aria-hidden /> Plus fortes hausses</span>
              {SCORING.risers.map((m) => <Mover key={m.who.id} {...m} />)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <span className="avw-label" style={{ color: "#a32550", display: "flex", gap: 5, alignItems: "center" }}><TrendingDown size={10} aria-hidden /> Plus fortes baisses</span>
              {SCORING.fallers.map((m) => <Mover key={m.who.id} {...m} />)}
            </div>
          </div>
        </div>
      </div>

      <div className="avw-card" style={{ padding: "10px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, marginBottom: 8 }}>
          <b style={{ display: "flex", alignItems: "center", gap: 5, letterSpacing: ".08em", fontSize: 10 }}><SlidersHorizontal size={11} aria-hidden /> PROFILS</b>
          <span style={{ display: "flex", alignItems: "center", gap: 5, border: `1px solid ${T.border}`, borderRadius: 8, padding: "3px 8px" }}>
            Scoring Master <span className="avw-label">consolidé</span> <Star size={10} fill={T.jadeCta} color={T.jadeCta} aria-hidden />
          </span>
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, border: `1px solid ${T.border}`, borderRadius: 8, padding: "3px 9px" }}>
            <Save size={11} aria-hidden /> Enregistrer le réglage
          </span>
        </div>
        <div style={{ fontSize: 10, color: T.jadeInk, background: "rgba(27,191,160,.07)", border: "1px solid rgba(27,191,160,.35)", borderRadius: 8, padding: "5px 10px", marginBottom: 8 }}>
          <b>Barème Averröes</b> <span style={{ color: T.muted }}>piste unique consolidée · données absentes exclues · scores et rangs recalculés pour 598 conseillers</span>
        </div>
        <Ranking />
      </div>
    </div>
  );
}
