import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { animate, stagger } from "animejs";
import {
  BadgeCheck, BedDouble, CalendarDays, ChevronLeft, ChevronRight, CircleDot, Coins, Flag, Hash, Images, MapPin,
  MousePointer2, Receipt, Ruler, Tag, UserRound, X, type LucideIcon,
} from "lucide-react";
import { ADVISORS, LISTINGS, type Person } from "../../averroes/window/data/fiction";
import { Avatar } from "../../averroes/window/fx/Avatar";
import { formatFr } from "../../averroes/window/fx/CountUp";
import { prefersReducedMotion } from "../../averroes/window/fx/reducedMotion";
import { T, TONE } from "../../averroes/window/theme";

/* Demande › Transactions : la référence d'un bien se survole (carte d'aperçu, données
   déjà jointes à la ligne, aucune requête) et s'ouvre en visionneuse au clic. */

const W = 1100, H = 640, CARD_W = 268;
/** Une photo par bien : les « autres photos » sont des recadrages, comme le Catalogue. */
const FRAMES = ["50% 50%", "18% 40%", "82% 55%", "40% 75%", "65% 30%", "28% 62%", "75% 45%", "50% 20%"];

type Statut = "Facturée" | "Compromis" | "En attente" | "Annulée";
const STATUT_TONE: Record<Statut, keyof typeof TONE> = { Facturée: "ok", Compromis: "info", "En attente": "warn", Annulée: "alert" };

type Row = {
  id: number;
  advisor: Person;
  client: Person;
  ref: number;
  kind: "VENTE" | "LOCATION";
  montant: number;
  date: string;
  statut: Statut;
  bien: { type: string; project: string; place: string; area: number; rooms: number; price: number; photo: string; photos: number; frame: number; score: number; priority: "P1" | "P2" | "P3"; published: string };
};

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

const CLIENTS = ["KB", "SM", "AT", "HL", "NE", "YR", "MO", "ZA", "FB", "IK", "RC", "LD"];
const STATUTS: Statut[] = ["Facturée", "Facturée", "Compromis", "Facturée", "En attente", "Compromis", "Facturée", "Annulée", "Facturée", "Compromis", "En attente", "Facturée"];

function buildRows(): Row[] {
  const r = rng(77031);
  return Array.from({ length: 11 }, (_, i) => {
    const l = LISTINGS[i % LISTINGS.length];
    const variant = Math.floor(i / LISTINGS.length);
    const area = Math.round(l.area * (0.85 + r() * 0.35));
    const price = Math.round((l.price * (0.9 + r() * 0.25)) / (l.kind === "VENTE" ? 5000 : 100)) * (l.kind === "VENTE" ? 5000 : 100);
    // commission : un pourcentage du prix à la vente, un mois de loyer à la location
    const montant = l.kind === "VENTE" ? Math.round((price * 0.025) / 100) * 100 : price;
    const day = 28 - i * 2;
    return {
      id: i,
      advisor: ADVISORS[(i * 5 + 2) % ADVISORS.length],
      client: { id: `cl${i}`, first: CLIENTS[i][0], last: CLIENTS[i][1], city: "Casablanca" },
      ref: 40210 + Math.floor(r() * 9000),
      kind: l.kind,
      montant,
      date: `2026-10-${String(day).padStart(2, "0")}`,
      statut: STATUTS[i],
      bien: {
        type: l.type, project: l.project, place: l.place, area, rooms: l.rooms, price,
        photo: l.photo, photos: l.photos, frame: variant * 3 + (i % 2),
        score: 52 + Math.floor(r() * 44),
        priority: (["P1", "P2", "P3"] as const)[Math.floor(r() * 3)],
        published: `2026-0${3 + Math.floor(r() * 6)}-${String(1 + Math.floor(r() * 27)).padStart(2, "0")}`,
      },
    };
  });
}
const ROWS = buildRows();

