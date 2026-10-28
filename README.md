# begdouriziad.com in code

Hand-written React + Vite rebuild of the Framer portfolio (Portfolio project, live at begdouriziad.com):
same pages, components, text, images, breakpoints and animations.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/ (index.html, averroes/index.html, 404.html)
```

- `src/content.ts`: all the copy and links.
- `src/components/`: one file per Framer component (Navigation, Footer, buttons, Copy Button,
  Project card, Service card stack, FAQ, Slideshow, Ticker, Particles, Liquid Metal, Smooth Scroll,
  Text Reveal, word-by-word title).
- `src/pages/`: Home, Journey, 404, Averroes.
- `src/averroes/`: the Averröes case study, copied from `averroes-case-study/src`.
- Breakpoints as in Framer: desktop ≥ 1200 px, tablet 810–1199 px, phone ≤ 809 px.
