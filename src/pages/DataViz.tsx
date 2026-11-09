import { useState } from "react";
import { motion } from "motion/react";
import { MousePointerClick, MoveHorizontal, Sparkles } from "lucide-react";
import { EASE } from "../components/Reveal";
import { WINDOW_CSS } from "../averroes/window/styles";
import { Canvas } from "../dataviz/Canvas";
import { SECTIONS, type Section } from "../dataviz/sections";
import "./DataViz.css";

const num = (i: number) => String(i + 1).padStart(2, "0");

function Showcase({ section, index }: { section: Section; index: number }) {
  const [active, setActive] = useState(0);
  const view = section.views[active];
  const flip = index % 2 === 1;

  return (
    <section className="dv-section" id={section.id}>
      <motion.header
        className="dv-head"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <span className="dv-num serif" aria-hidden>{num(index)}</span>
        <div>
          <p className="dv-where">{section.where}</p>
          <h2 className="serif">{section.title}</h2>
          <p className="dv-lede-s">{section.lede}</p>
        </div>
      </motion.header>

      <div className={`dv-body${flip ? " is-flipped" : ""}`}>
        <div className="dv-stage">
          {section.views.length > 1 && (
            <div className="dv-views" role="tablist" aria-label={`${section.title} views`}>
              {section.views.map((v, i) => (
                <button key={v.label} type="button" role="tab" aria-selected={i === active} onClick={() => setActive(i)}>
                  {v.label}
                </button>
              ))}
            </div>
          )}
          <div className="dv-frame">
            <Canvas key={view.label} demo={view.demo} width={view.width} height={view.height} dark={view.dark} />
          </div>
          <p className="dv-pan-hint">
            <MoveHorizontal size={14} aria-hidden /> Swipe sideways to explore the chart
          </p>
        </div>

        <motion.ol
          className="dv-strengths"
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.12 }}
        >
          {section.strengths.map((s, i) => (
            <motion.li
              key={s}
              variants={{ hidden: { opacity: 0, x: flip ? -16 : 16 }, shown: { opacity: 1, x: 0 } }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <span className="dv-s-n">{num(i)}</span>
              <span>{s}</span>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}

/** /data-viz: the charts built for Averröes, each one live on demo data with what makes it work. */
export function DataViz() {
  return (
    <div className="dv">
      <style>{WINDOW_CSS}</style>
      <div className="dv-top">
        <div className="dv-aurora" aria-hidden />
        <div aria-hidden style={{ height: 106 }} />
        <section className="dv-hero">
          <motion.span className="dv-eyebrow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
            <i aria-hidden />
            Built for Averr&ouml;es, live on demo data
          </motion.span>
          <motion.h1
            className="serif"
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.1, duration: 0.8, ease: EASE }}
          >
            Data Visualization
          </motion.h1>
          <motion.p className="dv-lede" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7, ease: EASE }}>
            The charts I designed and built for an 800-advisor real-estate network. Every one below is the real component, running on invented data: click, hover and drag them.
          </motion.p>
          <motion.p className="dv-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45, duration: 0.7, ease: EASE }}>
            <MousePointerClick size={15} aria-hidden /> Interactive <Sparkles size={15} aria-hidden /> Hand-drawn SVG, anime.js and three.js
          </motion.p>
          <motion.nav className="dv-jump" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55, duration: 0.7, ease: EASE }}>
            {SECTIONS.map((s, i) => (
              <a key={s.id} href={`#${s.id}`}>
                <span>{num(i)}</span> {s.title}
              </a>
            ))}
          </motion.nav>
        </section>
      </div>

      <div className="dv-list">
        {SECTIONS.map((s, i) => (
          <Showcase key={s.id} section={s} index={i} />
        ))}
      </div>
    </div>
  );
}
