import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { animate } from "animejs";
import { GitBranch, Layers, MousePointerClick, Move3d, Orbit, Users, X } from "lucide-react";
import { ACCS, ADVISORS, type Person } from "../../averroes/window/data/fiction";
import { Avatar } from "../../averroes/window/fx/Avatar";
import { CountUp } from "../../averroes/window/fx/CountUp";
import { prefersReducedMotion } from "../../averroes/window/fx/reducedMotion";
import { T } from "../../averroes/window/theme";

/* ---------- Réseau de parrainage fictif (aléa à graine fixe) ---------- */

type Status = "actif" | "onboarding" | "sortant";
type GNode = {
  i: number;
  person: Person;
  parent: number; // -1 = tête de réseau
  gen: number;
  status: Status;
  kids: number[];
  desc: number; // descendants (toute la lignée)
  root: number;
  x: number;
  y: number;
  z: number;
  size: number;
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

const RING = 6.4; // écart entre deux générations
const CORE = 2.6; // rayon du noyau (têtes de réseau)
const TWIST = 0.5; // torsion par génération : la spirale

function buildNetwork() {
  const r = rng(77031);
  const pool = [...ADVISORS, ...ACCS];
  const firsts = [...new Set(pool.map((p) => p.first))];
  const lasts = [...new Set(pool.map((p) => p.last))];
  const used = new Set<string>();
  const person = (i: number): Person => {
    for (;;) {
      const f = firsts[Math.floor(r() * firsts.length)];
      const l = lasts[Math.floor(r() * lasts.length)];
      if (used.has(f + l) && used.size < firsts.length * lasts.length) continue;
      used.add(f + l);
      return { id: `g${i}`, first: f, last: l, city: pool[Math.floor(r() * pool.length)].city };
    }
  };
  // Nombre moyen de filleuls par génération : le parrainage s'essouffle en profondeur.
  const MEAN = [5.6, 2.45, 1.8, 1.35, 1.0, 0.75, 0.5, 0.3];
  const nodes: GNode[] = [];
  const add = (parent: number, gen: number, root: number) => {
    const i = nodes.length;
    const u = r();
    const status: Status = gen === 0 ? "actif" : u < 0.13 ? "sortant" : u < 0.13 + 0.04 + gen * 0.02 ? "onboarding" : "actif";
    nodes.push({ i, person: person(i), parent, gen, status, kids: [], desc: 0, root: root < 0 ? i : root, x: 0, y: 0, z: 0, size: 1 });
    if (parent >= 0) nodes[parent].kids.push(i);
    return i;
  };
  for (let k = 0; k < 4; k++) add(-1, 0, -1);
  // Parcours en largeur, une génération à la fois.
  for (let head = 0; head < nodes.length && nodes.length < 380; head++) {
    const n = nodes[head];
    const mean = MEAN[Math.min(n.gen, MEAN.length - 1)] * (n.status === "sortant" ? 0.5 : 1);
    const raw = Math.floor(-Math.log(1 - r() * 0.999) * mean + r() * 0.6);
    const count = n.gen === 0 ? Math.max(4, Math.min(9, raw)) : Math.min(8, raw);
    for (let c = 0; c < count && nodes.length < 380; c++) add(n.i, n.gen + 1, n.root);
  }
  // Descendants et feuilles (ordre inverse = postordre pour un parcours en largeur).
  const leaves = new Array<number>(nodes.length).fill(1);
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i];
    if (n.kids.length) leaves[i] = n.kids.reduce((s, k) => s + leaves[k], 0);
    if (n.parent >= 0) nodes[n.parent].desc += n.desc + 1;
  }
  // Secteurs angulaires proportionnels aux feuilles, torsion par génération.
  const sector: [number, number][] = new Array(nodes.length);
  const roots = nodes.filter((n) => n.gen === 0);
  const total = roots.reduce((s, n) => s + leaves[n.i], 0);
  let cursor = 0;
  for (const n of roots) {
    const span = ((Math.PI * 2) * leaves[n.i]) / total;
    sector[n.i] = [cursor, cursor + span];
    cursor += span;
  }
  for (const n of nodes) {
    const [a0, a1] = sector[n.i];
    const mid = (a0 + a1) / 2 + n.gen * TWIST;
    const rad = CORE + n.gen * RING + (n.gen ? (r() - 0.5) * RING * 0.35 : 0);
    n.x = Math.cos(mid) * rad;
    n.z = Math.sin(mid) * rad;
    n.y = n.gen === 0 ? (r() - 0.5) * 1.5 : (r() - 0.5) * RING * (0.3 + n.gen * 0.07);
    n.size = Math.min(2.5, 0.32 + 0.27 * Math.log2(1 + n.desc) + (n.gen === 0 ? 0.4 : 0));
    let c = a0;
    const lt = n.kids.reduce((s, k) => s + leaves[k], 0) || 1;
    for (const k of n.kids) {
      const span = ((a1 - a0) * leaves[k]) / lt;
      sector[k] = [c, c + span];
      c += span;
    }
  }
  const maxGen = nodes.reduce((m, n) => Math.max(m, n.gen), 0);
  const biggest = roots.reduce((b, n) => (n.desc > b.desc ? n : b), roots[0]);
  return { nodes, maxGen, biggest, radius: CORE + maxGen * RING };
}

