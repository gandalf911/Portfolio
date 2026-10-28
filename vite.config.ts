import { resolve } from "node:path";
import { defineConfig, type Connect, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

// Vite only serves averroes/index.html at "/averroes/"; without the slash it falls back to the
// home page. Rewrite the clean URL (the one the site links to) in dev and preview.
const rewrite: Connect.NextHandleFunction = (req, _res, next) => {
  if (req.url === "/averroes" || req.url?.startsWith("/averroes?") || req.url?.startsWith("/averroes#")) {
    req.url = req.url.replace("/averroes", "/averroes/");
  }
  next();
};
const cleanUrls: Plugin = {
  name: "clean-urls",
  configureServer: (server) => void server.middlewares.use(rewrite),
  configurePreviewServer: (server) => void server.middlewares.use(rewrite),
};

// Three static pages, like the Framer site: /, /averroes and the 404 page.
export default defineConfig({
  plugins: [cleanUrls, react()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, "index.html"),
        averroes: resolve(__dirname, "averroes/index.html"),
        notFound: resolve(__dirname, "404.html"),
      },
    },
  },
});
