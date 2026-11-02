import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { animate, stagger } from "animejs";
import { CalendarRange, Coins, Hash, MousePointerClick, Percent, Search, Sigma, UserCheck, UserPlus, Users, X, type LucideIcon } from "lucide-react";
import type { City, Person } from "../../averroes/window/data/fiction";
import { Avatar } from "../../averroes/window/fx/Avatar";
import { formatFr } from "../../averroes/window/fx/CountUp";
import { prefersReducedMotion } from "../../averroes/window/fx/reducedMotion";
import { T, TONE } from "../../averroes/window/theme";

/* Analyse › Cohortes : chaque compteur est un bouton qui ouvre les noms derrière lui.
   Le chiffre et sa liste sortent du même jeu de fiches, ils ne peuvent pas diverger. */

/* ---------- Données fictives : une fiche par conseiller ---------- */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = ["Aïcha", "Hamza", "Zineb", "Ismaël", "Chaïma", "Yassir", "Inès", "Mounir", "Salma", "Anass", "Noémie", "Driss", "Hajar", "Tarik", "Loubna", "Ilyès", "Meryem", "Saad", "Kenza", "Achraf", "Siham", "Naïm", "Hind", "Bilal", "Rim", "Youssef", "Oumaïma", "Fayçal", "Wiam", "Soufiane"];
const LAST = ["Benjelloun", "Tazi", "El Amrani", "Chraïbi", "Bennani", "Lamrani", "Sefiani", "Berrechid", "Ouali", "Kadiri", "Hassani", "Mekouar", "Bensouda", "Raïss", "Laraki", "Tahiri", "Squalli", "Ghazi", "Moumni", "Zemmouri", "Alaoui", "Bakkali", "Idrissi", "Hilali"];
const CITIES: City[] = ["Casablanca", "Rabat", "Marrakech", "Tanger", "Agadir", "Fès"];

const COHORTS = ["T1 2024", "T2 2024", "T3 2024", "T4 2024", "T1 2025", "T2 2025", "T3 2025", "T4 2025"];
/** Mois écoulés depuis l'entrée de chaque cohorte : la diagonale du tableau. */
const ELAPSED = COHORTS.map((_, c) => 31 - 3 * c);
const HORIZONS = [3, 6, 12, 18, 24];

type Fiche = { person: Person; cohort: number; tx: { month: number; ca: number }[] };

function buildFiches(): Fiche[] {
  const r = rng(424242);
  const sizes = [38, 46, 41, 52, 44, 57, 49, 35];
  const used = new Set<string>();
  const out: Fiche[] = [];
  let n = 0;
  sizes.forEach((size, cohort) => {
    for (let k = 0; k < size; k++) {
      let first = "", last = "";
      do {
        first = FIRST[Math.floor(r() * FIRST.length)];
        last = LAST[Math.floor(r() * LAST.length)];
      } while (used.has(first + last));
      used.add(first + last);
      const person: Person = { id: `d${++n}`, first, last, city: CITIES[Math.floor(r() * CITIES.length)] };
      // environ un sur deux transacte un jour ; les cohortes récentes progressent plus vite
      const tx: Fiche["tx"] = [];
      if (r() < 0.42 + cohort * 0.025) {
        let m = Math.floor(Math.pow(r(), 1.6) * 20) + 1;
        while (m <= ELAPSED[cohort]) {
          tx.push({ month: m, ca: Math.round((18000 + r() * 62000) / 500) * 500 });
          m += 2 + Math.floor(r() * 9);
        }
      }
      out.push({ person, cohort, tx });
    }
  });
  return out;
}
const FICHES = buildFiches();

type Membre = { person: Person; nb: number; ca: number };

/** Les membres d'une case : conseillers d'une ou toutes les cohortes, transactions jusqu'à `h` mois. */
function membres(cohort: number | null, h: number | null, all = false): Membre[] {
  return FICHES.filter((f) => cohort == null || f.cohort === cohort)
    .filter((f) => h == null || h <= ELAPSED[f.cohort])
    .map((f) => {
      const tx = f.tx.filter((t) => h == null || t.month <= h);
      return { person: f.person, nb: tx.length, ca: tx.reduce((s, t) => s + t.ca, 0) };
    })
    .filter((m) => all || m.nb > 0)
    .sort((a, b) => b.nb - a.nb || b.ca - a.ca);
}