const CSS = `
.dvtb-ref{display:inline-flex;align-items:center;gap:4px;border:1px solid var(--bd);background:var(--bg);color:var(--tx);border-radius:999px;padding:3px 9px;font:600 11.5px ${T.font};font-variant-numeric:tabular-nums;cursor:pointer;transition:background .2s,color .2s,border-color .2s}
.dvtb-ref:hover,.dvtb-ref[data-on]{background:${T.sapin};color:${T.cream};border-color:${T.sapin}}
.dvtb-thumb{position:relative;width:46px;height:32px;border-radius:8px;overflow:hidden;border:0;padding:0;cursor:pointer;flex-shrink:0;outline:2px solid transparent;outline-offset:1px;transition:outline-color .2s}
.dvtb-thumb:hover,.dvtb-thumb[data-on]{outline-color:${T.jadeCta}}
.dvtb-tr{display:contents}
.dvtb-tr>div{display:flex;align-items:center;min-width:0;padding:0 8px;border-top:1px solid var(--bd);transition:background .15s}
.dvtb-tr:hover>div{background:rgb(var(--ink) / .035)}
.dvtb-nav{position:absolute;top:50%;margin-top:-18px;width:36px;height:36px;border-radius:50%;border:0;background:rgba(255,255,255,.85);color:${T.sapin};display:grid;place-items:center;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.2)}
.dvtb-nav:hover{background:#fff}
`;

function Th({ icon: Icon, children, right }: { icon: LucideIcon; children: string; right?: boolean }) {
  return (
    <div className="avw-label" style={{ display: "flex", alignItems: "center", justifyContent: right ? "flex-end" : "flex-start", gap: 5, padding: "0 8px" }}>
      <Icon size={11} color={T.jadeCta} aria-hidden /> {children}
    </div>
  );
}

function Chip({ statut }: { statut: Statut }) {
  const t = TONE[STATUT_TONE[statut]];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: t.ink, background: t.bg, borderRadius: 999, padding: "3px 9px", whiteSpace: "nowrap" }}>
      <CircleDot size={10} aria-hidden /> {statut}
    </span>
  );
}

const fmtPrice = (row: Row) => `${formatFr(row.bien.price)} ${row.kind === "LOCATION" ? "MAD/mois" : "MAD"}`;

type Hover = { row: number; anchor: "ref" | "thumb" };

