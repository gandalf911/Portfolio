import { useEffect, useRef, useState } from "react";
import { FRAGMENT, VERTEX } from "./liquidMetalShaders";

// The Framer logo, used when no image is given (as on the site).
const DEFAULT_SVG = `
<svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M127.571 97.1191H272.428V169.545H200L127.571 97.1191ZM127.571 169.545H200L272.428 241.973H127.571V169.545ZM127.571 241.973H200V314.402L127.571 241.973Z" fill="black"/>
</svg>`;

type Props = {
  imageSource?: string;
  speed?: number;
  dispersion?: number;
  edge?: number;
  patternBlur?: number;
  liquify?: number;
  patternScale?: number;
};

/** Turns a shape into the distance map the shader reads (port of the component's preprocessing). */
function processImage(file: Blob): Promise<ImageData> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  return new Promise((resolve, reject) => {
    if (!ctx) return reject(new Error("Invalid file or context"));
    const img = new Image();
    img.onload = () => {
      if (file.type === "image/svg+xml") {
        img.width = 1000;
        img.height = 1000;
      }
      const MAX = 1000;
      const MIN = 500;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > MAX || h > MAX || w < MIN || h < MIN) {
        if (w > h) {
          if (w > MAX) {
            h = Math.round((h * MAX) / w);
            w = MAX;
          } else if (w < MIN) {
            h = Math.round((h * MIN) / w);
            w = MIN;
          }
        } else if (h > MAX) {
          w = Math.round((w * MAX) / h);
          h = MAX;
        } else if (h < MIN) {
          w = Math.round((w * MIN) / h);
          h = MIN;
        }
      }
      canvas.width = w;
      canvas.height = h;
      const shape = document.createElement("canvas");
      shape.width = w;
      shape.height = h;
      const sctx = shape.getContext("2d")!;
      sctx.drawImage(img, 0, 0, w, h);
      const px = sctx.getImageData(0, 0, w, h).data;

      const inside = new Array<boolean>(w * h).fill(false);
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          const [r, g, b, a] = [px[i], px[i + 1], px[i + 2], px[i + 3]];
          inside[y * w + x] = !((r === 255 && g === 255 && b === 255 && a === 255) || a === 0);
        }
      const isInside = (x: number, y: number) => (x < 0 || x >= w || y < 0 || y >= h ? false : inside[y * w + x]);

      const boundary = new Array<boolean>(w * h).fill(false);
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          const i = y * w + x;
          if (!inside[i]) continue;
          let edge = false;
          for (let ny = y - 1; ny <= y + 1 && !edge; ny++)
            for (let nx = x - 1; nx <= x + 1 && !edge; nx++) if (!isInside(nx, ny)) edge = true;
          if (edge) boundary[i] = true;
        }

      const u = new Float32Array(w * h).fill(0);
      const next = new Float32Array(w * h).fill(0);
      const at = (x: number, y: number, arr: Float32Array) =>
        x < 0 || x >= w || y < 0 || y >= h || !inside[y * w + x] ? 0 : arr[y * w + x];
      for (let iter = 0; iter < 300; iter++) {
        for (let y = 0; y < h; y++)
          for (let x = 0; x < w; x++) {
            const i = y * w + x;
            if (!inside[i] || boundary[i]) {
              next[i] = 0;
              continue;
            }
            next[i] = (0.01 + (at(x + 1, y, u) + at(x - 1, y, u) + at(x, y + 1, u) + at(x, y - 1, u))) / 4;
          }
        u.set(next);
      }

      let max = 0;
      for (let i = 0; i < w * h; i++) if (u[i] > max) max = u[i];
      const out = ctx.createImageData(w, h);
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          const i = y * w + x;
          const o = i * 4;
          const v = inside[i] ? 255 * (1 - (u[i] / max) ** 2) : 255;
          out.data[o] = v;
          out.data[o + 1] = v;
          out.data[o + 2] = v;
          out.data[o + 3] = 255;
        }
      resolve(out);
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

