import { resolve } from "node:path";
import { defineConfig, type Connect, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

// Vite only serves <page>/index.html at "/<page>/"; without the slash it falls back to the
// home page. Rewrite the clean URL (the one the site links to) in dev and preview.
const PAGES = ["/averroes", "/onboarding", "/web-design"];
const rewrite: Connect.NextHandleFunction = (req, _res, next) => {
  for (const page of PAGES) {
    if (req.url === page || req.url?.startsWith(`${page}?`) || req.url?.startsWith(`${page}#`)) {
      req.url = req.url.replace(page, `${page}/`);
    }
  }
  next();
};
const cleanUrls: Plugin = {
  name: "clean-urls",
  configureServer: (server) => void server.middlewares.use(rewrite),
  configurePreviewServer: (server) => void server.middlewares.use(rewrite),
};

// Static pages: /, /averroes, /onboarding, /web-design and the 404 page.
export default defineConfig({
  plugins: [cleanUrls, react()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, "index.html"),
        averroes: resolve(__dirname, "averroes/index.html"),
        onboarding: resolve(__dirname, "onboarding/index.html"),
        webDesign: resolve(__dirname, "web-design/index.html"),
        notFound: resolve(__dirname, "404.html"),
      },
    },
  },
});
