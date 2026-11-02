import { useEffect, useLayoutEffect, useRef, useState, type DragEvent, type ReactNode, type RefObject } from "react";
import { animate, stagger, waapi } from "animejs";
import {
  CalendarClock,
  ChartColumnStacked,
  FileSignature,
  GripVertical,
  LayoutDashboard,
  MapPin,
  Megaphone,
  RotateCcw,
  Tags,
  UserRound,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { ACCS, MONTHS, type Person } from "../../averroes/window/data/fiction";
import { Avatar } from "../../averroes/window/fx/Avatar";
import { formatFr } from "../../averroes/window/fx/CountUp";
import { prefersReducedMotion } from "../../averroes/window/fx/reducedMotion";
import { useEntrance } from "../../averroes/window/fx/useEntrance";
import { SERIES, T } from "../../averroes/window/theme";

/* Fiche ACC en bento : publications empilées par mois, âge du portefeuille en jauges,
   comparatif des ACC en colonnes. Blocs réordonnables (glisser) et redimensionnables
   (S / M / L), la grille se recompose en FLIP. Données entièrement fictives. */

/* ---------- Données fictives (graine fixe) ---------- */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = seeded(77031);
const between = (a: number, b: number) => a + rnd() * (b - a);
const int = (a: number, b: number) => Math.floor(between(a, b + 1));

/** Répartit un total entier selon des poids, sans perdre d'unité. */
function split(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (total * w) / sum);
  const out = raw.map(Math.floor);
  let rest = total - out.reduce((a, b) => a + b, 0);
  raw
    .map((v, i) => ({ i, f: v - Math.floor(v) }))
    .sort((a, b) => b.f - a.f)
    .forEach(({ i }) => {
      if (rest-- > 0) out[i]++;
    });
  return out;
}

const CITY_ORDER = ["Casablanca", "Rabat", "Marrakech", "Tanger", "Agadir", "Fès"] as const;

type AccData = {
  acc: Person;
  totals: number[];
  tx: number[][]; // [vente, location]
  source: number[][]; // [conseiller, plateforme]
  region: number[][]; // [casa, rabat, marrakech, tanger, autres]
  dom: [number, number, number];
  kpi: { pub: number; mandats: number; actifs: number };
};

const DATA: AccData[] = ACCS.map((acc, k) => {
  const totals = MONTHS.map((_, i) => Math.max(8, Math.round(34 + Math.sin(i / 1.7 + k) * 15 + k * 3 + between(0, 14))));
  const tx: number[][] = [[], []];
  const source: number[][] = [[], []];
  const region: number[][] = [[], [], [], [], []];
  const home = CITY_ORDER.indexOf(acc.city);
  totals.forEach((t, i) => {
    const vente = between(0.52, 0.76);
    split(t, [vente, 1 - vente]).forEach((v, j) => tx[j].push(v));
    const cons = between(0.58, 0.82);
    split(t, [cons, 1 - cons]).forEach((v, j) => source[j].push(v));
    const w = CITY_ORDER.map((_, c) => (c === home ? 5 : 1) * between(0.5, 1.5) + (c === 0 ? 1.2 : 0));
    const cities = split(t, w);
    [cities[0], cities[1], cities[2], cities[3], cities[4] + cities[5]].forEach((v, j) => region[j].push(v));
  });
  const pub = totals.reduce((a, b) => a + b, 0);
  return {
    acc,
    totals,
    tx,
    source,
    region,
    dom: [int(48, 120), int(22, 64), int(9, 46)],
    kpi: { pub, mandats: Math.round(pub * between(0.17, 0.31)), actifs: int(18, 46) },
  };
});

/* ---------- Animation : rampe et morph de barres ---------- */
/** Rampe cubic-out de la valeur affichée vers la cible (depuis la valeur courante). */
function useRamp(target: number, ms = 750, delay = 0): number {
  const [v, setV] = useState(() => (prefersReducedMotion() ? target : 0));
  const cur = useRef(v);
  useEffect(() => {
    if (prefersReducedMotion()) {
      cur.current = target;
      setV(target);
      return;
    }
    const from = cur.current;
    const t0 = performance.now() + delay;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.max(0, Math.min(1, (now - t0) / ms));
      const x = from + (target - from) * (1 - Math.pow(1 - t, 3));
      cur.current = x;
      setV(x);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, delay]);
  return v;
}

