import { useEffect, useRef } from "react";

/**
 * The star dust used inside every glow on the site. Mirrors the Framer "Particles"
 * component as configured there (tsparticles): 365 white dots of radius 0.5 with
 * density on (area 10 000, factor 50), moving at speed 0.5 in a random direction,
 * leaving through one edge and coming back through the other, 60 fps, paused offscreen.
 */
export function Particles({
  number = 365,
  densityArea = 10000,
  densityFactor = 50,
  size = 0.5,
  speed = 0.5,
  color = "#ffffff",
}: {
  number?: number;
  densityArea?: number;
  densityFactor?: number;
  size?: number;
  speed?: number;
  color?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    type Dot = { x: number; y: number; vx: number; vy: number };
    let dots: Dot[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;

    const spawn = (): Dot => {
      const a = Math.random() * Math.PI * 2;
      return { x: Math.random() * w, y: Math.random() * h, vx: Math.cos(a), vy: Math.sin(a) };
    };

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round((number * (w * h)) / (densityArea * densityFactor));
      while (dots.length < count) dots.push(spawn());
      dots.length = count;
    };

    let visible = true;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      const dt = Math.min(now - last, 100);
      if (dt < 1000 / 61) return;
      last = now;
      const f = (dt / 1000) * 60 * speed;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      ctx.beginPath();
      for (const d of dots) {
        d.x += d.vx * f;
        d.y += d.vy * f;
        if (d.x < -size) d.x = w + size;
        else if (d.x > w + size) d.x = -size;
        if (d.y < -size) d.y = h + size;
        else if (d.y > h + size) d.y = -size;
        ctx.moveTo(d.x + size, d.y);
        ctx.arc(d.x, d.y, size, 0, Math.PI * 2);
      }
      ctx.fill();
    };

    const start = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();
    start();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !document.hidden) start();
      else stop();
    });
    io.observe(canvas);
    const onVisibility = () => (document.hidden || !visible ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [number, densityArea, densityFactor, size, speed, color]);

  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative", transform: "translateZ(0)" }}>
      <canvas ref={ref} style={{ width: "100%", height: "100%", position: "absolute" }} />
    </div>
  );
}