export function PreviewTable() {
  const rootRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<Hover | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number; flipped: boolean } | null>(null);
  const [auto, setAuto] = useState(true);
  const [box, setBox] = useState<number | null>(null);

  // entrée des lignes en cascade
  useEffect(() => {
    const t = tableRef.current;
    if (!t || prefersReducedMotion()) return;
    const a = animate(t.querySelectorAll<HTMLElement>("[data-cell]"), { opacity: [0, 1], x: [-10, 0], duration: 420, delay: stagger(6), ease: "out(3)" });
    return () => {
      a.revert();
    };
  }, []);

  // démonstration automatique tant que personne n'a survolé une référence
  useEffect(() => {
    if (!auto) return;
    let k = 0;
    const step = () => {
      const row = (k * 4 + 1) % ROWS.length;
      setHover({ row, anchor: k % 3 === 2 ? "thumb" : "ref" });
      k++;
    };
    const first = window.setTimeout(step, 900);
    const id = window.setInterval(step, 2500);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [auto]);

  // position dans le cadre : à droite du déclencheur, à gauche s'il déborde, bornée en hauteur.
  // Le cadre peut être réduit par un transform : on repasse en coordonnées 1100 × 640.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!hover || !root) {
      setPos(null);
      return;
    }
    const trig = root.querySelector<HTMLElement>(`[data-trigger="${hover.anchor}-${hover.row}"]`);
    if (!trig) return;
    const rr = root.getBoundingClientRect();
    const k = rr.width / root.offsetWidth || 1;
    const t = trig.getBoundingClientRect();
    const left = (t.left - rr.left) / k, right = (t.right - rr.left) / k, top = (t.top - rr.top) / k;
    const ch = cardRef.current?.offsetHeight ?? 380;
    const fw = root.offsetWidth || W, fh = root.offsetHeight || H;
    let x = right + 12;
    let flipped = false;
    if (x + CARD_W > fw - 8) {
      x = Math.max(8, left - CARD_W - 12);
      flipped = true;
    }
    const y = Math.min(Math.max(8, top - 14), fh - ch - 8);
    setPos({ x, y, flipped });
  }, [hover]);

  // la carte apparaît d'un léger glissé, côté déclencheur
  useEffect(() => {
    if (!hover || !cardRef.current || prefersReducedMotion()) return;
    animate(cardRef.current, { opacity: [0, 1], scale: [0.96, 1], x: [pos?.flipped ? 10 : -10, 0], duration: 260, ease: "out(3)" });
  }, [hover, pos?.flipped]);

  const enter = (row: number, anchor: Hover["anchor"]) => {
    setAuto(false);
    setHover({ row, anchor });
  };
  const leave = () => {
    if (!auto) setHover(null);
  };
  const openBox = (row: number) => {
    setAuto(false);
    setHover(null);
    setBox(row);
  };
  const closeBox = useCallback(() => setBox(null), []);

  const cols = "minmax(0,1.6fr) minmax(0,.9fr) minmax(0,.9fr) minmax(0,.8fr) minmax(0,1.1fr) minmax(0,.9fr) minmax(0,1fr) 92px";
  const shown = hover ? ROWS[hover.row] : null;

  return (
    <div ref={rootRef} style={{ position: "relative", width: "100%", height: "100%", background: T.bg, padding: 16, display: "flex", fontFamily: T.font, overflow: "hidden" }}>
      <style>{CSS}</style>
      <div className="avw-card" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", padding: "14px 16px 10px" }}>
        <div className="avw-card-h" style={{ flexShrink: 0 }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, background: T.jadeSoft, color: T.jadeCta, display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Receipt size={15} strokeWidth={1.8} aria-hidden />
          </span>
          <span>Transactions du mois</span>
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 400, color: T.muted }}>
            <MousePointer2 size={13} color={T.jadeCta} aria-hidden /> Survolez une référence, cliquez pour les photos
            {auto && (
              <span style={{ marginLeft: 6, fontSize: 9.5, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: TONE.ok.ink, background: TONE.ok.bg, borderRadius: 999, padding: "2px 8px" }}>Démo auto</span>
            )}
          </span>
        </div>

        <div ref={tableRef} style={{ flex: 1, minHeight: 0, marginTop: 10, display: "grid", gridTemplateColumns: cols, gridTemplateRows: `30px repeat(${ROWS.length}, minmax(0,1fr))`, fontSize: 12.5 }}>
          <Th icon={UserRound}>Conseiller</Th>
          <Th icon={UserRound}>Client</Th>
          <Th icon={Hash}>Référence</Th>
          <Th icon={Tag}>Type</Th>
          <Th icon={Coins} right>Montant</Th>
          <Th icon={CalendarDays}>Date</Th>
          <Th icon={BadgeCheck}>Statut</Th>
          <Th icon={Images}>Bien</Th>
          {ROWS.map((row) => {
            const on = hover?.row === row.id;
            return (
              <div key={row.id} className="dvtb-tr">
                <div data-cell style={{ gap: 9 }}>
                  <Avatar person={row.advisor} size={26} />
                  <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>
                    {row.advisor.first} {row.advisor.last}
                  </span>
                </div>
                <div data-cell style={{ gap: 8 }}>
                  <Avatar person={row.client} size={22} dark />
                  <span style={{ color: T.muted, fontVariantNumeric: "tabular-nums" }}>{row.client.first}. {row.client.last}.</span>
                </div>
                <div data-cell>
                  <button
                    type="button"
                    className="dvtb-ref"
                    data-trigger={`ref-${row.id}`}
                    data-on={on && hover?.anchor === "ref" ? "" : undefined}
                    onMouseEnter={() => enter(row.id, "ref")}
                    onMouseLeave={leave}
                    onFocus={() => enter(row.id, "ref")}
                    onBlur={leave}
                    onClick={() => openBox(row.id)}
                  >
                    #{row.ref}
                  </button>
                </div>
                <div data-cell>
                  <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: ".1em", color: "#fff", background: row.kind === "LOCATION" ? T.terracotta : T.jadeCta, borderRadius: 999, padding: "3px 8px" }}>{row.kind}</span>
                </div>
                <div data-cell style={{ justifyContent: "flex-end", fontWeight: 600, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{formatFr(row.montant)} MAD</div>
                <div data-cell style={{ color: T.muted, fontVariantNumeric: "tabular-nums" }}>{row.date}</div>
                <div data-cell><Chip statut={row.statut} /></div>
                <div data-cell style={{ gap: 6 }}>
                  <button
                    type="button"
                    className="dvtb-thumb"
                    aria-label={`Photos du bien #${row.ref}`}
                    data-trigger={`thumb-${row.id}`}
                    data-on={on && hover?.anchor === "thumb" ? "" : undefined}
                    onMouseEnter={() => enter(row.id, "thumb")}
                    onMouseLeave={leave}
                    onClick={() => openBox(row.id)}
                  >
                    <img src={row.bien.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: FRAMES[row.bien.frame % FRAMES.length], display: "block" }} />
                  </button>
                  <span style={{ fontSize: 10, color: T.muted }}>{row.bien.photos}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {shown && (
        <div ref={cardRef} style={{ position: "absolute", left: pos?.x ?? -9999, top: pos?.y ?? 0, width: CARD_W, zIndex: 3, pointerEvents: "none", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 22px 50px rgba(26,52,49,.24)" }}>
          <PreviewCard row={shown} />
        </div>
      )}

      {box != null && <Lightbox row={ROWS[box]} onClose={closeBox} />}
    </div>
  );
}

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
      <span style={{ fontSize: 9.5, letterSpacing: ".08em", textTransform: "uppercase", color: T.muted, flexShrink: 0 }}>{label}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0, fontSize: 11, fontWeight: 500, textAlign: "right" }}>{children}</span>
    </div>
  );
}

