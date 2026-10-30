import { ArrowUpRight, Globe, LayoutTemplate, MousePointer2, Smartphone } from "lucide-react";
import { motion } from "motion/react";
import { EASE } from "../components/Reveal";
import { SITES, type Site } from "../webdesign/sites";
import "./WebDesign.css";

const host = (url: string) => new URL(url).host.replace(/^www\./, "");

/** One website: what it is on the left, the live site in a browser and a phone on the right. */
function SiteShowcase({ site, index }: { site: Site; index: number }) {
  return (
    <motion.article
      className="wd-site"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      <div className="wd-info">
        <span className="wd-index">{String(index + 1).padStart(2, "0")}</span>
        <h2 className="serif">{site.name}</h2>
        <p className="wd-sector">{site.sector}</p>
        <p className="wd-summary">{site.summary}</p>
        <dl className="wd-facts">
          <div>
            <dt>
              <LayoutTemplate size={14} aria-hidden /> Pages
            </dt>
            <dd>{site.pages.join(" · ")}</dd>
          </div>
          <div>
            <dt>
              <Smartphone size={14} aria-hidden /> Built
            </dt>
            <dd>In Framer, responsive from desktop to phone</dd>
          </div>
        </dl>
        <ul className="wd-chips">
          {site.sections.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <a className="wd-visit" href={site.url} target="_blank" rel="noopener">
          <Globe size={16} aria-hidden /> Visit {host(site.url)} <ArrowUpRight size={16} aria-hidden />
        </a>
      </div>

      <div className="wd-devices">
        <div className="wd-browser">
          <div className="wd-bar">
            <i />
            <i />
            <i />
            <span>{host(site.url)}</span>
          </div>
          {/* hovering scrolls through the whole page: top runs to 100 % while the image
              slides up by its own height, so the bottom of the page ends on the frame's bottom */}
          <div className="wd-screen">
            <img src={site.desktop} alt={`${site.name}, full home page`} loading="lazy" draggable={false} />
          </div>
          <span className="wd-hint">
            <MousePointer2 size={13} aria-hidden /> Hover to scroll the site
          </span>
        </div>
        <div className="wd-phone">
          <img src={site.phone} alt={`${site.name} on a phone`} loading="lazy" draggable={false} />
        </div>
      </div>
    </motion.article>
  );
}

/** /web-design: the websites I design and build for clients. */
export function WebDesign() {
  return (
    <div className="wd">
      <div className="wd-top">
        <div className="wd-aurora" aria-hidden />
        <div aria-hidden style={{ height: 106 }} />
        <section className="wd-hero">
          <motion.span className="wd-eyebrow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
            <i aria-hidden />
            Designed and built for clients
          </motion.span>
          <motion.h1
            className="serif"
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.1, duration: 0.8, ease: EASE }}
          >
            Web Design
          </motion.h1>
          <motion.p className="wd-lede" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7, ease: EASE }}>
            Websites for businesses, from the first layout to the live domain. Every one below is online: scroll through it here, then visit it.
          </motion.p>
        </section>
      </div>

      <div className="wd-list">
        {SITES.map((s, i) => (
          <SiteShowcase key={s.url} site={s} index={i} />
        ))}
      </div>
    </div>
  );
}
