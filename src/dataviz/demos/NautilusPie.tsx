import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import {
  CalendarDays, ChevronLeft, ChevronRight, CornerDownRight, GraduationCap, Layers, Megaphone, MousePointerClick, PieChart, ScanSearch, Users, type LucideIcon,
} from "lucide-react";
import { ACCS, type Person } from "../../averroes/window/data/fiction";
import { Avatar } from "../../averroes/window/fx/Avatar";
import { CountUp, formatFr } from "../../averroes/window/fx/CountUp";
import { prefersReducedMotion } from "../../averroes/window/fx/reducedMotion";
import { T } from "../../averroes/window/theme";

/* Camembert « nautilus » : tranches triées par taille, chacune un peu plus haute que
   la précédente. Clic = un niveau plus bas, fil d'Ariane pour remonter. Données fictives. */

type Node = { label: string; value: number; color?: string; person?: Person; children?: Node[]; other?: boolean };
type Dataset = "recrutement" | "promo";
type Period = "annee" | "mois";

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

/* ---------- Jeu 1 : canaux › sources (libellés neutres) ---------- */
const SOURCES: [string, [string, number][]][] = [
  ["Canal A", [["Source 1", 34], ["Source 2", 27], ["Source 3", 22], ["Source 4", 19], ["Source 5", 14], ["Source 6", 9], ["Source 7", 7], ["Source 8", 5]]],
  ["Canal B", [["Source 1", 31], ["Source 2", 18], ["Source 3", 12], ["Source 4", 8], ["Source 5", 6], ["Source 6", 4], ["Source 7", 2]]],
  ["Canal C", [["Source 1", 38], ["Source 2", 11], ["Source 3", 6]]],
  ["Canal D", [["Source 1", 17], ["Source 2", 9]]],
  ["Canal E", [["Source 1", 8], ["Source 2", 5], ["Source 3", 3], ["Source 4", 2], ["Source 5", 2]]],
];

function recruitTree(period: Period): Node {
  const r = rng(period === "annee" ? 1 : 2026);
  const children = SOURCES.map(([label, events]) => {
    const kids = events
      .map(([l, v]) => ({ label: l, value: period === "annee" ? v : Math.round(v * (0.06 + r() * 0.14)) }))
      .filter((k) => k.value > 0);
    return { label, value: kids.reduce((a, k) => a + k.value, 0), children: kids };
  });
  return { label: period === "annee" ? "Année 2026" : "Octobre 2026", value: children.reduce((a, c) => a + c.value, 0), children };
}

/* ---------- Jeu 2 : par ACC (ACC › statut › profil, libellés neutres) ---------- */
const AVANCEMENT = [
  { label: "Statut A", color: T.jadeCta },
  { label: "Statut B", color: T.jade },
  { label: "Statut C", color: T.sapin },
];
function promoTree(): Node {
  const r = rng(20261102);
  const children = ACCS.map((acc, i) => {
    const kids = AVANCEMENT.map((a, j) => {
      const n = Math.max(2, Math.round((6 + r() * 14) * (j === 0 ? 1.1 : j === 1 ? 0.9 : 0.55) * (1 - i * 0.09)));
      const red = Math.max(1, Math.round(n * (0.15 + r() * 0.35)));
      return {
        label: a.label, value: n, color: a.color,
        children: [
          { label: "Profil 1", value: n - red, color: T.jadeCta },
          { label: "Profil 2", value: red, color: T.terracotta },
        ],
      };
    });
    return { label: `${acc.first} ${acc.last}`, person: acc, value: kids.reduce((a, k) => a + k.value, 0), children: kids };
  });
  return { label: "Cohorte", value: children.reduce((a, c) => a + c.value, 0), children };
}

const TREES = { annee: recruitTree("annee"), mois: recruitTree("mois"), promo: promoTree() };

const META: Record<Dataset, { title: string; icon: LucideIcon; levels: string[]; unit: string }> = {
  recrutement: { title: "Par canal", icon: Megaphone, levels: ["Canaux", "Sources"], unit: "recrues" },
  promo: { title: "Par ACC", icon: GraduationCap, levels: ["ACC", "Statut", "Profil"], unit: "conseillers" },
};