/** Framer "🚀 Liquid Metal" component: a chrome, slowly flowing logo drawn with WebGL2. */
export function LiquidMetal({
  imageSource = "",
  speed = 0.3,
  dispersion = 0.015,
  edge = 0.4,
  patternBlur = 0.005,
  liquify = 0.07,
  patternScale = 2,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gl, setGl] = useState<WebGL2RenderingContext | null>(null);
  const [uniforms, setUniforms] = useState<Record<string, WebGLUniformLocation>>({});
  const [image, setImage] = useState<ImageData | null>(null);
  const totalTime = useRef(0);
  const lastTime = useRef(0);

  // Shape → distance map.
  useEffect(() => {
    const source = imageSource
      ? fetch(imageSource).then((r) => r.blob())
      : Promise.resolve(new Blob([DEFAULT_SVG], { type: "image/svg+xml" }));
    source
      .then((blob) => processImage(blob))
      .then(setImage)
      .catch((e) => console.error("Error processing image:", e));
  }, [imageSource]);

  // Program.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("webgl2", { antialias: true, alpha: true, premultipliedAlpha: false });
    if (!ctx) return;
    const compile = (src: string, type: number) => {
      const s = ctx.createShader(type);
      if (!s) return null;
      ctx.shaderSource(s, src);
      ctx.compileShader(s);
      if (!ctx.getShaderParameter(s, ctx.COMPILE_STATUS)) {
        console.error("Shader compilation error:", ctx.getShaderInfoLog(s));
        ctx.deleteShader(s);
        return null;
      }
      return s;
    };
    const vs = compile(VERTEX, ctx.VERTEX_SHADER);
    const fs = compile(FRAGMENT, ctx.FRAGMENT_SHADER);
    if (!vs || !fs) return;
    const program = ctx.createProgram();
    if (!program) return;
    ctx.attachShader(program, vs);
    ctx.attachShader(program, fs);
    ctx.linkProgram(program);
    if (!ctx.getProgramParameter(program, ctx.LINK_STATUS)) {
      console.error("Program linking error:", ctx.getProgramInfoLog(program));
      return;
    }
    const found: Record<string, WebGLUniformLocation> = {};
    const count = ctx.getProgramParameter(program, ctx.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const info = ctx.getActiveUniform(program, i);
      const loc = info && ctx.getUniformLocation(program, info.name);
      if (info && loc) found[info.name] = loc;
    }
    const buffer = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer);
    ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), ctx.STATIC_DRAW);
    ctx.useProgram(program);
    const pos = ctx.getAttribLocation(program, "a_position");
    ctx.enableVertexAttribArray(pos);
    ctx.vertexAttribPointer(pos, 2, ctx.FLOAT, false, 0, 0);
    ctx.enable(ctx.BLEND);
    ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA);
    setGl(ctx);
    setUniforms(found);
    return () => {
      ctx.deleteProgram(program);
      ctx.deleteShader(vs);
      ctx.deleteShader(fs);
      ctx.deleteBuffer(buffer);
    };
  }, []);

  // Parameters.
  useEffect(() => {
    if (!gl || Object.keys(uniforms).length === 0) return;
    gl.uniform1f(uniforms.u_patternScale, patternScale);
    gl.uniform1f(uniforms.u_refraction, dispersion);
    gl.uniform1f(uniforms.u_edge, edge);
    gl.uniform1f(uniforms.u_patternBlur, patternBlur);
    gl.uniform1f(uniforms.u_liquid, liquify);
  }, [gl, uniforms, patternScale, dispersion, edge, patternBlur, liquify]);

  // Texture.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!gl || !canvas || !image || Object.keys(uniforms).length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const side = Math.min(rect.width, rect.height) * devicePixelRatio;
    canvas.width = side;
    canvas.height = side;
    gl.viewport(0, 0, side, side);
    gl.uniform1f(uniforms.u_ratio, 1);
    gl.uniform1f(uniforms.u_img_ratio, image.width / image.height);
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image.data);
    gl.uniform1i(uniforms.u_image_texture, 0);
    return () => {
      if (tex) gl.deleteTexture(tex);
    };
  }, [gl, uniforms, image]);

  // Render loop.
  useEffect(() => {
    if (!gl || !image || Object.keys(uniforms).length === 0) return;
    let raf = 0;
    const render = (now: number) => {
      const dt = now - lastTime.current;
      lastTime.current = now;
      totalTime.current += dt * speed;
      gl.uniform1f(uniforms.u_time, totalTime.current % 10000);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(render);
    };
    lastTime.current = performance.now();
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [gl, uniforms, image, speed]);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
    </div>
  );
}