function scoreTone(s: number) {
  return s >= 80 ? TONE.ok : s >= 65 ? TONE.info : TONE.warn;
}

function Priority({ p }: { p: Row["bien"]["priority"] }) {
  const bg = p === "P1" ? T.rose : p === "P2" ? T.terracotta : T.sapin;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: bg, color: "#fff", borderRadius: 4, padding: "1px 5px", fontSize: 8.5, fontWeight: 700, flexShrink: 0 }}>
      <Flag size={8} aria-hidden /> {p}
    </span>
  );
}

/** La carte de survol : photo, score, nombre de photos, puis les caractéristiques. */
function PreviewCard({ row }: { row: Row }) {
  const b = row.bien;
  const st = scoreTone(b.score);
  return (
    <>
      <div style={{ position: "relative", height: 140 }}>
        <img src={b.photo} alt={`${b.type}, ${b.place}`} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: FRAMES[b.frame % FRAMES.length], display: "block" }} />
        <span style={{ position: "absolute", left: 8, top: 8, fontSize: 10.5, fontWeight: 700, color: st.ink, background: "#fff", borderRadius: 999, padding: "2px 8px", boxShadow: "0 2px 6px rgba(0,0,0,.15)" }}>
          {b.score}/100
        </span>
        <span style={{ position: "absolute", right: 8, bottom: 8, fontSize: 10, color: "#fff", background: "rgba(0,0,0,.6)", borderRadius: 999, padding: "2px 8px", display: "flex", gap: 4, alignItems: "center" }}>
          <Images size={10} aria-hidden /> {b.photos} photos
        </span>
      </div>
      <div style={{ padding: "10px 12px 12px" }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>
          {b.type} <span style={{ fontWeight: 400, color: T.muted }}>· {b.project}</span>
        </div>
        <div style={{ fontSize: 10.5, color: T.muted, display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
          <MapPin size={10} color={T.jadeCta} aria-hidden /> #{row.ref} · {b.place}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${T.border}` }}>
          <Info label="Prix">{fmtPrice(row)}</Info>
          <Info label="Surface">{b.area} m²</Info>
          <Info label="Chambres">{b.rooms}</Info>
          <Info label="Prix / m²">{row.kind === "VENTE" ? `${formatFr(Math.round(b.price / b.area))} MAD` : "—"}</Info>
          <Info label="Publié">{b.published}</Info>
          <Info label="Priorité"><Priority p={b.priority} /></Info>
          <Info label="Conseiller">
            <Avatar person={row.advisor} size={16} />
            <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.advisor.first} {row.advisor.last}</span>
          </Info>
          <Info label="Transaction">{row.kind === "VENTE" ? "Vente" : "Location"}</Info>
        </div>
      </div>
    </>
  );
}