/* Palette du composant d'origine : charte, déclinée en clarté. */
const PAL = ["#1bbfa0", "#84c9bd", "#f18b76", "#ec6048", "#c03163", "#5fcdb3", "#3d6b64"];
const OTHER = "#9fb3ae";
const MAX_SLICES = 6;

/** Longue traîne : au-delà de six, les plus petits tombent dans « Autres », qui s'ouvre à son tour. */
function bucket(kids: Node[]): Node[] {
  const sorted = [...kids].sort((a, b) => b.value - a.value);
  if (sorted.length <= MAX_SLICES) return sorted;
  const head = sorted.slice(0, MAX_SLICES - 1);
  const tail = sorted.slice(MAX_SLICES - 1);
  return [...head, { label: `Autres (${tail.length})`, value: tail.reduce((a, k) => a + k.value, 0), children: tail, other: true }];
}

type Slice = Node & { fill: string; idx: number; a0: number; a1: number; outer: number; mid: number };
type View = { dataset: Dataset; period: Period; path: string[] };

/** Descend le chemin ; la couleur d'un niveau part du rang de son parent (deux enfants restent distincts). */
function resolve(v: View) {
  let node = v.dataset === "promo" ? TREES.promo : TREES[v.period];
  let base = 0;
  const trail: Node[] = [node];
  for (const label of v.path) {
    const kids = bucket(node.children ?? []);
    const i = kids.findIndex((k) => k.label === label);
    if (i < 0) break;
    base += i;
    node = kids[i];
    trail.push(node);
  }
  const kids = bucket(node.children ?? []).map((k, i) => ({ ...k, fill: k.color ?? (k.other ? OTHER : PAL[(base + i) % PAL.length]), idx: i }));
  return { node, trail, kids };
}

/* Géométrie : rayon intérieur 40 %, extérieur de 58 % à 96 %, angles cumulés en ordre croissant. */
const S = 600;
const C = S / 2;
const R = 272;
const INNER = 0.4 * R;

function layout(kids: (Node & { fill: string; idx: number })[]): Slice[] {
  const asc = [...kids].sort((a, b) => a.value - b.value);
  const total = asc.reduce((a, k) => a + k.value, 0) || 1;
  const n = asc.length;
  let acc = 0;
  return asc.map((k, i) => {
    const a0 = (acc / total) * Math.PI * 2;
    acc += k.value;
    const a1 = (acc / total) * Math.PI * 2;
    const outer = R * (n <= 1 ? 0.96 : 0.58 + (i * (0.96 - 0.58)) / (n - 1));
    return { ...k, a0, a1, outer, mid: (a0 + a1) / 2 };
  });
}

const pt = (r: number, a: number) => [C + r * Math.sin(a), C - r * Math.cos(a)] as const;
function sector(r0: number, r1: number, a0: number, a1: number) {
  if (a1 - a0 < 0.0005) return "";
  if (a1 - a0 >= Math.PI * 2 - 0.0001) a1 = a0 + Math.PI * 2 - 0.0001;
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const [x0, y0] = pt(r1, a0), [x1, y1] = pt(r1, a1), [x2, y2] = pt(r0, a1), [x3, y3] = pt(r0, a0);
  return `M${x0},${y0} A${r1},${r1} 0 ${large} 1 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 ${large} 0 ${x3},${y3} Z`;
}

const CSS = `
.dvnp-root{height:100%;width:100%;display:flex;flex-direction:column;padding:16px 20px 14px;gap:12px;box-sizing:border-box}
.dvnp-row{display:grid;grid-template-columns:12px minmax(0,1fr) auto;align-items:center;gap:9px;width:100%;border:0;background:transparent;color:var(--tx);font:400 12.5px/1.25 ${T.font};padding:7px 8px;border-radius:9px;text-align:left;cursor:pointer;transition:background .2s}
.dvnp-row:hover,.dvnp-row[data-on=true]{background:rgb(var(--ink) / .06)}
.dvnp-row:disabled{cursor:default}
.dvnp-crumb{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--bd);background:transparent;color:var(--mu);border-radius:999px;padding:4px 10px;font:400 11.5px/1.2 ${T.font};cursor:pointer;white-space:nowrap}
.dvnp-crumb:hover{color:var(--tx);border-color:${T.jadeCta}}
.dvnp-crumb[aria-current=true]{color:var(--tx);font-weight:600;background:var(--js);border-color:transparent;cursor:default}
.dvnp-slice{cursor:pointer;transition:transform .28s cubic-bezier(.2,.8,.2,1),opacity .25s}
`;