type Portee = { titre: string; sousTitre: string; chip: string; liste: Membre[] };

const norm = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

const CSS = `
.dvtb-num{border:0;background:transparent;font:inherit;color:var(--tx);cursor:pointer;border-radius:8px;padding:3px 8px;font-variant-numeric:tabular-nums;text-decoration:underline dotted ${T.jadeCta};text-underline-offset:4px;transition:background .2s,color .2s,transform .2s}
.dvtb-num:hover,.dvtb-num:focus-visible{background:${T.sapin};color:${T.cream};outline:none;transform:scale(1.06)}
.dvtb-cell{position:relative;display:flex;align-items:center;justify-content:center;min-height:0}
.dvtb-row{display:contents}
.dvtb-row:hover>div{background-color:rgb(var(--ink) / .035)}
.dvtb-hint{position:absolute;inset:-3px;border-radius:12px;border:2px solid ${T.jadeCta};pointer-events:none;animation:dvtb-pulse 1.6s ease-out infinite}
@keyframes dvtb-pulse{0%{opacity:.9;transform:scale(.92)}100%{opacity:0;transform:scale(1.22)}}
.dvtb-tip{position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);white-space:nowrap;background:${T.sapin};color:${T.cream};font-size:10.5px;font-weight:500;border-radius:8px;padding:4px 9px;display:flex;gap:5px;align-items:center;pointer-events:none;z-index:2;animation:dvtb-bob 1.6s ease-in-out infinite}
.dvtb-tip::after{content:"";position:absolute;top:100%;left:50%;margin-left:-5px;border:5px solid transparent;border-top-color:${T.sapin}}
@keyframes dvtb-bob{50%{transform:translate(-50%,-3px)}}
.dvtb-li{display:flex;align-items:center;gap:10px;padding:6px 8px;border-radius:11px;transition:background .15s}
.dvtb-li:hover{background:var(--bg)}
.dvtb-search{width:100%;border:1px solid var(--bd);background:var(--bg);color:var(--tx);border-radius:11px;padding:8px 10px 8px 32px;font:400 12px ${T.font};outline:none}
.dvtb-search:focus{border-color:${T.jadeCta}}
@media (prefers-reduced-motion: reduce){.dvtb-hint,.dvtb-tip{animation:none}}
`;

const heat = (part: number) => `rgba(27,191,160,${(0.05 + part * 0.5).toFixed(3)})`;

function Head({ icon: Icon, children, align = "center" }: { icon: LucideIcon; children: ReactNode; align?: "center" | "left" }) {
  return (
    <div className="avw-label" style={{ display: "flex", alignItems: "center", justifyContent: align === "left" ? "flex-start" : "center", gap: 5, padding: "0 6px" }}>
      <Icon size={11} color={T.jadeCta} aria-hidden /> {children}
    </div>
  );
}