/* ---------- Couleurs (charte seule) ---------- */

const GEN_COLORS = ["#feefe0", "#1bbfa0", "#4fd6bd", "#84c9bd", "#a9d4c8", "#6f8f88"];
const STATUS_COLORS: Record<Exclude<Status, "actif">, string> = { onboarding: T.terracotta, sortant: T.rose };
const DIM = "#24423d";
const HOVER = "#ffffff";

const genColor = (g: number) => GEN_COLORS[Math.min(g, GEN_COLORS.length - 1)];
const nodeColor = (n: GNode) => (n.status === "actif" ? genColor(n.gen) : STATUS_COLORS[n.status]);
const genLabel = (g: number) => (g === 0 ? "Tête de réseau" : `Génération ${g}`);
const STATUS_LABEL: Record<Status, string> = { actif: "Actif", onboarding: "En onboarding", sortant: "Sortant" };

type Filter = { kind: "all" } | { kind: "actifs" } | { kind: "lineage"; id: number };

/* ---------- Styles ---------- */

const CSS = `
.dvgx{position:relative;width:100%;height:100%;overflow:hidden;background:${T.sapinDeep};background:radial-gradient(ellipse at 55% 50%,#1a3431 0%,#0f1d1b 70%);font-family:${T.font};color:${T.cream};user-select:none}
.dvgx canvas{position:absolute;inset:0;width:100%!important;height:100%!important;display:block;outline:none}
.dvgx-glass{position:absolute;background:rgba(15,29,27,.62);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(254,239,224,.12);border-radius:16px;box-shadow:0 18px 40px rgba(0,0,0,.35)}
.dvgx-card{top:18px;left:18px;width:318px;padding:14px 16px 14px}
.dvgx-title{display:flex;align-items:center;gap:9px;font-size:14px;font-weight:600;letter-spacing:-.01em}
.dvgx-title i{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:9px;background:rgba(27,191,160,.18);color:${T.jadeCta}}
.dvgx-sub{margin:3px 0 0 37px;font-size:10.5px;color:rgba(254,239,224,.55)}
.dvgx-kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:12px}
.dvgx-kpi{display:flex;flex-direction:column;align-items:center;text-align:center;gap:2px;padding:7px 4px;border-radius:10px;background:rgba(254,239,224,.05)}
.dvgx-kpi span{display:flex;align-items:center;gap:4px;font-size:9.5px;color:rgba(254,239,224,.6);white-space:nowrap}
.dvgx-kpi b{font-size:18px;font-weight:600;font-variant-numeric:tabular-nums;line-height:1.15}
.dvgx-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
.dvgx-chips button{display:inline-flex;align-items:center;gap:5px;border:1px solid rgba(254,239,224,.16);background:transparent;color:${T.cream};border-radius:999px;padding:5px 11px;font:400 11px/1.2 ${T.font};cursor:pointer;transition:background .2s,border-color .2s,color .2s}
.dvgx-chips button:hover{border-color:rgba(254,239,224,.4)}
.dvgx-chips button[aria-pressed=true]{border-color:${T.jadeCta};background:rgba(27,191,160,.2);color:#bff3e7;font-weight:500}
.dvgx-match{margin-top:9px;font-size:10.5px;color:rgba(254,239,224,.6)}
.dvgx-match b{color:${T.cream};font-weight:600}
.dvgx-legend{left:18px;bottom:18px;display:flex;gap:12px;align-items:center;padding:9px 14px;font-size:11px;color:rgba(254,239,224,.75)}
.dvgx-legend span{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.dvgx-legend i{width:9px;height:9px;border-radius:50%}
.dvgx-hint{right:18px;bottom:18px;display:flex;gap:12px;padding:9px 14px;font-size:10.5px;color:rgba(254,239,224,.62)}
.dvgx-hint span{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
.dvgx-label{position:absolute;left:0;top:0;pointer-events:none;will-change:transform;z-index:3}
.dvgx-pill{display:flex;align-items:center;gap:8px;padding:5px 11px 5px 5px;border-radius:999px;background:rgba(15,29,27,.88);border:1px solid rgba(254,239,224,.18);box-shadow:0 10px 26px rgba(0,0,0,.4);white-space:nowrap;transform:translate(-50%,calc(-100% - 14px));animation:dvgx-pop .22s cubic-bezier(.3,1.5,.5,1)}
.dvgx-pill b{display:block;font-size:12px;font-weight:600;line-height:1.2}
.dvgx-pill small{display:block;font-size:10px;color:rgba(254,239,224,.62);line-height:1.25}
.dvgx-st{margin-left:4px;font-size:9.5px;font-weight:600;padding:2px 7px;border-radius:999px}
@keyframes dvgx-pop{from{opacity:0;transform:translate(-50%,calc(-100% - 6px)) scale(.9)}to{opacity:1}}
@media (prefers-reduced-motion:reduce){.dvgx-pill{animation:none}}
`;