export function NautilusPie() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ dataset: "recrutement", period: "annee", path: [] });
  const [p, setP] = useState(() => (prefersReducedMotion() ? 1 : 0));
  const [hover, setHover] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const box = useRef({ p: 0 });
  const anim = useRef<{ pause: () => unknown } | null>(null);

  const { node, trail, kids } = useMemo(() => resolve(view), [view]);
  const slices = useMemo(() => layout(kids), [kids]);
  const total = node.value;
  const meta = META[view.dataset];
  const depth = view.path.length;
  const leafLevel = kids.every((k) => !k.children?.length);

  // Entrée : balayage horaire + croissance des rayons, puis la légende en cascade.
  useEffect(() => {
    if (prefersReducedMotion()) {
      setP(1);
      return;
    }
    anim.current?.pause();
    box.current.p = 0;
    setP(0);
    anim.current = animate(box.current, { p: 1, duration: 900, ease: "out(3)", onUpdate: () => setP(box.current.p) });
    const rows = rootRef.current?.querySelectorAll(".dvnp-row, .dvnp-prev");
    const b = rows?.length ? animate(rows, { opacity: [0, 1], x: [-10, 0], duration: 480, delay: stagger(45, { start: 120 }), ease: "out(3)" }) : null;
    return () => {
      anim.current?.pause();
      b?.revert();
    };
  }, [view]);

  // Sortie : le disque se replie avant que le niveau suivant ne se déploie.
  const go = useCallback((next: View) => {
    setHover(null);
    setPicked(null);
    if (prefersReducedMotion()) return setView(next);
    anim.current?.pause();
    anim.current = animate(box.current, { p: 0, duration: 280, ease: "in(2)", onUpdate: () => setP(box.current.p), onComplete: () => setView(next) });
  }, []);

  const select = (s: Node) => {
    if (s.children?.length) go({ ...view, path: [...view.path, s.label] });
    else setPicked((x) => (x === s.label ? null : s.label));
  };

  const sweep = p * Math.PI * 2;
  const grow = Math.min(1, p * 1.15);
  const hovered = slices.find((s) => s.label === hover) ?? null;
  const focus = hovered ?? slices.find((s) => s.label === picked) ?? null;
  const preview = focus ?? [...slices].sort((a, b) => b.value - a.value)[0];
  const previewKids = preview?.children?.length ? bucket(preview.children) : [];
  const previewMax = Math.max(1, ...previewKids.map((k) => k.value));
  const dim = (s: Slice) => (hover ?? picked) !== null && s.label !== (hover ?? picked);
  const Icon = meta.icon;

  return (
    <div ref={rootRef} className="avw-card dvnp-root" style={{ fontFamily: T.font, color: T.text }}>
      <style>{CSS}</style>

      {/* En-tête : jeu de données, période, fil d'Ariane */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div className="avw-card-h" style={{ flexShrink: 0 }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, background: T.jadeSoft, color: T.jadeCta, display: "grid", placeItems: "center" }}>
            <PieChart size={15} strokeWidth={1.8} aria-hidden />
          </span>
          Répartition en nautilus
        </div>
        <div className="avw-chips" style={{ marginBottom: 0, marginLeft: 8 }}>
          {(Object.keys(META) as Dataset[]).map((d) => {
            const I = META[d].icon;
            return (
              <button key={d} type="button" aria-pressed={view.dataset === d} onClick={() => view.dataset !== d && go({ dataset: d, period: view.period, path: [] })} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <I size={13} aria-hidden /> {META[d].title}
              </button>
            );
          })}
        </div>
        {view.dataset === "recrutement" && (
          <div className="avw-chips" style={{ marginBottom: 0, marginLeft: "auto" }}>
            {([["annee", "Année 2026"], ["mois", "Octobre"]] as [Period, string][]).map(([k, l]) => (
              <button key={k} type="button" aria-pressed={view.period === k} onClick={() => view.period !== k && go({ ...view, period: k, path: [] })} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <CalendarDays size={13} aria-hidden /> {l}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, minHeight: 28 }}>
        <button type="button" className="dvnp-crumb" disabled={!depth} onClick={() => depth && go({ ...view, path: view.path.slice(0, -1) })} style={{ opacity: depth ? 1 : 0.4, cursor: depth ? "pointer" : "default" }} aria-label="Niveau précédent">
          <ChevronLeft size={13} aria-hidden /> Retour
        </button>
        {trail.map((t, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            {i > 0 && <ChevronRight size={12} color={T.muted} aria-hidden />}
            <button type="button" className="dvnp-crumb" aria-current={i === depth} onClick={() => i !== depth && go({ ...view, path: view.path.slice(0, i) })}>
              {t.person && <Avatar person={t.person} size={18} />}
              {t.label}
              <b style={{ fontVariantNumeric: "tabular-nums" }}>{formatFr(t.value)}</b>
            </button>
          </span>
        ))}
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, color: T.muted }}>
          <MousePointerClick size={13} aria-hidden /> {leafLevel ? "Dernier niveau : clic = sélection" : "Clic sur une tranche pour détailler"}
        </span>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 18 }}>
        {/* Légende : du plus grand au plus petit, cliquable comme les tranches */}
        <div style={{ width: 272, flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 4 }}>
          <div className="avw-label" style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 8, marginBottom: 4 }}>
            <Layers size={11} aria-hidden /> {meta.levels[Math.min(depth, meta.levels.length - 1)]}
          </div>
          {kids.map((k) => {
            const pct = total ? (k.value / total) * 100 : 0;
            return (
              <button
                key={k.label}
                type="button"
                className="dvnp-row"
                data-on={k.label === (hover ?? picked)}
                onMouseEnter={() => setHover(k.label)}
                onMouseLeave={() => setHover(null)}
                onClick={() => select(k)}
              >
                <span style={{ width: 12, height: 12, borderRadius: 3, background: k.fill }} />
                <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                    {k.person && <Avatar person={k.person} size={20} />}
                    <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k.label}</span>
                    {k.children?.length ? <CornerDownRight size={11} color={T.muted} style={{ flexShrink: 0 }} aria-hidden /> : null}
                  </span>
                  <span style={{ height: 3, borderRadius: 2, background: "rgb(var(--ink) / .07)", overflow: "hidden" }}>
                    <i style={{ display: "block", height: "100%", width: `${pct * grow}%`, background: k.fill, borderRadius: 2 }} />
                  </span>
                </span>
                <span style={{ fontVariantNumeric: "tabular-nums", color: T.muted, whiteSpace: "nowrap" }}>
                  <b style={{ color: T.text }}>{formatFr(k.value)}</b> · {Math.round(pct)} %
                </span>
              </button>
            );
          })}
          <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 8, paddingTop: 10, paddingLeft: 8, display: "flex", alignItems: "baseline", gap: 8 }}>
            <Users size={14} color={T.jadeCta} aria-hidden style={{ alignSelf: "center" }} />
            <span style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              <CountUp value={total} duration={900} />
            </span>
            <span style={{ fontSize: 12, color: T.muted }}>{meta.unit} à ce niveau</span>
          </div>
        </div>

        {/* Disque : chaque tranche a son propre rayon extérieur */}
        <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
          <svg viewBox={`0 0 ${S} ${S}`} width="100%" height="100%" style={{ position: "absolute", inset: 0, display: "block", overflow: "visible" }} role="img" aria-label={`${meta.title} : ${node.label}`}>
            <g transform={`rotate(${(1 - p) * -50} ${C} ${C})`}>
              {slices.map((s) => {
                const a0 = Math.min(s.a0, sweep), a1 = Math.min(s.a1, sweep);
                const outer = INNER + (s.outer - INNER) * grow;
                const lift = s.label === hover ? 12 : 0;
                const dx = Math.sin(s.mid) * lift, dy = -Math.cos(s.mid) * lift;
                return (
                  <path
                    key={s.label}
                    className="dvnp-slice"
                    d={sector(INNER, outer + (lift ? 6 : 0), a0, a1)}
                    fill={s.fill}
                    stroke={T.surface}
                    strokeWidth={2.5}
                    strokeLinejoin="round"
                    opacity={dim(s) ? 0.38 : 1}
                    style={{ transform: `translate(${dx}px, ${dy}px)` }}
                    onMouseEnter={() => setHover(s.label)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => select(s)}
                  />
                );
              })}
            </g>
            <g pointerEvents="none" style={{ opacity: p > 0.94 ? 1 : 0, transition: "opacity .35s" }}>
              {slices.filter((s) => s.a1 - s.a0 > 0.2).map((s) => {
                const lift = s.label === hover ? 12 : 0;
                const [x, y] = pt((INNER + s.outer) / 2 + lift, s.mid);
                return (
                  <text key={s.label} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="15" fontWeight="700" fill="#fff" style={{ transition: "all .28s" }}>
                    {formatFr(s.value)}
                  </text>
                );
              })}
            </g>
            <circle cx={C} cy={C} r={INNER - 6} fill={T.surface} />
            <text x={C} y={C - 6} textAnchor="middle" fontSize={focus ? 34 : 40} fontWeight="700" fill={T.text} style={{ fontVariantNumeric: "tabular-nums" }}>
              {formatFr(focus ? focus.value : Math.round(total * p))}
            </text>
            <text x={C} y={C + 20} textAnchor="middle" fontSize="13" fill={T.muted}>
              {focus ? (focus.label.length > 20 ? focus.label.slice(0, 19) + "…" : focus.label) : meta.unit}
            </text>
            <text x={C} y={C + 38} textAnchor="middle" fontSize="11.5" fill={focus ? T.jadeInk : T.muted} fontWeight={focus ? 600 : 400}>
              {focus ? `${Math.round((focus.value / total) * 100)} % du niveau` : node.label}
            </text>
          </svg>
        </div>

        {/* Colonne de droite : la pile des niveaux et l'aperçu de celui d'en dessous */}
        <div style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12, justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div className="avw-label" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <Icon size={11} aria-hidden /> Niveaux · {meta.title}
            </div>
            {meta.levels.map((l, i) => {
              const on = i === depth, done = i < depth;
              return (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: on ? T.text : T.muted, fontWeight: on ? 600 : 400, padding: "4px 0" }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, flexShrink: 0,
                    background: on ? T.jadeCta : done ? T.jadeSoft : "rgb(var(--ink) / .07)", color: on ? "#fff" : done ? T.jadeInk : T.muted, transition: "all .3s",
                  }}>{i + 1}</span>
                  {l}
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="avw-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <ScanSearch size={11} aria-hidden /> Aperçu du niveau suivant
            </div>
            {preview && (
              <div className="dvnp-prev" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, minWidth: 0 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: preview.fill, flexShrink: 0 }} />
                {preview.person && <Avatar person={preview.person} size={22} />}
                <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{preview.label}</span>
              </div>
            )}
            {previewKids.length ? (
              previewKids.map((k) => (
                <div key={k.label} className="dvnp-prev" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 34px", gap: 8, alignItems: "center", fontSize: 11.5 }}>
                  <span style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: T.muted }}>{k.label}</span>
                    <span style={{ height: 6, borderRadius: 3, background: "rgb(var(--ink) / .06)", overflow: "hidden" }}>
                      <i style={{ display: "block", height: "100%", width: `${(k.value / previewMax) * 100 * grow}%`, background: k.color ?? (k.other ? OTHER : preview.fill), borderRadius: 3, transition: "width .4s" }} />
                    </span>
                  </span>
                  <b style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatFr(k.value)}</b>
                </div>
              ))
            ) : (
              <div className="dvnp-prev" style={{ fontSize: 12, color: T.muted, lineHeight: 1.45 }}>
                Dernier niveau atteint : la tranche choisie se met en avant, les autres s'estompent.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