export function DrillTable() {
  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [portee, setPortee] = useState<Portee | null>(null);
  const [touched, setTouched] = useState(false);

  // les lignes du tableau entrent en cascade
  useEffect(() => {
    const g = gridRef.current;
    if (!g || prefersReducedMotion()) return;
    const a = animate(g.querySelectorAll<HTMLElement>("[data-cell]"), {
      opacity: [0, 1],
      y: [10, 0],
      duration: 480,
      delay: stagger(9),
      ease: "out(3)",
    });
    return () => {
      a.revert();
    };
  }, []);

  const table = useMemo(
    () =>
      COHORTS.map((label, c) => {
        const effectif = FICHES.filter((f) => f.cohort === c).length;
        const cells = HORIZONS.map((h) => (h <= ELAPSED[c] ? membres(c, h) : null));
        const total = membres(c, null);
        return { label, c, effectif, cells, total };
      }),
    [],
  );
  const totals = useMemo(
    () => ({
      effectif: FICHES.length,
      cells: HORIZONS.map((h) => membres(null, h)),
      total: membres(null, null),
    }),
    [],
  );

  const close = useCallback(() => setPortee(null), []);
  const open = (p: Portee) => {
    setTouched(true);
    setPortee(p);
  };

  const cols = "minmax(150px,1.3fr) 0.9fr repeat(5, minmax(0,1fr)) 0.95fr 0.85fr";
  const cellStyle = { borderTop: `1px solid ${T.border}` } as const;

  return (
    <div ref={rootRef} className="dvtb" style={{ position: "relative", width: "100%", height: "100%", background: T.bg, padding: 16, display: "flex", fontFamily: T.font, overflow: "hidden" }}>
      <style>{CSS}</style>
      <div className="avw-card" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", padding: "14px 16px 12px" }}>
        <div className="avw-card-h" style={{ flexShrink: 0 }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, background: T.jadeSoft, color: T.jadeCta, display: "grid", placeItems: "center", flexShrink: 0 }}>
            <CalendarRange size={15} strokeWidth={1.8} aria-hidden />
          </span>
          <span>Cohortes de recrutement · conseillers ayant transacté</span>
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 400, color: T.muted }}>
            <MousePointerClick size={13} color={T.jadeCta} aria-hidden /> Chaque nombre ouvre sa liste
          </span>
        </div>

        <div
          ref={gridRef}
          style={{ flex: 1, minHeight: 0, marginTop: 12, display: "grid", gridTemplateColumns: cols, gridTemplateRows: `32px repeat(${COHORTS.length}, minmax(0,1fr)) minmax(0,1.1fr)`, fontSize: 13 }}
        >
          <Head icon={CalendarRange} align="left">Cohorte</Head>
          <Head icon={UserPlus}>Recrutés</Head>
          {HORIZONS.map((h) => (
            <Head key={h} icon={Hash}>M+{h}</Head>
          ))}
          <Head icon={UserCheck}>À ce jour</Head>
          <Head icon={Percent}>Part</Head>

          {table.map((row) => (
            <div key={row.label} className="dvtb-row">
              <div data-cell style={{ ...cellStyle, display: "flex", alignItems: "center", gap: 8, padding: "0 8px", fontWeight: 600 }}>
                {row.label}
                <span style={{ fontSize: 10, fontWeight: 400, color: T.muted }}>{ELAPSED[row.c]} mois</span>
              </div>
              <div data-cell className="dvtb-cell" style={cellStyle}>
                <button
                  type="button"
                  className="dvtb-num"
                  title="Voir les recrutés"
                  onClick={() =>
                    open({ chip: "Recrutés de la cohorte", titre: `Cohorte ${row.label}`, sousTitre: `${row.effectif} conseillers entrés sur le trimestre, transactions à ce jour`, liste: membres(row.c, null, true) })
                  }
                >
                  {row.effectif}
                </button>
              </div>
              {row.cells.map((liste, i) => {
                const h = HORIZONS[i];
                if (!liste)
                  return (
                    <div key={h} data-cell className="dvtb-cell" style={{ ...cellStyle, color: T.muted, fontSize: 11 }} title="Horizon pas encore atteint">
                      ·
                    </div>
                  );
                const part = liste.length / row.effectif;
                const hint = !touched && row.c === 2 && h === 6;
                return (
                  <div key={h} data-cell className="dvtb-cell" style={cellStyle}>
                    <div style={{ position: "absolute", inset: "5px 4px", borderRadius: 10, background: heat(part), boxShadow: `inset 0 -${Math.round(part * 18)}px 0 rgba(27,191,160,.18)` }} />
                    <span style={{ position: "relative" }}>
                      {hint && (
                        <>
                          <span className="dvtb-tip">
                            <MousePointerClick size={11} aria-hidden /> Cliquez un nombre
                          </span>
                          <span className="dvtb-hint" />
                        </>
                      )}
                      {liste.length === 0 ? (
                        <span style={{ color: T.muted }}>0</span>
                      ) : (
                        <button
                          type="button"
                          className="dvtb-num"
                          style={{ fontWeight: part > 0.3 ? 600 : 400 }}
                          title="Voir les conseillers"
                          onClick={() =>
                            open({
                              chip: "Conseillers ayant transacté",
                              titre: `Cohorte ${row.label} · M+${h}`,
                              sousTitre: `${liste.length} conseillers sur ${row.effectif} recrutés ont transacté dans leurs ${h} premiers mois`,
                              liste,
                            })
                          }
                        >
                          {liste.length}
                        </button>
                      )}
                    </span>
                  </div>
                );
              })}
              <div data-cell className="dvtb-cell" style={cellStyle}>
                <button
                  type="button"
                  className="dvtb-num"
                  style={{ fontWeight: 600 }}
                  onClick={() =>
                    open({ chip: "Conseillers ayant transacté", titre: `Cohorte ${row.label} · à ce jour`, sousTitre: `${row.total.length} conseillers sur ${row.effectif} ont au moins une transaction`, liste: row.total })
                  }
                >
                  {row.total.length}
                </button>
              </div>
              <div data-cell className="dvtb-cell" style={cellStyle}>
                <span style={{ fontSize: 12, fontWeight: 600, color: TONE.ok.ink, background: TONE.ok.bg, borderRadius: 999, padding: "2px 9px", fontVariantNumeric: "tabular-nums" }}>
                  {Math.round((row.total.length / row.effectif) * 100)} %
                </span>
              </div>
            </div>
          ))}

          {/* Totaux : mêmes listes, toutes cohortes confondues */}
          <div className="dvtb-row">
            <div data-cell style={{ borderTop: `1.5px solid ${T.sapin}`, display: "flex", alignItems: "center", gap: 7, padding: "0 8px", fontWeight: 700 }}>
              <Sigma size={14} color={T.jadeCta} aria-hidden /> Total
            </div>
            <div data-cell className="dvtb-cell" style={{ borderTop: `1.5px solid ${T.sapin}` }}>
              <button type="button" className="dvtb-num" style={{ fontWeight: 700 }} onClick={() => open({ chip: "Recrutés", titre: "Toutes cohortes", sousTitre: `${totals.effectif} conseillers recrutés sur huit trimestres`, liste: membres(null, null, true) })}>
                {totals.effectif}
              </button>
            </div>
            {totals.cells.map((liste, i) => (
              <div key={HORIZONS[i]} data-cell className="dvtb-cell" style={{ borderTop: `1.5px solid ${T.sapin}` }}>
                <button
                  type="button"
                  className="dvtb-num"
                  style={{ fontWeight: 700 }}
                  onClick={() =>
                    open({
                      chip: "Conseillers ayant transacté",
                      titre: `Toutes cohortes · M+${HORIZONS[i]}`,
                      sousTitre: `Cohortes ayant atteint ${HORIZONS[i]} mois d'ancienneté`,
                      liste,
                    })
                  }
                >
                  {liste.length}
                </button>
              </div>
            ))}
            <div data-cell className="dvtb-cell" style={{ borderTop: `1.5px solid ${T.sapin}` }}>
              <button type="button" className="dvtb-num" style={{ fontWeight: 700 }} onClick={() => open({ chip: "Conseillers ayant transacté", titre: "Toutes cohortes · à ce jour", sousTitre: `${totals.total.length} conseillers sur ${totals.effectif}`, liste: totals.total })}>
                {totals.total.length}
              </button>
            </div>
            <div data-cell className="dvtb-cell" style={{ borderTop: `1.5px solid ${T.sapin}`, fontWeight: 700 }}>
              {Math.round((totals.total.length / totals.effectif) * 100)} %
            </div>
          </div>
        </div>
      </div>

      {portee && <Tiroir key={portee.titre} portee={portee} onClose={close} />}
    </div>
  );
}

