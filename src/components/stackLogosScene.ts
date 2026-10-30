import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { STACK_MARKS, type StackMark } from "./stackMarks";

/* The 3D scene behind StackLogos, loaded on demand (three.js is heavy). Each mark is
   extruded with a bevel and becomes a body: it flies in, collides softly
   with the others, then held to its own resting spot in a wide ellipse at a slight tilt.
   The cursor carries a small force field that keeps them at a distance; scrolling sloshes them. */

export type SceneOptions = {
  bounciness: number;
  damping: number;
  anchor: "center" | "top" | "bottom";
  label: HTMLElement;
};

const FOV = 30;
const CAM_Z = 20;
const PARALLAX = 0.4;

// Seeded, so the layout is the same on every visit.
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

/** One mark as beveled solids (one per coloured part), centred and scaled to a unit-wide box.
 *  Later parts stand prouder than earlier ones, so overlapping layers stack like the flat logo. */
function extrude(parts: StackMark["parts"], chrome: THREE.Texture): THREE.Group {
  const shaped = parts.map((part) => {
    // SVG y points down: flipped here, so the extrusion (and the raised layers) faces +z
    const svg = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path${part.evenodd ? ' fill-rule="evenodd"' : ""} transform="scale(1,-1)" d="${part.d}"/></svg>`);
    return { ...part, shapes: svg.paths.flatMap((p) => p.toShapes()) };
  });
  const box = new THREE.Box2();
  for (const { shapes } of shaped) for (const s of shapes) for (const p of s.getPoints()) box.expandByPoint(p);
  const size = box.getSize(new THREE.Vector2());
  const c = box.getCenter(new THREE.Vector2());
  const m = Math.max(size.x, size.y);
  const depth = m * 0.28;
  const rise = m * 0.035; // how much prouder each later layer stands
  const total = depth + rise * (shaped.length - 1);
  const group = new THREE.Group();
  shaped.forEach(({ color, metal, shapes }, k) => {
    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth: depth + rise * k,
      bevelEnabled: true,
      bevelThickness: m * 0.035,
      bevelSize: m * 0.018,
      bevelSegments: 4,
      curveSegments: 14,
    });
    geo.translate(-c.x, -c.y, -total / 2);
    geo.scale(1 / m, 1 / m, 1 / m);
    const material = metal
      ? new THREE.MeshStandardMaterial({ color, metalness: 1, roughness: 0.22, envMap: chrome, envMapIntensity: 1.4 })
      : new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0, emissive: color, emissiveIntensity: 0.14 });
    group.add(new THREE.Mesh(geo, material));
  });
  return group;
}

export function mountStackLogos(host: HTMLElement, opts: SceneOptions): () => void {
  const { label } = opts;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 100);
  camera.position.set(0, 0, CAM_Z);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envMap = pmrem.fromScene(room, 0.04).texture;
  scene.environment = envMap;
  // little ambient reflection: a bright room washes the brand colours out
  scene.environmentIntensity = 0.28;
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(-4, 6, 8);
  scene.add(key);

  // ---- bodies ----
  const random = rng(11);
  const N = STACK_MARKS.length;
  const meshes: THREE.Group[] = [];
  const size = new Float32Array(N);
  const r = new Float32Array(N); // collision radius
  const x = new Float32Array(N), y = new Float32Array(N), z = new Float32Array(N);
  const vx = new Float32Array(N), vy = new Float32Array(N), vz = new Float32Array(N);
  const qx = new Float32Array(N), qy = new Float32Array(N), qz = new Float32Array(N), qw = new Float32Array(N);
  const wx = new Float32Array(N), wy = new Float32Array(N), wz = new Float32Array(N);
  const inside = new Uint8Array(N);
  // where each logo rests, and the slight tilt it rests at (so the pile has depth, not a wall)
  const hx = new Float32Array(N), hy = new Float32Array(N), hz = new Float32Array(N);
  const tx = new Float32Array(N), ty = new Float32Array(N), tz = new Float32Array(N), tw = new Float32Array(N);
  const depth = new Float32Array(N);

  const tilt = new THREE.Quaternion();
  STACK_MARKS.forEach((mark, i) => {
    const mesh = extrude(mark.parts, envMap);
    scene.add(mesh);
    meshes.push(mesh);
    size[i] = 0.85 + random() * 0.3;
    depth[i] = random() * 2 - 1;
    tilt.setFromEuler(new THREE.Euler((random() - 0.5) * 0.7, (random() - 0.5) * 0.8, (random() - 0.5) * 0.35));
    [tx[i], ty[i], tz[i], tw[i]] = [tilt.x, tilt.y, tilt.z, tilt.w];
    [qx[i], qy[i], qz[i], qw[i]] = [tilt.x, tilt.y, tilt.z, tilt.w];
  });

  // ---- frame ----
  let W = 1, H = 1, S = 1;
  /** Spreads the resting spots over a wide ellipse, no two logos on top of each other. */
  const placeHomes = (a: number, b: number, cy: number) => {
    const place = rng(23);
    for (let i = 0; i < N; i++) {
      const ang = place() * Math.PI * 2;
      const rad = Math.sqrt(place());
      hx[i] = Math.cos(ang) * rad * a;
      hy[i] = Math.sin(ang) * rad * b;
    }
    for (let it = 0; it < 240; it++) {
      for (let i = 0; i < N; i++)
        for (let j = i + 1; j < N; j++) {
          const dx = hx[j] - hx[i], dy = hy[j] - hy[i];
          const min = (r[i] + r[j]) * 1.02;
          const d = Math.hypot(dx, dy) || 1e-4;
          if (d >= min) continue;
          const push = (min - d) / 2;
          hx[i] -= (dx / d) * push; hy[i] -= (dy / d) * push;
          hx[j] += (dx / d) * push; hy[j] += (dy / d) * push;
        }
      for (let i = 0; i < N; i++) {
        const ea = Math.max(a - r[i], 0.1), eb = Math.max(b - r[i], 0.1);
        const k = Math.hypot(hx[i] / ea, hy[i] / eb);
        if (k > 1) (hx[i] /= k), (hy[i] /= k);
      }
    }
    for (let i = 0; i < N; i++) {
      hy[i] += cy;
      hz[i] = depth[i] * S * 0.35;
    }
  };
  const layout = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    H = 2 * CAM_Z * Math.tan((FOV * Math.PI) / 360);
    W = H * (w / h);
    // the pile spreads over a wide ellipse (most of the width, most of the height) and the
    // logos fill about 60 % of it, as in the Framer component
    const halfH = H / 2 - PARALLAX - H * 0.06;
    const a = W * (w / h < 1.2 ? 0.44 : 0.37);
    const b = halfH * 0.92;
    let area = 0;
    for (let i = 0; i < N; i++) area += size[i] * size[i];
    S = Math.sqrt((0.6 * a * b) / (0.25 * area));
    S = Math.min(S, b * 0.62); // a narrow frame: never a logo taller than the band
    for (let i = 0; i < N; i++) r[i] = 0.48 * S * size[i];
    const cy = opts.anchor === "top" ? H * 0.12 : opts.anchor === "bottom" ? -H * 0.12 : 0;
    placeHomes(a, b, cy);
  };
  layout();

  // ---- solver ----
  const e = Math.max(0, Math.min(1, opts.bounciness));
  const pointer = { x: 0, y: 0, on: false };
  let slosh = 0;
  const wall = (depth: number) => (depth > 0 ? depth * 700 : 0);

  const step = (dt: number, live: boolean) => {
    const margin = H * 0.06;
    const halfW = W / 2 - margin;
    const halfH = H / 2 - PARALLAX - margin;
    const field = H * 0.06; // the cursor's force field: logos keep about this far from it
    const fade = Math.exp(-opts.damping * dt);
    const spinFade = Math.exp(-7.5 * dt);

    for (let i = 0; i < N; i++) {
      // each logo is held to its own resting spot, so the pile never collapses to the middle
      let fx = (hx[i] - x[i]) * 6;
      let fy = (hy[i] - y[i]) * 6 + slosh;
      const fz = (hz[i] - z[i]) * 10;
      if (live && pointer.on) {
        const px = x[i] - pointer.x;
        const py = y[i] - pointer.y;
        const d = Math.hypot(px, py) || 1e-4;
        const reach = field + r[i];
        if (d < reach) {
          const k = 1 - d / reach;
          fx += (px / d) * 320 * k;
          fy += (py / d) * 320 * k;
          // a faint lean away from the cursor
          wx[i] += (-py / d) * 1.2 * k * dt;
          wy[i] += (px / d) * 1.2 * k * dt;
        }
      }
      vx[i] = (vx[i] + fx * dt) * fade;
      vy[i] = (vy[i] + fy * dt) * fade;
      vz[i] = (vz[i] + fz * dt) * fade;
      x[i] += vx[i] * dt;
      y[i] += vy[i] * dt;
      z[i] += vz[i] * dt;

      // orientation: settle back to the resting tilt, damped so it never keeps turning.
      // error = q · conj(target), a world-frame rotation; its vector part drives the torque
      let ex = tw[i] * qx[i] - qw[i] * tx[i] - qy[i] * tz[i] + qz[i] * ty[i];
      let ey = tw[i] * qy[i] - qw[i] * ty[i] - qz[i] * tx[i] + qx[i] * tz[i];
      let ez = tw[i] * qz[i] - qw[i] * tz[i] - qx[i] * ty[i] + qy[i] * tx[i];
      const ew = qw[i] * tw[i] + qx[i] * tx[i] + qy[i] * ty[i] + qz[i] * tz[i];
      if (ew < 0) (ex = -ex), (ey = -ey), (ez = -ez);
      wx[i] = (wx[i] - ex * 14 * dt) * spinFade;
      wy[i] = (wy[i] - ey * 14 * dt) * spinFade;
      wz[i] = (wz[i] - ez * 14 * dt) * spinFade;
      const h = 0.5 * dt;
      const nx = qx[i] + h * (wx[i] * qw[i] + wy[i] * qz[i] - wz[i] * qy[i]);
      const ny = qy[i] + h * (wy[i] * qw[i] + wz[i] * qx[i] - wx[i] * qz[i]);
      const nz = qz[i] + h * (wz[i] * qw[i] + wx[i] * qy[i] - wy[i] * qx[i]);
      const nw = qw[i] - h * (wx[i] * qx[i] + wy[i] * qy[i] + wz[i] * qz[i]);
      const len = Math.hypot(nx, ny, nz, nw) || 1;
      qx[i] = nx / len;
      qy[i] = ny / len;
      qz[i] = nz / len;
      qw[i] = nw / len;
    }

    for (let pass = 0; pass < 2; pass++)
      for (let i = 0; i < N; i++)
        for (let j = i + 1; j < N; j++) {
          const dx = x[j] - x[i], dy = y[j] - y[i], dz = z[j] - z[i];
          const min = r[i] + r[j];
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 >= min * min) continue;
          const d = Math.sqrt(d2) || 1e-4;
          const nx = dx / d, ny = dy / d, nz = dz / d;
          const mi = size[i] ** 3, mj = size[j] ** 3;
          const push = (min - d) * 0.5; // soft: half the overlap per pass
          const si = mj / (mi + mj), sj = mi / (mi + mj);
          x[i] -= nx * push * si; y[i] -= ny * push * si; z[i] -= nz * push * si;
          x[j] += nx * push * sj; y[j] += ny * push * sj; z[j] += nz * push * sj;
          const rvx = vx[j] - vx[i], rvy = vy[j] - vy[i], rvz = vz[j] - vz[i];
          const vn = rvx * nx + rvy * ny + rvz * nz;
          if (vn >= 0) continue;
          const J = (-(1 + e) * vn) / (1 / mi + 1 / mj);
          vx[i] -= (J / mi) * nx; vy[i] -= (J / mi) * ny; vz[i] -= (J / mi) * nz;
          vx[j] += (J / mj) * nx; vy[j] += (J / mj) * ny; vz[j] += (J / mj) * nz;
          // resting contact (logos pressed together by the anchor) must not feed spin, only real hits
          if (!live || -vn < 2) continue;
          // the sliding part of the hit sets both spinning: n × relative velocity
          const sx = ny * rvz - nz * rvy, sy = nz * rvx - nx * rvz, sz = nx * rvy - ny * rvx;
          const k = 0.1 / S;
          wx[i] -= sx * k / size[i]; wy[i] -= sy * k / size[i]; wz[i] -= sz * k / size[i];
          wx[j] -= sx * k / size[j]; wy[j] -= sy * k / size[j]; wz[j] -= sz * k / size[j];
        }

    for (let i = 0; i < N; i++) {
      // soft walls, once a logo has come into the frame: pushed back, never snapped
      if (!inside[i]) {
        if (!(Math.abs(x[i]) < halfW - r[i] && Math.abs(y[i]) < halfH - r[i])) continue;
        inside[i] = 1;
      }
      vx[i] += (wall(-halfW + r[i] - x[i]) - wall(x[i] + r[i] - halfW)) * dt;
      vy[i] += (wall(-halfH + r[i] - y[i]) - wall(y[i] + r[i] - halfH)) * dt;
    }
  };

  const settle = () => {
    x.set(hx); y.set(hy); z.set(hz);
    inside.fill(1);
  };
  const converge = () => {
    for (let i = 0; i < N; i++) {
      const a = random() * Math.PI * 2;
      const d = Math.hypot(W, H) * 0.55 + r[i] + random() * W * 0.3;
      x[i] = Math.cos(a) * d;
      y[i] = Math.sin(a) * d;
      vx[i] = -Math.cos(a) * 9;
      vy[i] = -Math.sin(a) * 9;
      wx[i] = (random() - 0.5) * 1.6;
      wy[i] = (random() - 0.5) * 1.6;
      wz[i] = (random() - 0.5) * 0.5;
    }
  };

  // ---- draw ----
  let camY = 0;
  let lastTop: number | null = null;
  const render = () => {
    for (let i = 0; i < N; i++) {
      const m = meshes[i];
      m.position.set(x[i], y[i], z[i]);
      m.quaternion.set(qx[i], qy[i], qz[i], qw[i]);
      m.scale.setScalar(S * size[i]);
    }
    camera.position.y = camY;
    renderer.render(scene, camera);
  };

  let raf = 0, running = false, last = 0, started = false, t0 = 0;
  const frame = (time: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (time - (last || time)) / 1000);
    last = time;
    // scroll: the camera trails a little, and a fast scroll sloshes the logos
    const rect = host.getBoundingClientRect();
    const progress = (rect.top + rect.height / 2 - innerHeight / 2) / innerHeight;
    camY = Math.max(-PARALLAX, Math.min(PARALLAX, -progress * PARALLAX));
    if (lastTop !== null && dt > 0) {
      const speed = (lastTop - rect.top) / dt;
      slosh += (Math.max(-30, Math.min(30, -speed * 0.006)) - slosh) * Math.min(1, dt * 10);
    }
    lastTop = rect.top;
    // after the entrance every logo is held by the walls (one stuck on an edge never counts as in)
    if (time - t0 > 1500) inside.fill(1);
    for (let s = 0; s < 2; s++) step(dt / 2, true);
    render();
  };
  const play = () => {
    if (running || reduce) return;
    running = true;
    last = 0;
    lastTop = null;
    raf = requestAnimationFrame(frame);
  };
  const pause = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  // ---- pointer ----
  let hovered = -1;
  const toWorld = (ev: PointerEvent) => {
    const rect = host.getBoundingClientRect();
    return {
      wx: ((ev.clientX - rect.left) / rect.width - 0.5) * W,
      wy: (0.5 - (ev.clientY - rect.top) / rect.height) * H + camY,
      lx: ev.clientX - rect.left,
      ly: ev.clientY - rect.top,
    };
  };
  const onMove = (ev: PointerEvent) => {
    const p = toWorld(ev);
    pointer.x = p.wx;
    pointer.y = p.wy;
    pointer.on = true;
    // name of the logo under the cursor (the nearest one in front wins)
    let hit = -1;
    for (let i = 0; i < N; i++)
      if (Math.hypot(p.wx - x[i], p.wy - y[i]) < r[i] * 0.85 && (hit < 0 || z[i] > z[hit])) hit = i;
    if (hit !== hovered) {
      hovered = hit;
      label.textContent = hit >= 0 ? STACK_MARKS[hit].name : "";
      label.classList.toggle("is-on", hit >= 0);
    }
    label.style.transform = `translate(${p.lx + 16}px, ${p.ly + 18}px)`;
  };
  const onLeave = () => {
    pointer.on = false;
    hovered = -1;
    label.classList.remove("is-on");
  };
  // a finger lifts: its field goes with it (a mouse keeps its field until it leaves)
  const onUp = (ev: PointerEvent) => {
    if (ev.pointerType !== "mouse") onLeave();
  };
  host.addEventListener("pointermove", onMove);
  host.addEventListener("pointerleave", onLeave);
  host.addEventListener("pointerup", onUp);
  host.addEventListener("pointercancel", onUp);

  // ---- start in view, pause out of it ----
  const ro = new ResizeObserver(() => {
    layout();
    if (reduce && started) (settle(), render());
  });
  ro.observe(host);
  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return pause();
      if (!started) {
        started = true;
        t0 = performance.now();
        if (reduce) settle();
        else converge();
        render();
      }
      play();
    },
    { threshold: 0.2 },
  );
  io.observe(host);

  return () => {
    pause();
    io.disconnect();
    ro.disconnect();
    host.removeEventListener("pointermove", onMove);
    host.removeEventListener("pointerleave", onLeave);
    host.removeEventListener("pointerup", onUp);
    host.removeEventListener("pointercancel", onUp);
    for (const g of meshes)
      for (const m of g.children as THREE.Mesh[]) {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      }
    envMap.dispose();
    room.dispose();
    pmrem.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
