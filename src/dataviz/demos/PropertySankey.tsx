import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { animate, stagger } from "animejs";
import * as THREE from "three";
import {
  Archive,
  BadgeDollarSign,
  Building2,
  CircleDashed,
  CircleSlash,
  ExternalLink,
  FileCheck2,
  GitFork,
  GripVertical,
  Inbox,
  Megaphone,
  PauseCircle,
  RotateCcw,
  ScanSearch,
  Send,
  UserRound,
  Wrench,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { CountUp, formatFr } from "../../averroes/window/fx/CountUp";
import { prefersReducedMotion } from "../../averroes/window/fx/reducedMotion";
import { T } from "../../averroes/window/theme";

/* Flux par étape (libellés neutres) : Sankey à rubans Bézier écrits à la main, cartes déplaçables, fond GLSL. */

/* ---------- Données fictives ---------- */

type Family = "etape" | "actuel" | "perte" | "sortie";
type NodeDef = { id: string; label: string; color: string; icon: LucideIcon; family: Family; place: readonly [number, number] };

// Teintes : progression charte (jade profond → jade CTA, terracotta → rose). Aucune autre.
const NODES: NodeDef[] = [
  // Tronc : l'élément y passe, il n'y reste pas.
  { id: "leads_pf", label: "Source A", color: "#176457", icon: Building2, family: "etape", place: [14, 250] },
  { id: "soumis", label: "Étape 1", color: "#0e8f7c", icon: Send, family: "etape", place: [158, 262] },
  { id: "affectation", label: "Étape 2", color: "#106b5e", icon: Inbox, family: "etape", place: [300, 250] },
  { id: "leads_co", label: "Source B", color: "#56ac9a", icon: UserRound, family: "etape", place: [30, 418] },
  { id: "traitement", label: "Étape 3", color: "#84c9bd", icon: Wrench, family: "etape", place: [442, 272] },
  { id: "finalise", label: "Étape 4", color: "#1bbfa0", icon: FileCheck2, family: "etape", place: [584, 250] },
  { id: "rejete", label: "Écart", color: "#ec6048", icon: XCircle, family: "etape", place: [712, 382] },
  { id: "publie", label: "Étape 5", color: "#5fcdb3", icon: Megaphone, family: "etape", place: [826, 214] },
  // « En cours » : l'élément n'a pas quitté l'étape. Une famille de roses, au-dessus du tronc.
  { id: "r_qualif", label: "Tri\nen cours", color: "#e3a7b6", icon: ScanSearch, family: "actuel", place: [128, 100] },
  { id: "r_soumis", label: "Étape 1\nen cours", color: "#dc93a5", icon: CircleDashed, family: "actuel", place: [272, 70] },
  { id: "r_affect", label: "Étape 2\nen cours", color: "#d47f94", icon: CircleDashed, family: "actuel", place: [414, 126] },
  { id: "r_trait", label: "Étape 3\nen cours", color: "#d36a88", icon: CircleDashed, family: "actuel", place: [556, 78] },
  { id: "r_final", label: "Étape 4\nen cours", color: "#c55475", icon: CircleDashed, family: "actuel", place: [690, 120] },
  { id: "r_rejete", label: "Écart\nen cours", color: "#a04c3c", icon: XCircle, family: "actuel", place: [846, 474] },
  // Pertes, sous le tronc.
  { id: "non_qualif", label: "Perte", color: "#c03163", icon: CircleSlash, family: "perte", place: [300, 552] },
  // Sorties définitives, en colonne à droite.
  { id: "en_ligne", label: "Sortie A", color: "#84c9bd", icon: Megaphone, family: "sortie", place: [986, 66] },
  { id: "vendu", label: "Sortie B", color: "#198a75", icon: BadgeDollarSign, family: "sortie", place: [986, 167] },
  { id: "vendu_hors", label: "Sortie C", color: "#106b5e", icon: ExternalLink, family: "sortie", place: [986, 268] },
  { id: "suspendu", label: "Sortie D", color: "#f18b76", icon: PauseCircle, family: "sortie", place: [986, 369] },
  { id: "depublie", label: "Sortie E", color: "#b8607f", icon: CircleDashed, family: "sortie", place: [986, 470] },
  { id: "archive", label: "Sortie F", color: "#842e4e", icon: Archive, family: "sortie", place: [986, 572] },
];

type Link = { source: string; target: string; value: number };
const L = (source: string, target: string, value: number): Link => ({ source, target, value });

const LINKS: Link[] = [
  L("leads_pf", "soumis", 5960), L("leads_pf", "non_qualif", 1240), L("leads_pf", "archive", 610), L("leads_pf", "r_qualif", 610),
  L("soumis", "affectation", 4870), L("soumis", "non_qualif", 380), L("soumis", "archive", 290), L("soumis", "r_soumis", 420),
  L("affectation", "traitement", 4120), L("affectation", "non_qualif", 210), L("affectation", "archive", 180), L("affectation", "r_affect", 360),
  L("leads_co", "traitement", 2740),
  L("traitement", "finalise", 5480), L("traitement", "archive", 640), L("traitement", "r_trait", 740),
  L("finalise", "rejete", 820), L("finalise", "publie", 4210), L("finalise", "archive", 150), L("finalise", "r_final", 300),
  L("rejete", "publie", 470), L("rejete", "archive", 160), L("rejete", "r_rejete", 190),
  L("publie", "en_ligne", 2140), L("publie", "vendu", 1120), L("publie", "vendu_hors", 410), L("publie", "suspendu", 380),
  L("publie", "archive", 270), L("publie", "depublie", 360),
];

/** Valeur d'un nœud = le plus grand de ses deux flux, entrant ou sortant. */
const VALUE: Record<string, number> = (() => {
  const inn: Record<string, number> = {};
  const out: Record<string, number> = {};
  for (const l of LINKS) {
    out[l.source] = (out[l.source] ?? 0) + l.value;
    inn[l.target] = (inn[l.target] ?? 0) + l.value;
  }
  return Object.fromEntries(NODES.map((n) => [n.id, Math.max(inn[n.id] ?? 0, out[n.id] ?? 0)]));
})();
const TOTAL = VALUE.leads_pf + VALUE.leads_co;
const OUT_SUM: Record<string, number> = LINKS.reduce<Record<string, number>>((m, l) => ((m[l.source] = (m[l.source] ?? 0) + l.value), m), {});
const BY_ID = new Map(NODES.map((n) => [n.id, n]));

const FAMILIES: { id: Family; label: string; color: string }[] = [
  { id: "etape", label: "Étapes", color: "#1bbfa0" },
  { id: "actuel", label: "En cours", color: "#dc93a5" },
  { id: "perte", label: "Pertes", color: "#c03163" },
  { id: "sortie", label: "Sorties", color: "#84c9bd" },
];

/* ---------- Géométrie (unités = pixels du cadre 1100 × 640) ---------- */

const VBW = 1100;
const VBH = 640;
const NW = 100;
const NH = 54;
const TOP = 58; // bandeau d'en-tête : aucune carte n'y monte
const RIBBON_GAP = 2;
const COL_GAP = 36;
const RIBBON_TUCK = 3; // le ruban passe sous la carte : pas de couture visible
const PART_MIN = 0.03; // en deçà, l'étiquette pèse plus lourd que le filet qu'elle décrit
const MARGE_ETIQ = 21;
const DEMI_HAUT_ETIQ = 8;
const STORAGE_KEY = "dv:sankey:v1";

type Offset = { x: number; y: number };
type Placed = NodeDef & { x: number; y: number; value: number };
type Ribbon = { id: string; source: string; target: string; value: number; part: number; d: string; from: string; to: string; gx0: number; gx1: number; lx: number | null; ly: number };

const pct = (part: number) =>
  `${(part * 100).toLocaleString("fr-FR", { maximumFractionDigits: part < 0.1 ? 1 : 0 })} %`;

function clampOffset(n: NodeDef, o: Offset): Offset {
  const [bx, by] = n.place;
  return {
    x: Math.min(VBW - NW - 4 - bx, Math.max(4 - bx, o.x)),
    y: Math.min(VBH - NH - 4 - by, Math.max(TOP - by, o.y)),
  };
}

function loadOffsets(): Record<string, Offset> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Offset>;
    const out: Record<string, Offset> = {};
    for (const n of NODES) {
      const o = parsed[n.id];
      if (o && Number.isFinite(o.x) && Number.isFinite(o.y)) out[n.id] = clampOffset(n, o);
    }
    return out;
  } catch {
    return {};
  }
}