/** Le tiroir : les noms derrière le nombre, filtrables, totaux recalculés sous la frappe. */
function Tiroir({ portee, onClose }: { portee: Portee; onClose: () => void }) {
  const [q, setQ] = useState("");
  const panel = useRef<HTMLDivElement>(null);
  const liste = useRef<HTMLUListElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const filtres = useMemo(() => {
    const needle = norm(q.trim());
    if (!needle) return portee.liste;
    return portee.liste.filter((m) => norm(`${m.person.first} ${m.person.last}`).includes(needle));
  }, [portee.liste, q]);
  const nb = filtres.reduce((s, m) => s + m.nb, 0);
  const ca = filtres.reduce((s, m) => s + m.ca, 0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    input.current?.focus({ preventScroll: true });
    if (panel.current && !prefersReducedMotion()) animate(panel.current, { x: [60, 0], opacity: [0, 1], duration: 420, ease: "out(4)" });
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // cascade rejouée à chaque recherche : on voit la liste bouger sous la frappe
  useEffect(() => {
    if (prefersReducedMotion() || !liste.current) return;
    const lignes = liste.current.querySelectorAll<HTMLElement>("[data-membre]");
    if (!lignes.length) return;
    animate(lignes, { opacity: [0, 1], y: [8, 0], duration: 320, delay: stagger(14, { start: 40 }), ease: "outQuad" });
  }, [filtres]);

  return (
    <>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 4, background: "rgba(26,52,49,.16)" }} />
      <div
        ref={panel}
        role="dialog"
        aria-label={portee.titre}
        style={{ position: "absolute", top: 12, right: 12, bottom: 12, width: 410, zIndex: 5, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 18, boxShadow: "0 24px 60px rgba(26,52,49,.22)", display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        <header style={{ flexShrink: 0, background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "16px 16px 12px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: TONE.neutral.ink, background: TONE.neutral.bg, borderRadius: 5, padding: "3px 7px" }}>
                <UserCheck size={11} aria-hidden /> {portee.chip}
              </span>
              <div style={{ marginTop: 6, fontSize: 19, fontWeight: 700, letterSpacing: "-.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{portee.titre}</div>
              <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>{portee.sousTitre}</div>
            </div>
            <button type="button" className="avw-x" aria-label="Fermer" onClick={onClose} style={{ borderRadius: 999 }}>
              <X size={15} aria-hidden />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 12 }}>
            <Total icon={Users} label="Conseillers" value={formatFr(filtres.length)} />
            <Total icon={Hash} label="Transactions" value={formatFr(nb)} />
            <Total icon={Coins} label="CA" value={nb ? `${formatFr(ca)} MAD` : "—"} />
          </div>
          <div style={{ position: "relative", marginTop: 10 }}>
            <Search size={14} color={T.muted} aria-hidden style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input ref={input} className="dvtb-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un conseiller (essayez « aicha »)" />
          </div>
        </header>
        <ul ref={liste} style={{ listStyle: "none", margin: 0, padding: "8px 8px", flex: 1, minHeight: 0, overflowY: "auto" }}>
          {filtres.map((m, i) => (
            <li key={m.person.id} data-membre className="dvtb-li">
              <span style={{ width: 22, flexShrink: 0, textAlign: "right", fontSize: 10.5, fontWeight: 600, color: T.muted, fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
              <Avatar person={m.person} size={30} />
              <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {m.person.first} {m.person.last}
                </span>
                <span style={{ fontSize: 10, color: T.muted }}>{m.person.city}</span>
              </span>
              <span style={{ flexShrink: 0, fontSize: 11, color: T.muted, fontVariantNumeric: "tabular-nums" }}>{m.ca ? `${formatFr(m.ca)} MAD` : "—"}</span>
              <span style={{ flexShrink: 0, minWidth: 26, textAlign: "center", fontSize: 11, fontWeight: 700, color: m.nb ? TONE.ok.ink : TONE.neutral.ink, background: m.nb ? TONE.ok.bg : TONE.neutral.bg, borderRadius: 999, padding: "2px 8px", fontVariantNumeric: "tabular-nums" }}>
                {m.nb}
              </span>
            </li>
          ))}
          {filtres.length === 0 && <li style={{ padding: "40px 12px", textAlign: "center", fontSize: 12, color: T.muted }}>Aucun conseiller ne correspond.</li>}
        </ul>
      </div>
    </>
  );
}

function Total({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", border: `1px solid ${T.border}`, background: T.bg, borderRadius: 11, padding: "6px 4px" }}>
      <span className="avw-label" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        <Icon size={11} color={T.jadeCta} aria-hidden /> {label}
      </span>
      <span style={{ marginTop: 2, fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}
