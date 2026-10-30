import { useEffect, useRef } from "react";
import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from "ogl";
import type { Project } from "../content";
import "./FlowGallery.css";

/* Flowing gallery: the cards ride an endless curved sheet. Near the centre the sheet
   swells towards the viewer, towards the edges it banks away, so each card bends as
   it travels. One WebGL canvas (ogl); each card's picture, title and button are drawn
   into a single texture so the text bends with the card. Drag, horizontal scroll or
   let it drift; click a card to open it. */

const VERT = /* glsl */ `
precision highp float;
attribute vec3 position;
attribute vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uX;        // card centre on the sheet, px
uniform float uHalf;     // half the viewport width, px
uniform float uDepth;    // how far the centre swells forward, px
uniform float uBank;     // how much cards roll with the slope of the sheet
uniform float uHover;    // 0..1
uniform float uSize;     // card height, px
uniform vec2 uPlane;     // card size, px
varying vec2 vUv;
varying float vZ;

const float PI = 3.141592653589793;
uniform float uCurve;    // 0 = bowl, 1 = S
uniform float uSpread;   // how many half-widths the curve spans
float shape(float q) {
  return mix(1.0 - q * q, sin(PI * q), uCurve) * exp(-q * q);
}
float slope(float q) {
  float g = exp(-q * q);
  return mix(-2.0 * q * (2.0 - q * q), PI * cos(PI * q) - 2.0 * q * sin(PI * q), uCurve) * g;
}

void main() {
  vUv = uv;
  vec3 p = vec3(position.xy * uPlane, 0.0);
  float x = uX + p.x;
  float q = x / uHalf * uSpread - 0.2;
  // hover: a soft dent pressed into the middle of the card
  vec2 c = uv * 2.0 - 1.0;
  p.z -= uHover * 0.06 * uSize * (1.0 - c.x * c.x) * (1.0 - c.y * c.y);
  // roll around the horizontal axis, following the slope of the sheet
  float roll = uBank * slope(q) / PI;
  float y = p.y * cos(roll) - p.z * sin(roll);
  float z = p.y * sin(roll) + p.z * cos(roll);
  z += -uDepth * shape(q) + uDepth * 0.2;
  y += -0.03 * x;          // the sheet runs slightly downhill, left to right
  vZ = z;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(x, y, z, 1.0);
}`;

const FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tMap;
uniform vec2 uPlane;     // card size, px
uniform float uRadius;   // corner radius, px
uniform float uDepth;
uniform float uHoverF;
varying vec2 vUv;
varying float vZ;

float roundBox(vec2 p, vec2 b, float r) {
  vec2 d = abs(p) - b + r;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
}