function saveOffsets(map: Record<string, Offset>) {
  try {
    const clean = Object.fromEntries(Object.entries(map).filter(([, o]) => Math.abs(o.x) > 0.5 || Math.abs(o.y) > 0.5));
    if (Object.keys(clean).length === 0) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  } catch {
    /* stockage indisponible : la disposition vit le temps de la page */
  }
}

/** Bézier cubique à une dimension. */
function bezier(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

/** `t` tel que la courbe atteigne l'abscisse voulue, par dichotomie (x(t) n'est pas linéaire). */
function tPourX(p0: number, p1: number, p2: number, p3: number, cible: number): number {
  let bas = 0;
  let haut = 1;
  for (let i = 0; i < 24; i += 1) {
    const mid = (bas + haut) / 2;
    if (bezier(p0, p1, p2, p3, mid) < cible) bas = mid;
    else haut = mid;
  }
  return (bas + haut) / 2;
}

function buildRibbons(placed: Placed[]): Ribbon[] {
  const byId = new Map(placed.map((p) => [p.id, p]));
  const scale = new Map<string, number>();
  for (const p of placed) {
    const outs = LINKS.filter((l) => l.source === p.id);
    const ins = LINKS.filter((l) => l.target === p.id);
    const so = outs.reduce((s, l) => s + l.value, 0);
    const si = ins.reduce((s, l) => s + l.value, 0);
    scale.set(`o:${p.id}`, so > 0 ? (NH - Math.max(0, outs.length - 1) * RIBBON_GAP) / so : 0);
    scale.set(`i:${p.id}`, si > 0 ? (NH - Math.max(0, ins.length - 1) * RIBBON_GAP) / si : 0);
  }
  const th = (l: Link) => Math.max(2, l.value * Math.min(scale.get(`o:${l.source}`) ?? 0, scale.get(`i:${l.target}`) ?? 0));

  // Accroches : sorties rangées par hauteur de la cible, entrées par hauteur de la source,
  // pour que les rubans ne se croisent pas au ras des cartes.
  const sy = new Map<Link, number>();
  const ty = new Map<Link, number>();
  for (const p of placed) {
    let c = p.y;
    for (const l of LINKS.filter((x) => x.source === p.id).sort((a, b) => byId.get(a.target)!.y - byId.get(b.target)!.y)) {
      sy.set(l, c);
      c += th(l) + RIBBON_GAP;
    }
    c = p.y;
    for (const l of LINKS.filter((x) => x.target === p.id).sort((a, b) => byId.get(a.source)!.y - byId.get(b.source)!.y)) {
      ty.set(l, c);
      c += th(l) + RIBBON_GAP;
    }
  }

  const etiquettes: { x: number; y: number }[] = [];
  return LINKS.map((l) => {
    const s = byId.get(l.source)!;
    const t = byId.get(l.target)!;
    const w = th(l);
    const y0 = sy.get(l)!;
    const y1 = ty.get(l)!;
    const x0 = s.x + NW - RIBBON_TUCK;
    const x1 = t.x + RIBBON_TUCK;
    const span = Math.max(COL_GAP, x1 - x0);
    const c0 = x0 + span * 0.42;
    const c1 = x0 + span * 0.58;
    const part = l.value / (OUT_SUM[s.id] || 1);

    // Étiquette juste après la carte source si la gouttière le permet, sinon le premier
    // point de la courbe qui ne mord ni sur une carte ni sur une autre étiquette.
    let tt: number | null = null;
    if (part >= PART_MIN) {
      const reculMax = Math.min(34, span - MARGE_ETIQ);
      const candidats: number[] = [];
      if (reculMax >= MARGE_ETIQ) candidats.push(tPourX(x0, c0, c1, x1, x0 + Math.min(Math.max(span * 0.3, MARGE_ETIQ), reculMax)));
      candidats.push(0.5, 0.35, 0.65, 0.22, 0.78);
      for (const c of candidats) {
        const px = bezier(x0, c0, c1, x1, c);
        const py = bezier(y0, y0, y1, y1, c) + w / 2;
        const libreCartes = placed.every(
          (n) => px + MARGE_ETIQ <= n.x || n.x + NW <= px - MARGE_ETIQ || py + DEMI_HAUT_ETIQ <= n.y || n.y + NH <= py - DEMI_HAUT_ETIQ,
        );
        const libreEtiq = etiquettes.every((e) => Math.abs(e.x - px) >= 2 * MARGE_ETIQ || Math.abs(e.y - py) >= 2 * DEMI_HAUT_ETIQ);
        if (libreCartes && libreEtiq && py > TOP) {
          tt = c;
          etiquettes.push({ x: px, y: py });
          break;
        }
      }
    }

    return {
      id: `${l.source}-${l.target}`,
      source: l.source,
      target: l.target,
      value: l.value,
      part,
      from: s.color,
      to: t.color,
      gx0: x0,
      gx1: x1 === x0 ? x0 + 1 : x1,
      lx: tt == null ? null : bezier(x0, c0, c1, x1, tt),
      ly: bezier(y0, y0, y1, y1, tt ?? 0.5) + w / 2,
      d: `M${x0},${y0} C${c0},${y0} ${c1},${y1} ${x1},${y1} L${x1},${y1 + w} C${c1},${y1 + w} ${c0},${y0 + w} ${x0},${y0 + w} Z`,
    };
  });
}

/* ---------- Composant ---------- */

const CSS = `
.dvsk-root{position:relative;width:100%;height:100%;overflow:hidden;border-radius:16px;background:${T.sapinDeep};color:${T.cream};font-family:${T.font};touch-action:none;user-select:none;-webkit-user-select:none}
.dvsk-card{position:absolute;box-sizing:border-box;cursor:grab;outline:none;border-radius:9px}
.dvsk-card:active{cursor:grabbing}
.dvsk-card:focus-visible .dvsk-in{box-shadow:0 0 0 2px ${T.jadeCta}}
.dvsk-in{position:relative;width:100%;height:100%;box-sizing:border-box;border-radius:9px;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:4px 6px 4px 9px;background:rgba(12,28,26,.7);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);transition:opacity .2s ease,transform .18s ease,box-shadow .2s ease}
.dvsk-card[data-drag] .dvsk-in{transform:scale(1.05)}
.dvsk-btn{display:inline-flex;align-items:center;gap:6px;border-radius:9px;border:1px solid rgba(254,239,224,.16);background:rgba(254,239,224,.06);color:rgba(254,239,224,.85);font:500 11px/1 ${T.font};padding:7px 11px;cursor:pointer;transition:background .2s,color .2s,opacity .2s}
.dvsk-btn:hover:not(:disabled){background:rgba(27,191,160,.18);color:#fff;border-color:rgba(27,191,160,.5)}
.dvsk-btn:disabled{opacity:.35;cursor:not-allowed}
`;

export function PropertySankey() {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ id: string; sx: number; sy: number; ox: number; oy: number; kx: number; ky: number } | null>(null);
  const focusRef = useRef<{ x: number; y: number; color: string } | null>(null);
  const kickRef = useRef<() => void>(() => {});
  const resetAnim = useRef<{ pause: () => unknown } | null>(null);

  const [offsets, setOffsets] = useState<Record<string, Offset>>(loadOffsets);
  const [hover, setHover] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  const placed = useMemo<Placed[]>(
    () =>
      NODES.map((n) => {
        const o = clampOffset(n, offsets[n.id] ?? { x: 0, y: 0 });
        return { ...n, x: n.place[0] + o.x, y: n.place[1] + o.y, value: VALUE[n.id] };
      }),
    [offsets],
  );
  const ribbons = useMemo(() => buildRibbons(placed), [placed]);

  const focus = dragging ?? hover;
  const active = useMemo(() => {
    if (!focus) return null;
    const set = new Set([focus]);
    for (const l of LINKS) if (l.source === focus || l.target === focus) (set.add(l.source), set.add(l.target));
    return set;
  }, [focus]);
  const ribbonOn = (r: Ribbon) => focus == null || r.source === focus || r.target === focus;
  const custom = Object.values(offsets).some((o) => Math.abs(o.x) > 0.5 || Math.abs(o.y) > 0.5);

  // Entrée : cartes en cascade, puis rubans et pourcentages.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || prefersReducedMotion()) return;
    // Sur la carte extérieure (rien d'autre n'y pose opacité ni transform), styles rendus en fin d'entrée.
    const cards = animate(stage.querySelectorAll(".dvsk-card"), {
      opacity: [0, 1],
      scale: [0.9, 1],
      duration: 520,
      delay: stagger(28),
      ease: "out(3)",
      onComplete: (a) => a.revert(),
    });
    const rubans = animate(stage.querySelectorAll("[data-dvsk-ribbon]"), {
      opacity: [0, 1],
      duration: 620,
      delay: stagger(22, { start: 260 }),
      ease: "out(2)",
    });
    const etiq = animate(stage.querySelectorAll("[data-dvsk-pct]"), {
      opacity: [0, 1],
      y: [4, 0],
      duration: 400,
      delay: stagger(20, { start: 900 }),
      ease: "out(3)",
    });
    return () => {
      cards.revert();
      rubans.revert();
      etiq.revert();
    };
  }, []);

  // Fond de scène : plan plein cadre peint par un nuanceur (dégradé sapin, nappe jade, halo de saisie, vignette).
  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "low-power" });
    } catch {
      return; // pas de WebGL : le sapin du conteneur fait office de fond
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 2;

    // Le ShaderMaterial écrit gl_FragColor sans encodage de sortie : l'hex est déclaré
    // déjà linéaire, sinon three le convertit et le sapin vire au noir.
    const teinte = (hex: number) => new THREE.Color().setHex(hex, THREE.LinearSRGBColorSpace);
    const reduced = prefersReducedMotion();
    const uniforms = {
      uTime: { value: 0 },
      uAspect: { value: VBW / VBH },
      uFocus: { value: new THREE.Vector2(0.5, 0.5) },
      uIntensity: { value: reduced ? 0.18 : 0 },
      uFocusColor: { value: teinte(0x84c9bd) },
      uDeep: { value: teinte(0x142826) },
      uSapin: { value: teinte(0x1d4741) },
      uJade: { value: teinte(0x84c9bd) },
    };
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
      `,
      fragmentShader: `
        precision mediump float;
        varying vec2 vUv;
        uniform float uTime, uAspect, uIntensity;
        uniform vec2 uFocus;
        uniform vec3 uFocusColor, uDeep, uSapin, uJade;
        void main() {
          vec3 col = mix(uDeep, uSapin, smoothstep(0.0, 1.0, vUv.y) * 0.75);
          float nappe = sin(vUv.x * 3.1 + uTime * 0.19) * sin(vUv.y * 2.3 - uTime * 0.13);
          col += uJade * (0.045 * (0.5 + 0.5 * nappe));
          vec2 d = (vUv - uFocus) * vec2(uAspect, 1.0);
          col += uFocusColor * exp(-dot(d, d) * 11.0) * uIntensity * 0.30;
          vec2 v = (vUv - 0.5) * vec2(uAspect, 1.0);
          col *= 1.0 - smoothstep(0.60, 1.50, length(v)) * 0.22;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    const focusColor = teinte(0x84c9bd);
    let raf = 0;
    let running = false;
    let visible = true;
    let last: number | null = null;

    const resize = () => {
      // Taille de mise en page (offset*) : insensible au transform: scale du parent.
      const w = stage.offsetWidth;
      const h = stage.offsetHeight;
      if (w <= 0 || h <= 0) return;
      renderer.setSize(w, h, false);
      uniforms.uAspect.value = w / h;
      if (!running) renderer.render(scene, camera);
    };

    const tick = (now: number) => {
      const dt = last == null ? 0 : Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduced) uniforms.uTime.value += dt;
      const f = focusRef.current;
      const cible = f ? 1 : 0.18;
      uniforms.uIntensity.value += (cible - uniforms.uIntensity.value) * 0.08;
      if (f) {
        focusColor.setStyle(f.color, THREE.LinearSRGBColorSpace);
        uniforms.uFocus.value.x += (f.x - uniforms.uFocus.value.x) * 0.12;
        uniforms.uFocus.value.y += (f.y - uniforms.uFocus.value.y) * 0.12;
      }
      uniforms.uFocusColor.value.lerp(focusColor, 0.08);
      renderer.render(scene, camera);
      // Mouvement réduit : la nappe se fige, seul le halo de saisie (retour au geste) relance la boucle.
      const calme = Math.abs(cible - uniforms.uIntensity.value) < 0.003;
      if (!visible || (reduced && !f && calme)) {
        running = false;
        last = null;
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (running || !visible) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    kickRef.current = kick;

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) kick();
    });
    io.observe(stage);
    kick();

    return () => {
      kickRef.current = () => {};
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  const setFocusFrom = (id: string, o: Offset) => {
    const n = BY_ID.get(id)!;
    focusRef.current = {
      x: (n.place[0] + o.x + NW / 2) / VBW,
      y: 1 - (n.place[1] + o.y + NH / 2) / VBH,
      color: n.color,
    };
    kickRef.current();
  };

  const releaseFocus = () => {
    const f = focusRef.current;
    window.setTimeout(() => {
      if (focusRef.current === f) focusRef.current = null;
    }, 700);
  };

  // Glisser : événements pointeur, deltas convertis par le rapport rect / cadre (robuste au scale CSS).
  const onDown = (id: string) => (e: RPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const stage = stageRef.current;
    if (!stage) return;
    resetAnim.current?.pause();
    const rect = stage.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const o = offsets[id] ?? { x: 0, y: 0 };
    dragRef.current = { id, sx: e.clientX, sy: e.clientY, ox: o.x, oy: o.y, kx: VBW / rect.width, ky: VBH / rect.height };
    setDragging(id);
    setFocusFrom(id, o);
  };
  const onMove = (id: string) => (e: RPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || d.id !== id) return;
    const n = BY_ID.get(id)!;
    const o = clampOffset(n, { x: d.ox + (e.clientX - d.sx) * d.kx, y: d.oy + (e.clientY - d.sy) * d.ky });
    setOffsets((prev) => ({ ...prev, [id]: o }));
    setFocusFrom(id, o);
  };
  const onUp = (id: string) => (e: RPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || d.id !== id) return;
    dragRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(null);
    setOffsets((prev) => (saveOffsets(prev), prev));
    releaseFocus();
  };
  // Clavier : flèches = 10 px, Maj = 40 px.
  const onKey = (id: string) => (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 40 : 10;
    const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!dir) return;
    e.preventDefault();
    const n = BY_ID.get(id)!;
    setOffsets((prev) => {
      const cur = prev[id] ?? { x: 0, y: 0 };
      const next = { ...prev, [id]: clampOffset(n, { x: cur.x + dir[0] * step, y: cur.y + dir[1] * step }) };
      saveOffsets(next);
      return next;
    });
  };

  const reset = () => {
    const from = { ...offsets };
    saveOffsets({});
    if (prefersReducedMotion()) {
      setOffsets({});
      return;
    }
    const box = { t: 0 };
    resetAnim.current?.pause();
    resetAnim.current = animate(box, {
      t: 1,
      duration: 750,
      ease: "inOut(3)",
      onUpdate: () =>
        setOffsets(Object.fromEntries(Object.entries(from).map(([id, o]) => [id, { x: o.x * (1 - box.t), y: o.y * (1 - box.t) }]))),
      onComplete: () => setOffsets({}),
    });
  };
  useEffect(() => () => void resetAnim.current?.pause(), []);

  const tipNode = focus && !dragging ? placed.find((p) => p.id === focus) ?? null : null;
  const tipOuts = tipNode
    ? LINKS.filter((l) => l.source === tipNode.id)
        .sort((a, b) => b.value - a.value)
        .slice(0, 4)
    : [];

  return (
    <div className="dvsk-root" ref={stageRef}>
      <style>{CSS}</style>
      <canvas ref={canvasRef} aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />

      {/* En-tête */}
      <div style={{ position: "absolute", left: 20, right: 20, top: 12, display: "flex", alignItems: "center", gap: 18, zIndex: 20, pointerEvents: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, display: "grid", placeItems: "center", background: "rgba(27,191,160,.16)", color: T.jadeCta }}>
            <GitFork size={16} strokeWidth={2} style={{ transform: "rotate(90deg)" }} />
          </span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-.01em", lineHeight: 1.1 }}>Flux par étape</div>
            <div style={{ fontSize: 10.5, color: "rgba(254,239,224,.5)", marginTop: 3 }}>
              Flux fictif · <CountUp value={TOTAL} /> éléments · glisser les étapes pour les déplacer
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, marginLeft: "auto" }}>
          {FAMILIES.map((f) => (
            <span key={f.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10.5, color: "rgba(254,239,224,.7)" }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: f.color }} />
              {f.label}
            </span>
          ))}
        </div>
        <button type="button" className="dvsk-btn" onClick={reset} disabled={!custom} title="Replacer les étapes dans la disposition par défaut" style={{ pointerEvents: "auto" }}>
          <RotateCcw size={13} aria-hidden />
          Réinitialiser
        </button>
      </div>

      {/* Rubans */}
      <svg viewBox={`0 0 ${VBW} ${VBH}`} preserveAspectRatio="none" aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        <defs>
          <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.1" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {ribbons.map((r) => (
            <linearGradient key={r.id} id={`${uid}-${r.id}`} gradientUnits="userSpaceOnUse" x1={r.gx0} y1="0" x2={r.gx1} y2="0">
              <stop offset="0%" stopColor={r.from} stopOpacity="0.9" />
              <stop offset="100%" stopColor={r.to} stopOpacity="0.85" />
            </linearGradient>
          ))}
        </defs>
        <g filter={`url(#${uid}-soft)`}>
          {ribbons.map((r) => (
            <g key={r.id} data-dvsk-ribbon>
              <path d={r.d} fill={`url(#${uid}-${r.id})`} style={{ opacity: ribbonOn(r) ? 0.72 : 0.07, transition: "opacity .2s ease" }} />
            </g>
          ))}
        </g>
      </svg>

      {/* Pourcentages : part du flux sortant de la carte amont, en HTML (le SVG est étiré). */}
      {ribbons
        .filter((r) => r.lx != null)
        .map((r) => (
          <div
            key={`p-${r.id}`}
            data-dvsk-pct
            style={{ position: "absolute", left: `${((r.lx ?? 0) / VBW) * 100}%`, top: `${(r.ly / VBH) * 100}%`, zIndex: 5, pointerEvents: "none" }}
          >
            <span
              style={{
                display: "block",
                transform: "translate(-50%,-50%)",
                borderRadius: 4,
                padding: "1px 4px",
                fontSize: 9,
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
                color: "rgba(255,255,255,.92)",
                background: "rgba(20,40,38,.74)",
                opacity: ribbonOn(r) ? 1 : 0.1,
                transition: "opacity .2s ease",
              }}
            >
              {pct(r.part)}
            </span>
          </div>
        ))}

      {/* Cartes */}
      {placed.map((p) => {
        const Icon = p.icon;
        const dim = active != null && !active.has(p.id);
        const isDrag = dragging === p.id;
        return (
          <div
            key={p.id}
            className="dvsk-card"
            role="button"
            tabIndex={0}
            aria-label={`${p.label.replace("\n", " ")}, ${formatFr(p.value)} éléments. Glisser ou flèches pour déplacer.`}
            data-drag={isDrag ? "" : undefined}
            onPointerDown={onDown(p.id)}
            onPointerMove={onMove(p.id)}
            onPointerUp={onUp(p.id)}
            onPointerCancel={onUp(p.id)}
            onKeyDown={onKey(p.id)}
            onPointerEnter={() => !dragRef.current && setHover(p.id)}
            onPointerLeave={() => !dragRef.current && setHover((h) => (h === p.id ? null : h))}
            onFocus={() => setHover(p.id)}
            onBlur={() => setHover((h) => (h === p.id ? null : h))}
            style={{
              left: `${(p.x / VBW) * 100}%`,
              top: `${(p.y / VBH) * 100}%`,
              width: `${(NW / VBW) * 100}%`,
              height: `${(NH / VBH) * 100}%`,
              zIndex: isDrag ? 30 : 10,
            }}
          >
            <div
              className="dvsk-in"
              style={{
                opacity: dim ? 0.25 : 1,
                border: `1px solid ${p.color}${isDrag ? "cc" : "66"}`,
                boxShadow: isDrag
                  ? `0 14px 40px ${p.color}55, inset 0 1px 0 rgba(255,255,255,.08)`
                  : `0 6px 18px rgba(8,18,17,.45), inset 0 1px 0 rgba(255,255,255,.06)`,
              }}
            >
              <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: p.color }} />
              <GripVertical size={10} aria-hidden style={{ position: "absolute", right: 2, top: 3, opacity: 0.3 }} />
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 16, height: 16, borderRadius: 5, display: "grid", placeItems: "center", background: `${p.color}2e`, color: p.color, flexShrink: 0 }}>
                  <Icon size={10.5} strokeWidth={2.2} aria-hidden />
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                  <CountUp value={p.value} duration={1300} />
                </span>
              </span>
              <span style={{ fontSize: 9, fontWeight: 600, lineHeight: 1.18, textAlign: "center", whiteSpace: "pre-line", color: "rgba(254,239,224,.78)" }}>{p.label}</span>
            </div>
          </div>
        );
      })}

      {/* Info-bulle au survol */}
      {tipNode && (
        <div
          style={{
            position: "absolute",
            left: 16,
            bottom: 16,
            zIndex: 40,
            width: 250,
            pointerEvents: "none",
            borderRadius: 12,
            padding: "10px 12px",
            background: "rgba(14,30,28,.9)",
            border: "1px solid rgba(254,239,224,.14)",
            boxShadow: "0 18px 40px rgba(0,0,0,.4)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 8, height: 8, borderRadius: 3, background: tipNode.color }} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>{tipNode.label.replace("\n", " ")}</span>
          </div>
          <div style={{ fontSize: 11, color: "rgba(254,239,224,.6)", marginTop: 3, fontVariantNumeric: "tabular-nums" }}>
            {formatFr(tipNode.value)} éléments · {pct(tipNode.value / TOTAL)} des entrées
          </div>
          {tipOuts.length > 0 && (
            <div style={{ marginTop: 7, display: "flex", flexDirection: "column", gap: 4 }}>
              {tipOuts.map((l) => {
                const t = BY_ID.get(l.target)!;
                const part = l.value / (OUT_SUM[tipNode.id] || 1);
                return (
                  <div key={l.target} style={{ display: "grid", gridTemplateColumns: "1fr 60px 38px", alignItems: "center", gap: 6, fontSize: 10.5 }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "rgba(254,239,224,.8)" }}>→ {t.label.replace("\n", " ")}</span>
                    <span style={{ height: 4, borderRadius: 2, background: "rgba(254,239,224,.1)", overflow: "hidden" }}>
                      <span style={{ display: "block", height: "100%", width: `${part * 100}%`, background: t.color }} />
                    </span>
                    <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{pct(part)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