/** Colonnes [data-bar] : de leur hauteur précédente à la nouvelle (zéro au premier rendu). */
function useBarMorph(pcts: number[]) {
  const root = useRef<HTMLDivElement>(null);
  const prev = useRef<number[] | null>(null);
  const sig = pcts.join(",");
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const bars = Array.from(el.querySelectorAll<HTMLElement>("[data-bar]"));
    const first = prev.current === null;
    const from = prev.current ?? pcts.map(() => 0);
    prev.current = pcts;
    bars.forEach((b, i) => {
      b.style.height = `${pcts[i]}%`;
      if (prefersReducedMotion()) return;
      waapi.animate(b, { height: [`${from[i] ?? 0}%`, `${pcts[i]}%`], duration: 750, delay: first ? 300 + i * 60 : 0, ease: "out(3)" });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);
  return root;
}

function useHeight(ref: RefObject<HTMLElement | null>): number {
  const [h, setH] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return h;
}

function niceMax(m: number): number {
  const raw = Math.max(1, m) / 4;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = ([1, 2, 2.5, 5, 10].find((s) => s * mag >= raw) ?? 10) * mag;
  return step * 4;
}

/* ---------- Grille : tailles, en-tête de bloc ---------- */
type Size = "S" | "M" | "L";
type BlockId = "pub" | "dom" | "acc";
type Layout = { order: BlockId[]; sizes: Record<BlockId, Size> };
const SPAN: Record<Size, number> = { S: 1, M: 2, L: 3 };
const SIZE_TITLE: Record<Size, string> = { S: "Petit", M: "Moyen", L: "Grand" };
const DEFAULT_LAYOUT: Layout = { order: ["pub", "dom", "acc"], sizes: { pub: "M", dom: "S", acc: "L" } };

/** Rangées de trois colonnes remplies dans l'ordre ; un bloc qui déborde ouvre la suivante. */
function pack(l: Layout): BlockId[][] {
  const rows: BlockId[][] = [];
  let row: BlockId[] = [];
  let cap = 0;
  for (const id of l.order) {
    const s = SPAN[l.sizes[id]];
    if (row.length && cap + s > 3) {
      rows.push(row);
      row = [];
      cap = 0;
    }
    row.push(id);
    cap += s;
  }
  if (row.length) rows.push(row);
  return rows;
}

type HeadCtl = {
  size: Size;
  onSize: (s: Size) => void;
  onDragStart: (e: DragEvent<HTMLSpanElement>) => void;
  onDragEnd: () => void;
};

function BlockHead({ icon: Icon, title, ctl, children }: { icon: LucideIcon; title: string; ctl: HeadCtl; children?: ReactNode }) {
  return (
    <div className="dvacc-head">
      <span className="dvacc-pastille">
        <Icon size={14} strokeWidth={1.9} aria-hidden />
      </span>
      <span className="dvacc-title">{title}</span>
      <span className="dvacc-ctl">
        {children}
        <span className="dvacc-sizes" role="group" aria-label="Taille du bloc">
          {(["S", "M", "L"] as Size[]).map((s) => (
            <button key={s} type="button" title={SIZE_TITLE[s]} aria-pressed={ctl.size === s} onClick={() => ctl.onSize(s)}>
              {s}
            </button>
          ))}
        </span>
        <span className="dvacc-grip" draggable onDragStart={ctl.onDragStart} onDragEnd={ctl.onDragEnd} title="Glisser pour déplacer" aria-label="Déplacer le bloc">
          <GripVertical size={14} aria-hidden />
        </span>
      </span>
    </div>
  );
}

/* ---------- Bloc 1 : publications par mois, empilées ---------- */
type Serie = { name: string; color: string; values: number[] };
const DIMS: { key: string; label: string; icon: LucideIcon; series: (d: AccData) => Serie[] }[] = [
  {
    key: "tx",
    label: "Type",
    icon: Tags,
    series: (d) => [
      { name: "Vente", color: SERIES[0], values: d.tx[0] },
      { name: "Location", color: SERIES[1], values: d.tx[1] },
    ],
  },
  {
    key: "source",
    label: "Source",
    icon: UserRound,
    series: (d) => [
      { name: "Conseiller", color: SERIES[0], values: d.source[0] },
      { name: "Plateforme", color: SERIES[3], values: d.source[1] },
    ],
  },
  {
    key: "region",
    label: "Région",
    icon: MapPin,
    series: (d) => [
      { name: "Casablanca", color: SERIES[0], values: d.region[0] },
      { name: "Rabat", color: SERIES[1], values: d.region[1] },
      { name: "Marrakech", color: SERIES[2], values: d.region[2] },
      { name: "Tanger", color: SERIES[3], values: d.region[3] },
      { name: "Autres", color: SERIES[4], values: d.region[4] },
    ],
  },
];
const SLOTS = 5;

function PubBlock({ data, ctl }: { data: AccData; ctl: HeadCtl }) {
  const [dimKey, setDimKey] = useState("tx");
  const [focus, setFocus] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const plotH = useHeight(areaRef);
  const dim = DIMS.find((d) => d.key === dimKey) ?? DIMS[0];
  const series = dim.series(data);
  const max = niceMax(Math.max(...data.totals));
  const ticks = [0, 1, 2, 3, 4].map((k) => (max / 4) * k);
  const compact = ctl.size === "S";
  const n = MONTHS.length;

  // Entrée : chaque pile monte depuis l'axe, en cascade.
  useEffect(() => {
    const el = areaRef.current;
    if (!el || prefersReducedMotion()) return;
    const a = animate(el.querySelectorAll(".dvacc-stack, .dvacc-total"), {
      scaleY: [0, 1],
      opacity: [0, 1],
      duration: 700,
      delay: stagger(45, { start: 250 }),
      ease: "out(3)",
    });
    return () => {
      a.revert();
    };
  }, []);

  // Panneau de détail : glisse depuis la droite à l'ouverture.
  const open = focus != null;
  useEffect(() => {
    if (!open || !panelRef.current || prefersReducedMotion()) return;
    const a = animate(panelRef.current, { opacity: [0, 1], x: [24, 0], duration: 420, ease: "out(3)" });
    return () => {
      a.pause();
    };
  }, [open]);

  const focusTotal = focus != null ? data.totals[focus] : 0;
  const tipShift = (i: number) => (i === 0 ? "-18%" : i === n - 1 ? "-82%" : "-50%");

  return (
    <>
      <BlockHead icon={ChartColumnStacked} title="Publications par mois" ctl={ctl}>
        <span className="dvacc-seg" role="group" aria-label="Dimension">
          {DIMS.map((d) => (
            <button key={d.key} type="button" aria-pressed={d.key === dimKey} onClick={() => setDimKey(d.key)} title={d.label}>
              <d.icon size={12} aria-hidden />
              {!compact && d.label}
            </button>
          ))}
        </span>
      </BlockHead>
      <div className="dvacc-legend">
        {series.map((s) => (
          <span key={s.name}>
            <i style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
        {!compact && <em>Cliquez un mois pour le détailler</em>}
      </div>
      <div className="dvacc-pubbody">
        <div className="dvacc-plot">
          <div className="dvacc-yaxis">
            {ticks.map((t) => (
              <span key={t} style={{ bottom: `${(t / max) * 100}%` }}>
                {formatFr(t)}
              </span>
            ))}
          </div>
          <div className="dvacc-area" ref={areaRef} onMouseLeave={() => setHover(null)}>
            {ticks.map((t) => (
              <i key={t} className="dvacc-gridline" style={{ bottom: `${(t / max) * 100}%` }} />
            ))}
            <div className="dvacc-cols">
              {data.totals.map((total, i) => {
                const h = (total / max) * 100;
                const dim2 = focus != null && focus !== i;
                return (
                  <button
                    key={i}
                    type="button"
                    className="dvacc-col"
                    style={{ opacity: dim2 ? 0.22 : 1 }}
                    onClick={() => setFocus((f) => (f === i ? null : i))}
                    onMouseEnter={() => setHover(i)}
                    aria-pressed={focus === i}
                    aria-label={`${MONTHS[i]} : ${total} publications`}
                  >
                    <span className="dvacc-total" style={{ bottom: `calc(${h}% + 3px)` }}>
                      {formatFr(total)}
                    </span>
                    <span className="dvacc-stack" style={{ height: `${h}%` }}>
                      {Array.from({ length: SLOTS }, (_, j) => {
                        const s = series[j];
                        const v = s ? s.values[i] : 0;
                        const segPx = (v / max) * plotH;
                        return (
                          <span key={j} className="dvacc-seg-bar" style={{ height: `${total ? (v / total) * 100 : 0}%`, background: s?.color ?? "transparent" }}>
                            {segPx >= 14 && v > 0 ? v : ""}
                          </span>
                        );
                      })}
                    </span>
                  </button>
                );
              })}
            </div>
            {hover != null && hover !== focus && (
              <div className="dvacc-tip" style={{ left: `${((hover + 0.5) / n) * 100}%`, transform: `translateX(${tipShift(hover)})` }}>
                <b>
                  {MONTHS[hover]} · {formatFr(data.totals[hover])}
                </b>
                {series.map((s) => (
                  <span key={s.name}>
                    <i style={{ background: s.color }} />
                    {s.name}
                    <em>{s.values[hover]}</em>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="dvacc-xaxis">
            {MONTHS.map((m, i) => (
              <span key={m} style={{ fontWeight: focus === i ? 600 : 400, color: focus === i ? T.text : undefined }}>
                {m}
              </span>
            ))}
          </div>
        </div>
        {focus != null && (
          <div className="dvacc-panel" ref={panelRef} style={{ width: compact ? 138 : 176 }}>
            <div className="dvacc-panel-h">
              <dim.icon size={13} color={T.jadeCta} aria-hidden />
              <span>
                <b>{MONTHS[focus]}</b>
                <small>{formatFr(focusTotal)} publications</small>
              </span>
              <button type="button" onClick={() => setFocus(null)} aria-label="Fermer le détail">
                <X size={12} aria-hidden />
              </button>
            </div>
            {series.map((s) => {
              const v = s.values[focus];
              const pct = focusTotal ? Math.round((v / focusTotal) * 100) : 0;
              return (
                <div key={s.name} className="dvacc-prow">
                  <span>
                    <i style={{ background: s.color }} />
                    {s.name}
                    <b>{v}</b>
                    <em>{pct} %</em>
                  </span>
                  <span className="dvacc-ptrack">
                    <span style={{ width: `${pct}%`, background: s.color }} />
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

/* ---------- Bloc 2 : âge du portefeuille, trois jauges ---------- */
const BRACKETS = [
  { label: "< 3 mois", color: T.jadeCta },
  { label: "3–6 mois", color: T.terracotta },
  { label: "> 6 mois", color: T.rose },
];

/** Jauge en anneau : arc coloré = part, arc de fond séparé par deux petits écarts. */
function Arc({ value, color }: { value: number; color: string }) {
  const r = 45;
  const C = 2 * Math.PI * r;
  const gap = 5;
  const v = Math.max(0, Math.min(100, value));
  const rest = v === 0 ? 100 : 100 - v - 2 * gap;
  return (
    <svg viewBox="0 0 100 100" className="dvacc-arc" aria-hidden>
      {rest > 0.5 && (
        <circle cx={50} cy={50} r={r} fill="none" stroke="rgb(var(--ink) / .08)" strokeWidth={10} strokeLinecap="round" strokeDasharray={`${(C * rest) / 100} ${C}`} transform={`rotate(${-90 + (v === 0 ? 0 : (v + gap) * 3.6)} 50 50)`} />
      )}
      {v > 0 && <circle cx={50} cy={50} r={r} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${(C * v) / 100} ${C}`} transform="rotate(-90 50 50)" />}
    </svg>
  );
}

function GaugeCell({ count, total, label, color, delay }: { count: number; total: number; label: string; color: string; delay: number }) {
  const pct = total ? (count / total) * 100 : 0;
  const animPct = useRamp(pct, 800, delay);
  const animCount = useRamp(count, 800, delay);
  return (
    <div className="dvacc-gcell">
      <div className="dvacc-gbox" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <Arc value={animPct} color={color} />
        <span className="dvacc-gval">
          <b style={{ color }}>{formatFr(Math.round(animCount))}</b>
          <small>biens</small>
        </span>
      </div>
      <span className="dvacc-glab">
        <i style={{ background: color }} />
        {label}
        <em>{Math.round(animPct)} %</em>
      </span>
    </div>
  );
}

function DomBlock({ data, ctl }: { data: AccData; ctl: HeadCtl }) {
  const total = data.dom[0] + data.dom[1] + data.dom[2];
  const shown = useRamp(total);
  return (
    <>
      <BlockHead icon={CalendarClock} title="Âge du portefeuille" ctl={ctl}>
        <span className="dvacc-pill">
          <Megaphone size={11} aria-hidden /> {formatFr(Math.round(shown))} publiés
        </span>
      </BlockHead>
      <div className="dvacc-gauges">
        {BRACKETS.map((b, i) => (
          <GaugeCell key={b.label} count={data.dom[i]} total={total} label={b.label} color={b.color} delay={200 + i * 120} />
        ))}
      </div>
    </>
  );
}

/* ---------- Bloc 3 : comparatif des ACC, colonnes verticales ---------- */
const METRICS: { key: keyof AccData["kpi"]; label: string; icon: LucideIcon }[] = [
  { key: "pub", label: "Publications", icon: Megaphone },
  { key: "mandats", label: "Mandats", icon: FileSignature },
  { key: "actifs", label: "Conseillers actifs", icon: UsersRound },
];

function ColValue({ v }: { v: number }) {
  return <>{formatFr(Math.round(useRamp(v, 750)))}</>;
}

function AccBlock({ selected, onSelect, ctl }: { selected: string; onSelect: (id: string) => void; ctl: HeadCtl }) {
  const [metric, setMetric] = useState<keyof AccData["kpi"]>("pub");
  const values = DATA.map((d) => d.kpi[metric]);
  const max = niceMax(Math.max(...values));
  const heights = values.map((v) => Math.min(100, (v / max) * 100));
  const ref = useBarMorph(heights);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const compact = ctl.size === "S";
  return (
    <>
      <BlockHead icon={UsersRound} title="Comparatif des ACC" ctl={ctl}>
        {!compact && (
          <span className="dvacc-pill">
            moyenne <b>{formatFr(Math.round(avg))}</b>
          </span>
        )}
        <span className="dvacc-seg" role="group" aria-label="Indicateur">
          {METRICS.map((m) => (
            <button key={m.key} type="button" aria-pressed={m.key === metric} onClick={() => setMetric(m.key)} title={m.label}>
              <m.icon size={12} aria-hidden />
              {!compact && m.label}
            </button>
          ))}
        </span>
      </BlockHead>
      <div className="dvacc-accs" ref={ref}>
        {DATA.map((d, i) => {
          const on = d.acc.id === selected;
          return (
            <button key={d.acc.id} type="button" className="dvacc-acc" data-on={on || undefined} onClick={() => onSelect(d.acc.id)} title={`${d.acc.first} ${d.acc.last} · ${formatFr(values[i])}`}>
              <span className="dvacc-accv">
                <ColValue v={values[i]} />
              </span>
              <span className="dvacc-track">
                <span data-bar className="dvacc-bar" style={{ background: on ? T.jadeCta : T.jade }} />
              </span>
              <span className="dvacc-accfoot">
                <Avatar person={d.acc} size={compact ? 22 : 26} dark={on} />
                <span>{d.acc.first}</span>
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ---------- Bandeau : identité de l'ACC, choix, trois chiffres ---------- */
function Kpi({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  const v = useRamp(value, 800, 150);
  return (
    <span className="dvacc-kpi">
      <span className="dvacc-pastille">
        <Icon size={13} strokeWidth={1.9} aria-hidden />
      </span>
      <span>
        <b>{formatFr(Math.round(v))}</b>
        <small>{label}</small>
      </span>
    </span>
  );
}

/* ---------- Composant ---------- */
export function AccDashboard() {
  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(ACCS[0].id);
  const [layout, setLayout] = useState<Layout>(DEFAULT_LAYOUT);
  const [dragging, setDragging] = useState<BlockId | null>(null);
  const [over, setOver] = useState<BlockId | null>(null);
  const rects = useRef<Map<string, { x: number; y: number; w: number; h: number }> | null>(null);
  const data = DATA.find((d) => d.acc.id === selected) ?? DATA[0];

  useEntrance(rootRef, ".dvacc-strip, .dvacc-card", { y: 16 });

  // FLIP : on photographie les blocs avant le changement, puis on rejoue l'écart.
  const change = (next: Layout) => {
    const m = new Map<string, { x: number; y: number; w: number; h: number }>();
    gridRef.current?.querySelectorAll<HTMLElement>("[data-block]").forEach((el) => m.set(el.dataset.block ?? "", { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight }));
    rects.current = m;
    setLayout(next);
  };
  useLayoutEffect(() => {
    const prev = rects.current;
    rects.current = null;
    if (!prev || prefersReducedMotion()) return;
    gridRef.current?.querySelectorAll<HTMLElement>("[data-block]").forEach((el) => {
      const p = prev.get(el.dataset.block ?? "");
      if (!p || !el.offsetWidth || !el.offsetHeight) return;
      const dx = p.x - el.offsetLeft;
      const dy = p.y - el.offsetTop;
      const sx = p.w / el.offsetWidth;
      const sy = p.h / el.offsetHeight;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) return;
      el.style.transformOrigin = "0 0";
      animate(el, { x: [dx, 0], y: [dy, 0], scaleX: [sx, 1], scaleY: [sy, 1], opacity: 1, duration: 560, ease: "out(4)" });
    });
  }, [layout]);

  const ctlFor = (id: BlockId): HeadCtl => ({
    size: layout.sizes[id],
    onSize: (s) => {
      if (s !== layout.sizes[id]) change({ ...layout, sizes: { ...layout.sizes, [id]: s } });
    },
    onDragStart: (e) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", id);
      const card = (e.currentTarget as HTMLElement).closest<HTMLElement>("[data-block]");
      if (card) e.dataTransfer.setDragImage(card, 24, 18);
      setDragging(id);
    },
    onDragEnd: () => {
      setDragging(null);
      setOver(null);
    },
  });

  // Dépôt sur un bloc : les deux échangent leur place.
  const drop = (target: BlockId) => {
    if (!dragging || dragging === target) return;
    const order = [...layout.order];
    const a = order.indexOf(dragging);
    const b = order.indexOf(target);
    [order[a], order[b]] = [order[b], order[a]];
    change({ ...layout, order });
    setDragging(null);
    setOver(null);
  };

  const customized = JSON.stringify(layout) !== JSON.stringify(DEFAULT_LAYOUT);
  const rows = pack(layout);

  const render = (id: BlockId) => {
    const ctl = ctlFor(id);
    if (id === "pub") return <PubBlock data={data} ctl={ctl} />;
    if (id === "dom") return <DomBlock data={data} ctl={ctl} />;
    return <AccBlock selected={selected} onSelect={setSelected} ctl={ctl} />;
  };

  return (
    <div className="dvacc" ref={rootRef}>
      <style>{CSS}</style>
      <div className="avw-card dvacc-strip">
        <span className="dvacc-pastille dvacc-pastille--lg">
          <LayoutDashboard size={16} strokeWidth={1.8} aria-hidden />
        </span>
        <span className="dvacc-who">
          <b>Fiche ACC</b>
          <small>
            <MapPin size={10} aria-hidden /> {data.acc.first} {data.acc.last} · {data.acc.city}
          </small>
        </span>
        <span className="dvacc-pick" role="group" aria-label="Choisir un ACC">
          {ACCS.map((a) => {
            const on = a.id === selected;
            return (
              <button key={a.id} type="button" aria-pressed={on} onClick={() => setSelected(a.id)} title={`${a.first} ${a.last}`}>
                <Avatar person={a} size={24} dark={on} />
                {on && <span>{a.first}</span>}
              </button>
            );
          })}
        </span>
        <span className="dvacc-kpis">
          <Kpi icon={Megaphone} label="Publications" value={data.kpi.pub} />
          <Kpi icon={FileSignature} label="Mandats" value={data.kpi.mandats} />
          <Kpi icon={UsersRound} label="Conseillers actifs" value={data.kpi.actifs} />
        </span>
        <button type="button" className="dvacc-reset" onClick={() => change(DEFAULT_LAYOUT)} disabled={!customized} title="Disposition par défaut">
          <RotateCcw size={13} aria-hidden />
        </button>
      </div>
      <div className="dvacc-grid" ref={gridRef}>
        {rows.map((row) => (
          <div key={row.join("-")} className="dvacc-row">
            {row.map((id) => (
              <div
                key={id}
                data-block={id}
                className="avw-card dvacc-card"
                data-drag={dragging === id || undefined}
                data-over={(over === id && dragging !== id) || undefined}
                style={{ flex: `${SPAN[layout.sizes[id]]} 1 0` }}
                onDragOver={(e) => {
                  if (!dragging || dragging === id) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (over !== id) setOver(id);
                }}
                onDragLeave={() => setOver((o) => (o === id ? null : o))}
                onDrop={(e) => {
                  e.preventDefault();
                  drop(id);
                }}
              >
                {render(id)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const CSS = `
.dvacc{width:100%;height:100%;display:flex;flex-direction:column;gap:10px;padding:12px;background:var(--bg);color:var(--tx);font-family:${T.font};overflow:hidden}
.dvacc button{font-family:inherit}
.dvacc-pastille{width:26px;height:26px;border-radius:8px;background:var(--js);color:${T.jadeCta};display:grid;place-items:center;flex-shrink:0}
.dvacc-pastille--lg{width:34px;height:34px;border-radius:10px}
.dvacc-strip{flex-shrink:0;display:flex;align-items:center;gap:14px;padding:8px 10px 8px 12px}
.dvacc-who{display:flex;flex-direction:column;line-height:1.2;min-width:0;width:190px}
.dvacc-who b{font-size:14px;font-weight:600}
.dvacc-who small{display:flex;align-items:center;gap:4px;font-size:10.5px;color:var(--mu);white-space:nowrap}
.dvacc-pick{display:flex;gap:4px;padding:3px;border-radius:999px;background:var(--bg);border:1px solid var(--bd)}
.dvacc-pick button{display:flex;align-items:center;gap:6px;border:0;background:transparent;border-radius:999px;padding:2px;cursor:pointer;color:var(--tx);font-size:11.5px;font-weight:500;transition:background .25s,padding .25s}
.dvacc-pick button:hover{background:var(--sf)}
.dvacc-pick button[aria-pressed=true]{background:var(--sf);padding-right:11px;box-shadow:0 1px 3px rgb(0 0 0 / .08)}
.dvacc-kpis{margin-left:auto;display:flex;gap:16px}
.dvacc-kpi{display:flex;align-items:center;gap:8px}
.dvacc-kpi>span:last-child{display:flex;flex-direction:column;line-height:1.15}
.dvacc-kpi b{font-size:15px;font-weight:600;font-variant-numeric:tabular-nums}
.dvacc-kpi small{font-size:8.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--mu)}
.dvacc-reset{width:30px;height:30px;border-radius:9px;border:1px solid var(--bd);background:transparent;color:var(--mu);display:grid;place-items:center;cursor:pointer}
.dvacc-reset:hover:not(:disabled){color:var(--tx)}
.dvacc-reset:disabled{opacity:.35;cursor:default}
.dvacc-grid{position:relative;flex:1;min-height:0;display:flex;flex-direction:column;gap:10px}
.dvacc-row{flex:1 1 0;min-height:0;display:flex;gap:10px}
.dvacc-card{min-width:0;display:flex;flex-direction:column;gap:8px;padding:11px 13px 10px;transition:box-shadow .2s,outline-color .2s;outline:2px dashed transparent;outline-offset:-2px}
.dvacc-card[data-over]{outline-color:${T.jadeCta};box-shadow:0 0 0 4px var(--js)}
.dvacc-card[data-drag]{opacity:.55}
.dvacc-head{display:flex;align-items:center;gap:8px;min-width:0;flex-shrink:0}
.dvacc-title{font-size:12.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.dvacc-ctl{margin-left:auto;display:flex;align-items:center;gap:6px;flex-shrink:0}
.dvacc-seg,.dvacc-sizes{display:inline-flex;gap:2px;padding:2px;border-radius:9px;background:var(--bg);border:1px solid var(--bd)}
.dvacc-seg button,.dvacc-sizes button{display:inline-flex;align-items:center;gap:5px;border:0;background:transparent;color:var(--mu);font-size:11px;padding:4px 8px;border-radius:7px;cursor:pointer;white-space:nowrap;transition:background .2s,color .2s}
.dvacc-sizes button{padding:4px 6px;font-weight:600;font-size:10px}
.dvacc-seg button:hover,.dvacc-sizes button:hover{color:var(--tx)}
.dvacc-seg button[aria-pressed=true]{background:${T.jadeCta};color:#fff;font-weight:500}
.dvacc-sizes button[aria-pressed=true]{background:${T.sapin};color:${T.cream}}
.dvacc-grip{width:22px;height:24px;display:grid;place-items:center;color:var(--mu);border-radius:6px;cursor:grab}
.dvacc-grip:hover{background:var(--bg);color:var(--tx)}
.dvacc-grip:active{cursor:grabbing}
.dvacc-pill{display:inline-flex;align-items:center;gap:5px;font-size:10.5px;color:var(--mu);background:var(--bg);border:1px solid var(--bd);border-radius:999px;padding:3px 9px;white-space:nowrap}
.dvacc-pill b{color:var(--tx);font-weight:600}
.dvacc-legend{display:flex;align-items:center;flex-wrap:wrap;gap:4px 12px;font-size:10.5px;color:var(--mu);flex-shrink:0}
.dvacc-legend span{display:flex;align-items:center;gap:5px}
.dvacc-legend i,.dvacc-tip i,.dvacc-prow i,.dvacc-glab i{width:9px;height:9px;border-radius:3px;flex-shrink:0;display:inline-block}
.dvacc-legend em{margin-left:auto;font-style:normal;font-size:10px;opacity:.8}
.dvacc-pubbody{flex:1;min-height:0;display:flex;gap:10px}
.dvacc-plot{flex:1;min-width:0;display:grid;grid-template-columns:26px 1fr;grid-template-rows:1fr auto;column-gap:4px}
.dvacc-yaxis{position:relative;margin-top:14px}
.dvacc-yaxis span{position:absolute;right:0;transform:translateY(50%);font-size:9px;color:var(--mu);font-variant-numeric:tabular-nums}
.dvacc-area{position:relative;margin-top:14px;min-height:0}
.dvacc-gridline{position:absolute;left:0;right:0;height:0;border-top:1px dashed var(--bd)}
.dvacc-cols{position:absolute;inset:0;display:flex;gap:6px}
.dvacc-col{position:relative;flex:1;min-width:0;border:0;background:transparent;padding:0;cursor:pointer;transition:opacity .3s;border-radius:6px 6px 0 0}
.dvacc-col:hover{background:rgb(var(--ink) / .04)}
.dvacc-stack{position:absolute;left:14%;right:14%;bottom:0;display:flex;flex-direction:column-reverse;border-radius:5px 5px 0 0;overflow:hidden;transform-origin:50% 100%;transition:height .6s cubic-bezier(.2,.8,.2,1)}
.dvacc-seg-bar{display:grid;place-items:center;flex-shrink:0;font-size:9px;font-weight:600;color:#fff;overflow:hidden;box-shadow:inset 0 1px 0 var(--sf);transition:height .6s cubic-bezier(.2,.8,.2,1),background-color .4s}
.dvacc-total{position:absolute;left:0;right:0;text-align:center;font-size:10px;font-weight:700;font-variant-numeric:tabular-nums;transform-origin:50% 100%;transition:bottom .6s cubic-bezier(.2,.8,.2,1)}
.dvacc-xaxis{grid-column:2;display:flex;gap:6px;padding-top:5px}
.dvacc-xaxis span{flex:1;min-width:0;text-align:center;font-size:9.5px;color:var(--mu);white-space:nowrap}
.dvacc-tip{position:absolute;top:0;z-index:3;pointer-events:none;display:flex;flex-direction:column;gap:3px;min-width:128px;background:var(--sf);border:1px solid var(--bd);border-radius:9px;padding:7px 9px;box-shadow:0 8px 22px rgb(0 0 0 / .12);font-size:10.5px}
.dvacc-tip b{font-weight:600;margin-bottom:1px}
.dvacc-tip span{display:flex;align-items:center;gap:5px;color:var(--mu)}
.dvacc-tip em{margin-left:auto;font-style:normal;font-weight:600;color:var(--tx);font-variant-numeric:tabular-nums}
.dvacc-panel{flex-shrink:0;display:flex;flex-direction:column;gap:8px;background:var(--bg);border:1px solid var(--bd);border-radius:12px;padding:9px 10px;overflow:hidden}
.dvacc-panel-h{display:flex;align-items:flex-start;gap:7px}
.dvacc-panel-h>span{display:flex;flex-direction:column;line-height:1.2;flex:1;min-width:0}
.dvacc-panel-h b{font-size:12.5px}
.dvacc-panel-h small{font-size:10px;color:var(--mu)}
.dvacc-panel-h button{width:22px;height:22px;border-radius:6px;border:0;background:transparent;color:var(--mu);display:grid;place-items:center;cursor:pointer}
.dvacc-panel-h button:hover{background:var(--sf);color:var(--tx)}
.dvacc-prow{display:flex;flex-direction:column;gap:4px}
.dvacc-prow>span:first-child{display:flex;align-items:center;gap:5px;font-size:10.5px;min-width:0}
.dvacc-prow b{margin-left:auto;font-variant-numeric:tabular-nums}
.dvacc-prow em{font-style:normal;color:var(--mu);font-size:9.5px;width:30px;text-align:right}
.dvacc-ptrack{height:4px;border-radius:2px;background:rgb(var(--ink) / .07);overflow:hidden}
.dvacc-ptrack span{display:block;height:100%;border-radius:2px;transition:width .5s cubic-bezier(.2,.8,.2,1)}
.dvacc-gauges{flex:1;min-height:0;display:flex;gap:8px}
.dvacc-gcell{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:6px}
.dvacc-gbox{position:relative;flex:1;min-height:0;width:100%;container-type:size}
.dvacc-arc{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.dvacc-gval{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1}
.dvacc-gval b{font-size:clamp(13px,20cqmin,30px);font-weight:600;font-variant-numeric:tabular-nums}
.dvacc-gval small{margin-top:3px;font-size:clamp(7px,7cqmin,9.5px);letter-spacing:.12em;text-transform:uppercase;color:var(--mu)}
.dvacc-glab{display:flex;align-items:center;gap:5px;font-size:11px;white-space:nowrap;flex-shrink:0}
.dvacc-glab em{font-style:normal;color:var(--mu);font-variant-numeric:tabular-nums}
.dvacc-accs{position:relative;flex:1;min-height:0;display:flex;gap:10px}
.dvacc-acc{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:4px;border:0;background:transparent;padding:0;cursor:pointer;color:var(--tx)}
.dvacc-accv{font-size:12px;font-weight:600;font-variant-numeric:tabular-nums;flex-shrink:0}
.dvacc-track{position:relative;flex:1;min-height:0;width:100%;max-width:120px;border-radius:7px 7px 0 0;background:rgb(var(--ink) / .05);transition:background .2s}
.dvacc-acc:hover .dvacc-track{background:rgb(var(--ink) / .09)}
.dvacc-bar{position:absolute;left:0;right:0;bottom:0;border-radius:7px 7px 0 0;transition:background .3s}
.dvacc-accfoot{display:flex;flex-direction:column;align-items:center;gap:3px;flex-shrink:0;min-width:0;max-width:100%}
.dvacc-accfoot>span:last-child{font-size:10.5px;color:var(--mu);max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dvacc-acc[data-on] .dvacc-accfoot>span:last-child{color:var(--tx);font-weight:600}
`;