void main() {
  vec2 px = (vUv - 0.5) * uPlane;
  float d = roundBox(px, uPlane * 0.5, uRadius);
  float aa = 1.2;
  float alpha = 1.0 - smoothstep(-aa, aa, d);
  if (alpha <= 0.0) discard;
  vec3 col = texture2D(tMap, vUv).rgb;
  // light: the part of the sheet nearest the viewer is brightest
  float lit = mix(0.55, 1.0, smoothstep(-uDepth * 0.7, uDepth * 0.5, vZ));
  gl_FragColor = vec4(col * mix(lit, 1.0, uHoverF * 0.25), alpha);
}`;

type Card = { mesh: Mesh; program: Program; base: number; hover: number; href: string };

const TEX_W = 1120;
const TEX_H = 860;

/** Draws one card (cover-fit picture, scrim, title, button) into a canvas used as its texture. */
function drawCard(img: HTMLImageElement | null, project: Project): HTMLCanvasElement {
  const cv = document.createElement("canvas");
  cv.width = TEX_W;
  cv.height = TEX_H;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#151515";
  g.fillRect(0, 0, TEX_W, TEX_H);
  if (img) {
    const s = Math.max(TEX_W / img.naturalWidth, TEX_H / img.naturalHeight);
    const w = img.naturalWidth * s, h = img.naturalHeight * s;
    const [px, py] = (project.position ?? "50% 50%").split(" ").map((v) => parseFloat(v) / 100);
    g.drawImage(img, (TEX_W - w) * (px || 0.5), (TEX_H - h) * (py || 0.5), w, h);
  }
  const scrim = g.createLinearGradient(0, TEX_H * 0.45, 0, TEX_H);
  scrim.addColorStop(0, "rgba(0,0,0,0)");
  scrim.addColorStop(1, "rgba(0,0,0,0.78)");
  g.fillStyle = scrim;
  g.fillRect(0, 0, TEX_W, TEX_H);

  g.textBaseline = "alphabetic";
  // "See project" pill, bottom right
  const label = "See project";
  g.font = `500 28px "Inter Tight", system-ui, sans-serif`;
  const tw = g.measureText(label).width;
  const bw = tw + 104, bh = 64, bx = TEX_W - bw - 48, by = TEX_H - bh - 64;
  g.fillStyle = "rgba(255,255,255,0.14)";
  g.strokeStyle = "rgba(255,255,255,0.45)";
  g.lineWidth = 2;
  g.beginPath();
  g.roundRect(bx, by, bw, bh, bh / 2);
  g.fill();
  g.stroke();
  g.fillStyle = "#fff";
  g.fillText(label, bx + 30, by + 42);
  // arrow
  const ax = bx + bw - 44, ay = by + bh / 2;
  g.strokeStyle = "#fff";
  g.lineWidth = 3;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(ax - 9, ay);
  g.lineTo(ax + 9, ay);
  g.moveTo(ax + 2, ay - 7);
  g.lineTo(ax + 9, ay);
  g.lineTo(ax + 2, ay + 7);
  g.stroke();
  // title, bottom left, shrunk until it clears the button
  let size = 80;
  g.fillStyle = "#fff";
  do {
    g.font = `400 ${size}px "Instrument Serif", Georgia, serif`;
    size -= 2;
  } while (g.measureText(project.title).width > bx - 56 - 36 && size > 40);
  g.fillText(project.title, 56, TEX_H - 76);
  return cv;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((res) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = src;
  });
}

export function FlowGallery({ projects }: { projects: Project[] }) {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 2) });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    el.appendChild(gl.canvas);

    const camera = new Camera(gl, { fov: 40, near: 1, far: 10000 });
    const scene = new Transform();

    let W = 0, H = 0, cardW = 0, cardH = 0, gap = 0, span = 0;
    const cards: Card[] = [];
    let disposed = false;

    const layout = () => {
      W = el.clientWidth;
      H = el.clientHeight;
      renderer.setSize(W, H);
      camera.perspective({ aspect: W / H });
      camera.position.z = H / 2 / Math.tan((40 * Math.PI) / 360); // 1 unit = 1 css px at z = 0
      const phone = W < 810;
      cardW = phone ? W * 0.8 : Math.min(600, W * 0.4);
      cardH = cardW * (TEX_H / TEX_W);
      gap = phone ? 12 : 18;
      span = (cardW + gap) * projects.length;
      for (const c of cards) {
        c.program.uniforms.uPlane.value = [cardW, cardH];
        c.program.uniforms.uSize.value = cardH;
        c.program.uniforms.uRadius.value = cardH * 0.06;
      }
    };

    const geometry = new Plane(gl, { widthSegments: 48, heightSegments: 24 });

    (async () => {
      await document.fonts?.ready;
      const imgs = await Promise.all(projects.map((p) => loadImage(p.image)));
      if (disposed) return;
      projects.forEach((p, i) => {
        const texture = new Texture(gl, { generateMipmaps: false });
        texture.image = drawCard(imgs[i], p);
        const program = new Program(gl, {
          vertex: VERT,
          fragment: FRAG,
          transparent: true,
          cullFace: false,
          uniforms: {
            tMap: { value: texture },
            uX: { value: 0 },
            uHalf: { value: 1 },
            uDepth: { value: 1 },
            uBank: { value: 0.16 },
            uCurve: { value: 0.7 },
            uSpread: { value: 1.1 },
            uHoverF: { value: 0 },
            uHover: { value: 0 },
            uSize: { value: 1 },
            uPlane: { value: [1, 1] },
            uRadius: { value: 20 },
          },
        });
        const mesh = new Mesh(gl, { geometry, program });
        mesh.setParent(scene);
        cards.push({ mesh, program, base: i, hover: 0, href: p.href });
      });
      layout();
    })();

    // ---- motion: target / current scroll with easing, drag, horizontal wheel, idle drift
    let target = 0, current = 0, last = 0;
    let dragging = false, dragX = 0, dragStart = 0, moved = 0;
    let pointer: { x: number; y: number } | null = null;
    let idle = 0;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      dragX = e.clientX;
      dragStart = target;
      moved = 0;
      el.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
      if (!dragging) return;
      const dx = e.clientX - dragX;
      moved = Math.max(moved, Math.abs(dx));
      target = dragStart - dx * 1.4;
      idle = 0;
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      if (moved < 6) {
        const c = hovered();
        // an outside site opens in a new tab, the portfolio's own pages in place
        if (c && /^https?:/.test(c.href)) window.open(c.href, "_blank", "noopener");
        else if (c) window.location.href = c.href;
      }
    };
    const onLeave = () => {
      pointer = null;
    };
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // vertical scroll stays the page's
      e.preventDefault();
      target += e.deltaX * 1.2;
      idle = 0;
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("wheel", onWheel, { passive: false });

    const wrapX = (i: number) => {
      // card centre on the sheet, wrapped so the row loops forever, centred on 0
      let x = i * (cardW + gap) - current;
      x = ((x % span) + span) % span;
      if (x > span / 2) x -= span;
      return x;
    };

    // which card is under the pointer (using the projected centre of the sheet)
    const hovered = () => {
      if (!pointer || !cards.length) return null;
      const px = pointer.x - W / 2;
      if (Math.abs(pointer.y - H / 2) > cardH * 0.7) return null;
      let best: Card | null = null;
      let bd = Infinity;
      for (const c of cards) {
        const x = wrapX(c.base);
        const q = (x / (W / 2)) * 1.1 - 0.2;
        const z = -(0.3 * (1 - q * q) + 0.7 * Math.sin(Math.PI * q)) * Math.exp(-q * q) * depth() + depth() * 0.2;
        const sx = (x * camera.position.z) / (camera.position.z - z);
        const half = ((cardW / 2) * camera.position.z) / (camera.position.z - z);
        const d = Math.abs(px - sx);
        if (d < half && d < bd) {
          bd = d;
          best = c;
        }
      }
      return best;
    };
    const depth = () => Math.min(300, W * 0.2);

    let raf = 0;
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
      last = t;
      if (!dragging && !reduce) {
        idle += dt;
        if (idle > 1.5) target += 22 * dt; // slow drift once left alone
      }
      current += (target - current) * Math.min(1, dt * 6);
      const h = hovered();
      el.style.cursor = dragging ? "grabbing" : h ? "pointer" : "grab";
      for (const c of cards) {
        c.hover += ((h === c ? 1 : 0) - c.hover) * Math.min(1, dt * 8);
        const u = c.program.uniforms;
        u.uX.value = wrapX(c.base);
        u.uHalf.value = W / 2;
        u.uDepth.value = depth();
        u.uHover.value = c.hover;
        u.uHoverF.value = c.hover;
      }
      renderer.render({ scene, camera });
    };
    raf = requestAnimationFrame(tick);

    const ro = new ResizeObserver(layout);
    ro.observe(el);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("wheel", onWheel);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl.canvas.remove();
    };
  }, [projects]);

  return (
    <div className="flow">
      <div ref={wrap} className="flow__stage" aria-label="Selected projects. Drag to explore, click a card to open it." role="region" />
      <p className="flow__hint">Drag to explore · click a card to open it</p>
      <ul className="flow__sr">
        {projects.map((p) => (
          <li key={p.title}>
            <a href={p.href} {...(/^https?:/.test(p.href) ? { target: "_blank", rel: "noopener" } : {})}>{p.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