/** Visionneuse dans le cadre : diaporama des recadrages, faits clés, Échap ou × pour fermer. */
function Lightbox({ row, onClose }: { row: Row; onClose: () => void }) {
  const b = row.bien;
  const n = b.photos;
  const [i, setI] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, go]);

  useEffect(() => {
    const el = panel.current;
    if (!el || prefersReducedMotion()) return;
    animate(el, { opacity: [0, 1], scale: [0.95, 1], duration: 320, ease: "out(3)" });
    animate(el.querySelectorAll<HTMLElement>("[data-fact]"), { opacity: [0, 1], x: [12, 0], duration: 360, delay: stagger(40, { start: 120 }), ease: "out(3)" });
  }, []);

  const facts: { icon: LucideIcon; label: string; value: ReactNode }[] = [
    { icon: Tag, label: "Prix affiché", value: fmtPrice(row) },
    { icon: Ruler, label: "Surface", value: `${b.area} m²` },
    { icon: BedDouble, label: "Chambres", value: b.rooms },
    { icon: Coins, label: "Montant", value: `${formatFr(row.montant)} MAD` },
    { icon: CalendarDays, label: "Date", value: row.date },
  ];

  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 6, background: "rgba(20,40,38,.62)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center" }}>
      <div ref={panel} role="dialog" aria-label={`Bien #${row.ref}`} onClick={(e) => e.stopPropagation()} style={{ width: 900, height: 540, background: T.surface, borderRadius: 20, overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 290px", boxShadow: "0 30px 80px rgba(0,0,0,.35)" }}>
        <div style={{ position: "relative", background: T.sapinDeep, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ position: "relative", flex: 1, minHeight: 0, overflow: "hidden" }}>
            <img
              key={i}
              src={b.photo}
              alt={`${b.type}, photo ${i + 1}`}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: FRAMES[(b.frame + i) % FRAMES.length], transform: `scale(${1 + (i % 3) * 0.12})`, animation: prefersReducedMotion() ? undefined : "avw-in .45s cubic-bezier(.2,.8,.2,1)" }}
            />
            <button type="button" className="dvtb-nav" style={{ left: 12 }} aria-label="Photo précédente" onClick={() => go(-1)}>
              <ChevronLeft size={18} aria-hidden />
            </button>
            <button type="button" className="dvtb-nav" style={{ right: 12 }} aria-label="Photo suivante" onClick={() => go(1)}>
              <ChevronRight size={18} aria-hidden />
            </button>
            <span style={{ position: "absolute", left: 12, top: 12, fontSize: 11, color: "#fff", background: "rgba(0,0,0,.5)", borderRadius: 999, padding: "3px 10px", display: "flex", gap: 5, alignItems: "center" }}>
              <Images size={12} aria-hidden /> {i + 1} / {n}
            </span>
          </div>
          <div style={{ display: "flex", gap: 6, padding: 10, flexShrink: 0 }}>
            {Array.from({ length: n }, (_, k) => (
              <button
                key={k}
                type="button"
                aria-label={`Photo ${k + 1}`}
                onClick={() => setI(k)}
                style={{ flex: 1, height: 48, padding: 0, border: 0, borderRadius: 8, overflow: "hidden", cursor: "pointer", outline: k === i ? `2px solid ${T.jadeCta}` : "2px solid transparent", opacity: k === i ? 1 : 0.6, transition: "opacity .2s" }}
              >
                <img src={b.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: FRAMES[(b.frame + k) % FRAMES.length], transform: `scale(${1 + (k % 3) * 0.12})`, display: "block" }} />
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12, minHeight: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{ minWidth: 0, flex: 1 }} data-fact>
              <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: ".1em", color: "#fff", background: row.kind === "LOCATION" ? T.terracotta : T.jadeCta, borderRadius: 999, padding: "3px 8px" }}>{row.kind}</span>
              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>{b.type}</div>
              <div style={{ fontSize: 12, color: T.muted }}>{b.project}</div>
            </div>
            <button type="button" className="avw-x" aria-label="Fermer" onClick={onClose}>
              <X size={15} aria-hidden />
            </button>
          </div>
          <div data-fact style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: T.muted }}>
            <MapPin size={12} color={T.jadeCta} aria-hidden /> #{row.ref} · {b.place} <Priority p={b.priority} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minHeight: 0, justifyContent: "space-evenly", borderTop: `1px solid ${T.border}`, paddingTop: 6 }}>
            {facts.map((f) => (
              <div key={f.label} data-fact style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12 }}>
                <span style={{ width: 26, height: 26, borderRadius: 8, background: T.jadeSoft, color: T.jadeCta, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <f.icon size={13} aria-hidden />
                </span>
                <span style={{ color: T.muted }}>{f.label}</span>
                <b style={{ marginLeft: "auto", fontVariantNumeric: "tabular-nums" }}>{f.value}</b>
              </div>
            ))}
          </div>
          <div data-fact style={{ display: "flex", alignItems: "center", gap: 9, borderTop: `1px solid ${T.border}`, paddingTop: 10 }}>
            <Avatar person={row.advisor} size={30} />
            <span style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.advisor.first} {row.advisor.last}</span>
              <span style={{ fontSize: 10, color: T.muted }}>Conseiller · {row.advisor.city}</span>
            </span>
            <Chip statut={row.statut} />
          </div>
        </div>
      </div>
    </div>
  );
}