/* ---------- Composant ---------- */

type Api = { applyFilter: (match: (i: number) => boolean) => void; hover: (i: number) => void };

export function MlmGalaxy() {
  const net = useMemo(buildNetwork, []);
  const { nodes, maxGen, biggest } = net;
  const hostRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<Api | null>(null);
  const hoveredRef = useRef(-1);
  const [hovered, setHovered] = useState(-1);
  const [filter, setFilter] = useState<Filter>({ kind: "all" });
  const filterRef = useRef(filter);
  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

  // Ensemble en surbrillance : null = tout le réseau.
  const active = useMemo(() => {
    if (filter.kind === "all") return null;
    if (filter.kind === "actifs") return new Set(nodes.filter((n) => n.status === "actif").map((n) => n.i));
    // Lignée : le nœud, sa descendance et sa chaîne de parrains.
    const set = new Set<number>();
    const stack = [filter.id];
    while (stack.length) {
      const i = stack.pop()!;
      set.add(i);
      stack.push(...nodes[i].kids);
    }
    for (let p = nodes[filter.id].parent; p >= 0; p = nodes[p].parent) set.add(p);
    return set;
  }, [filter, nodes]);

  useEffect(() => {
    apiRef.current?.applyFilter((i) => !active || active.has(i));
  }, [active]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduced = prefersReducedMotion();
    const N = nodes.length;
    const W = () => host.clientWidth || 1100;
    const H = () => host.clientHeight || 640;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W(), H(), false);
    host.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0f1d1b, net.radius * 1.9, net.radius * 4 + 40);
    const camera = new THREE.PerspectiveCamera(50, W() / H(), 0.1, 2000);
    const dist = net.radius * 1.5 + 8;
    camera.position.set(dist * 0.55, dist * 0.6, dist * 0.6);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = !reduced;
    controls.autoRotateSpeed = 0.4;
    controls.minDistance = 10;
    controls.maxDistance = dist * 2.4;
    let touched = false;
    const onStart = () => {
      touched = true;
      controls.autoRotate = false;
    };
    controls.addEventListener("start", onStart);

    // Poussière d'étoiles en fond, pour la profondeur.
    const sr = rng(9);
    const starPos = new Float32Array(600 * 3);
    for (let k = 0; k < 600; k++) {
      const v = new THREE.Vector3(sr() - 0.5, sr() - 0.5, sr() - 0.5).normalize().multiplyScalar(net.radius * (2.4 + sr() * 2));
      starPos.set([v.x, v.y, v.z], k * 3);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xfeefe0, size: 0.35, transparent: true, opacity: 0.35, fog: false });
    scene.add(new THREE.Points(starGeo, starMat));

    // Nœuds : une seule InstancedMesh, couleur par instance.
    const geo = new THREE.SphereGeometry(1, 18, 14);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const mesh = new THREE.InstancedMesh(geo, mat, N);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(mesh);
    const tmp = new THREE.Color();
    let match: (i: number) => boolean = () => true;
    const paint = (i: number) => mesh.setColorAt(i, tmp.set(i === hoveredRef.current ? HOVER : match(i) ? nodeColor(nodes[i]) : DIM));
    for (let i = 0; i < N; i++) paint(i);

    // Sphères de visée invisibles, agrandies : même les petits nœuds se survolent.
    const hitGeo = new THREE.SphereGeometry(1, 8, 6);
    const hit = new THREE.InstancedMesh(hitGeo, mat, N);
    const dummy = new THREE.Object3D();
    nodes.forEach((n, i) => {
      dummy.position.set(n.x, n.y, n.z);
      dummy.scale.setScalar(Math.max(n.size * 1.2, 1.5));
      dummy.updateMatrix();
      hit.setMatrixAt(i, dummy.matrix);
    });
    hit.computeBoundingSphere();

    // Liens parrain → filleul.
    const links = nodes.filter((n) => n.parent >= 0);
    const linkPos = new Float32Array(links.length * 6);
    const linkCol = new Float32Array(links.length * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linkPos, 3).setUsage(THREE.DynamicDrawUsage));
    lineGeo.setAttribute("color", new THREE.BufferAttribute(linkCol, 3));
    const lineMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.34, depthWrite: false });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    lines.frustumCulled = false;
    scene.add(lines);
    const paintLinks = () => {
      links.forEach((n, k) => {
        const on = match(n.i) && match(n.parent);
        tmp.set(on ? nodeColor(nodes[n.parent]) : DIM);
        linkCol.set([tmp.r, tmp.g, tmp.b], k * 6);
        tmp.set(on ? nodeColor(n) : DIM);
        linkCol.set([tmp.r, tmp.g, tmp.b], k * 6 + 3);
      });
      lineGeo.attributes.color.needsUpdate = true;
    };
    paintLinks();

    // État animé par nœud (anime.js le fait vivre, la boucle l'écrit dans les matrices).
    const st = nodes.map((n) => (reduced ? { x: n.x, y: n.y, z: n.z, s: n.size } : { x: 0, y: 0, z: 0, s: 0 }));
    const targetS = (i: number) => (match(i) ? nodes[i].size : nodes[i].size * 0.35);
    const anims: { pause: () => unknown }[] = [];
    if (!reduced) {
      anims.push(
        animate(st, {
          x: (_t?: unknown, i = 0) => nodes[i].x,
          y: (_t?: unknown, i = 0) => nodes[i].y,
          z: (_t?: unknown, i = 0) => nodes[i].z,
          s: (_t?: unknown, i = 0) => targetS(i),
          delay: (_t?: unknown, i = 0) => nodes[i].gen * 120 + (i % 24) * 7,
          duration: 950,
          ease: "outExpo",
        }),
      );
    }

    apiRef.current = {
      applyFilter(m) {
        match = m;
        for (let i = 0; i < N; i++) paint(i);
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        paintLinks();
        if (reduced) st.forEach((o, i) => (o.s = targetS(i)));
        else anims.push(animate(st, { s: (_t?: unknown, i = 0) => (i === hoveredRef.current ? nodes[i].size * 1.6 : targetS(i)), duration: 380, ease: "outQuad" }));
      },
      hover(i) {
        const prev = hoveredRef.current;
        hoveredRef.current = i;
        if (prev >= 0) {
          paint(prev);
          if (reduced) st[prev].s = targetS(prev);
          else anims.push(animate(st[prev], { s: targetS(prev), duration: 220, ease: "outQuad" }));
        }
        if (i >= 0) {
          paint(i);
          if (reduced) st[i].s = nodes[i].size * 1.6;
          else anims.push(animate(st[i], { s: nodes[i].size * 1.6, duration: 280, ease: "outBack" }));
        }
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        // La rotation automatique s'arrête pendant le survol, pour garder la cible.
        controls.autoRotate = !reduced && !touched && i < 0;
      },
    };

    // Survol et clic : rayon lancé sur les sphères de visée.
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const pick = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hits = ray.intersectObject(hit, false);
      return hits.length && hits[0].instanceId != null ? hits[0].instanceId : -1;
    };
    const onMove = (e: PointerEvent) => {
      if (e.buttons) return;
      const i = pick(e);
      if (i !== hoveredRef.current) {
        apiRef.current?.hover(i);
        setHovered(i);
        renderer.domElement.style.cursor = i >= 0 ? "pointer" : "grab";
      }
    };
    const onLeave = () => {
      if (hoveredRef.current >= 0) {
        apiRef.current?.hover(-1);
        setHovered(-1);
      }
    };
    let down: { x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => (down = { x: e.clientX, y: e.clientY });
    const onUp = (e: PointerEvent) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
      down = null;
      const i = pick(e);
      if (i >= 0) setFilter({ kind: "lineage", id: i });
      else if (filterRef.current.kind === "lineage") setFilter({ kind: "all" });
    };
    const el = renderer.domElement;
    el.style.cursor = "grab";
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);

    // Boucle de rendu, suspendue hors écran et onglet caché.
    const proj = new THREE.Vector3();
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      controls.update();
      for (let i = 0; i < N; i++) {
        const o = st[i];
        dummy.position.set(o.x, o.y, o.z);
        dummy.scale.setScalar(Math.max(o.s, 0.0001));
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      links.forEach((n, k) => {
        const a = st[n.parent];
        const b = st[n.i];
        linkPos[k * 6] = a.x; linkPos[k * 6 + 1] = a.y; linkPos[k * 6 + 2] = a.z;
        linkPos[k * 6 + 3] = b.x; linkPos[k * 6 + 4] = b.y; linkPos[k * 6 + 5] = b.z;
      });
      lineGeo.attributes.position.needsUpdate = true;
      const h = hoveredRef.current;
      if (h >= 0 && labelRef.current) {
        proj.set(st[h].x, st[h].y + st[h].s, st[h].z).project(camera);
        // Étiquette gardée dans le cadre (elle fait ~320 px de large).
        const lx = Math.min(Math.max(((proj.x + 1) / 2) * W(), 170), W() - 170);
        const ly = Math.max(((1 - proj.y) / 2) * H(), 60);
        labelRef.current.style.transform = `translate(${lx}px,${ly}px)`;
      }
      renderer.render(scene, camera);
    };
    let inView = true;
    const sync = () => {
      const run = inView && !document.hidden;
      if (run && !raf) raf = requestAnimationFrame(frame);
      if (!run && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const io = new IntersectionObserver(([en]) => {
      inView = en.isIntersecting;
      sync();
    });
    io.observe(host);
    document.addEventListener("visibilitychange", sync);
    const ro = new ResizeObserver(() => {
      renderer.setSize(W(), H(), false);
      camera.aspect = W() / H();
      camera.updateProjectionMatrix();
    });
    ro.observe(host);
    sync();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
      controls.removeEventListener("start", onStart);
      controls.dispose();
      anims.forEach((a) => a.pause());
      [geo, hitGeo, lineGeo, starGeo].forEach((g) => g.dispose());
      [mat, lineMat, starMat].forEach((m) => m.dispose());
      mesh.dispose();
      hit.dispose();
      renderer.dispose();
      el.remove();
      apiRef.current = null;
      hoveredRef.current = -1;
    };
  }, [nodes, net.radius]);

  const h = hovered >= 0 ? nodes[hovered] : null;
  const focusNode = filter.kind === "lineage" && filter.id !== biggest.i ? nodes[filter.id] : null;

  return (
    <div className="dvgx" ref={hostRef} data-lenis-prevent-wheel>
      <style>{CSS}</style>

      <div className="dvgx-glass dvgx-card">
        <div className="dvgx-title">
          <i><Orbit size={15} /></i>
          Galaxie du parrainage
        </div>
        <div className="dvgx-sub">Têtes de réseau au cœur, filleuls en spirale</div>
        <div className="dvgx-kpis">
          <div className="dvgx-kpi">
            <span><Users size={11} />Conseillers</span>
            <b><CountUp value={nodes.length} /></b>
          </div>
          <div className="dvgx-kpi">
            <span><Layers size={11} />Générations</span>
            <b><CountUp value={maxGen + 1} delay={120} /></b>
          </div>
          <div className="dvgx-kpi">
            <span><GitBranch size={11} />Plus grande lignée</span>
            <b><CountUp value={biggest.desc + 1} delay={240} /></b>
          </div>
        </div>
        <div className="dvgx-chips">
          <button aria-pressed={filter.kind === "all"} onClick={() => setFilter({ kind: "all" })}>Tous</button>
          <button aria-pressed={filter.kind === "actifs"} onClick={() => setFilter({ kind: "actifs" })}>Actifs</button>
          <button
            aria-pressed={filter.kind === "lineage" && filter.id === biggest.i}
            onClick={() => setFilter({ kind: "lineage", id: biggest.i })}
          >
            <Avatar person={biggest.person} size={16} dark />
            Lignée {biggest.person.first}
          </button>
          {focusNode && (
            <button aria-pressed onClick={() => setFilter({ kind: "all" })} title="Retirer la sélection">
              <Avatar person={focusNode.person} size={16} dark />
              {focusNode.person.first} {focusNode.person.last[0]}.
              <X size={11} />
            </button>
          )}
        </div>
        {active && (
          <div className="dvgx-match">
            <b>{active.size.toLocaleString("fr-FR")}</b> conseillers en surbrillance
          </div>
        )}
      </div>

      <div className="dvgx-glass dvgx-legend">
        {GEN_COLORS.map((c, g) => (
          <span key={c}><i style={{ background: c }} />{g === 0 ? "Tête" : g === GEN_COLORS.length - 1 ? `G${g}+` : `G${g}`}</span>
        ))}
        <span><i style={{ background: T.terracotta }} />Onboarding</span>
        <span><i style={{ background: T.rose }} />Sortant</span>
      </div>

      <div className="dvgx-glass dvgx-hint">
        <span><Move3d size={12} />Glisser : orbiter · molette : zoom</span>
        <span><MousePointerClick size={12} />Clic : isoler une lignée</span>
      </div>

      <div className="dvgx-label" ref={labelRef} style={{ display: h ? "block" : "none" }}>
        {h && (
          <div className="dvgx-pill" key={h.i}>
            <Avatar person={h.person} size={26} dark />
            <div>
              <b>{h.person.first} {h.person.last}</b>
              <small>
                {h.kids.length} filleul{h.kids.length > 1 ? "s" : ""} · {h.desc} dans la lignée · {genLabel(h.gen)}
              </small>
            </div>
            <span
              className="dvgx-st"
              style={{
                background: h.status === "actif" ? "rgba(27,191,160,.2)" : h.status === "onboarding" ? "rgba(236,96,72,.2)" : "rgba(192,49,99,.25)",
                color: h.status === "actif" ? "#9fe9d9" : h.status === "onboarding" ? "#f6a294" : "#ec8cae",
              }}
            >
              {STATUS_LABEL[h.status]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
