import { useEffect, useState } from "react";
import {
  Archive, ArrowLeftRight, Bug, Building2, CalendarCheck, Contact, FileSignature, FileText, Gamepad2, Gift, Handshake,
  KeyRound, Layers, Orbit, Percent, PieChart, ScanText, Search, Split, Store, Upload, UserCheck, Users, Workflow,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { EASE } from "../components/Reveal";
import { APPS, PORTAL_OUTPUTS, PORTAL_PIPELINE, type App, type Feature } from "../apps/apps";
import "./Apps.css";

const ICONS: Record<string, LucideIcon> = {
  Archive, ArrowLeftRight, Bug, Building2, CalendarCheck, Contact, FileSignature, FileText, Gamepad2, Gift, Handshake,
  KeyRound, Orbit, Percent, PieChart, ScanText, Search, Split, Store, Upload, UserCheck, Workflow,
};

const STEP_MS = 5000;

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** The screens of one app: numbered steps on the left, the active screen on the right.
    Steps advance on their own (paused while the pointer is over the walkthrough). */
function Walkthrough({ app }: { app: App }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const auto = !paused && !reducedMotion();

  useEffect(() => {
    if (!auto) return;
    const id = window.setTimeout(() => setActive((i) => (i + 1) % app.screens.length), STEP_MS);
    return () => window.clearTimeout(id);
  }, [active, auto, app.screens.length]);

  return (
    <div className="ap-walk" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <ol className="ap-steps">
        {app.screens.map((s, i) => (
          <li key={s.src}>
            <button type="button" className={i === active ? "is-active" : undefined} onClick={() => setActive(i)} aria-current={i === active}>
              <span className="ap-step-n">{String(i + 1).padStart(2, "0")}</span>
              <span className="ap-step-body">
                <strong>{s.title}</strong>
                <span>{s.caption}</span>
              </span>
              {i === active && (
                <span className="ap-step-bar" aria-hidden>
                  <i key={active} style={{ animationDuration: `${STEP_MS}ms`, animationPlayState: auto ? "running" : "paused" }} />
                </span>
              )}
            </button>
          </li>
        ))}
      </ol>

      <div className="ap-stage">
        <div className="ap-screen">
          {app.screens.map((s, i) => (
            <img key={s.src} src={s.src} alt={`${app.name}: ${s.title}`} className={i === active ? "is-active" : undefined} loading="lazy" draggable={false} />
          ))}
        </div>
        <div className="ap-phone">
          <img src={app.phone} alt={`${app.name} on a phone`} loading="lazy" draggable={false} />
        </div>
      </div>
    </div>
  );
}

function Node({ f, i }: { f: Feature; i: number }) {
  const Icon = ICONS[f.icon];
  return (
    <motion.div
      className="ap-node"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ delay: i * 0.12, duration: 0.6, ease: EASE }}
    >
      <span className="ap-node-icon"><Icon size={18} aria-hidden /></span>
      <strong>{f.title}</strong>
      <span>{f.text}</span>
    </motion.div>
  );
}

/** Portal: what happens once the advisor sends the file. */
function Pipeline() {
  return (
    <div className="ap-block">
      <h3 className="ap-block-title"><Workflow size={16} aria-hidden /> After the advisor sends the file</h3>
      <div className="ap-pipe">
        {PORTAL_PIPELINE.map((f, i) => (
          <div className="ap-pipe-cell" key={f.title}>
            <Node f={f} i={i} />
            <span className="ap-link" aria-hidden />
          </div>
        ))}
        <div className="ap-pipe-out">
          {PORTAL_OUTPUTS.map((f, i) => (
            <Node key={f.title} f={f} i={PORTAL_PIPELINE.length + i} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** What an app holds, as a grid of icon tiles. */
function Inside({ title, items }: { title: string; items: Feature[] }) {
  return (
    <div className="ap-block">
      <h3 className="ap-block-title"><Layers size={16} aria-hidden /> {title}</h3>
      <div className="ap-grid">
        {items.map((f, i) => (
          <Node key={f.title} f={f} i={i % 4} />
        ))}
      </div>
    </div>
  );
}

function AppSection({ app, index }: { app: App; index: number }) {
  return (
    <section className="ap-app" id={app.id}>
      <motion.header
        className="ap-head"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <span className="ap-num serif" aria-hidden>{String(index + 1).padStart(2, "0")}</span>
        <div className="ap-head-text">
          <p className="ap-sector">{app.sector}</p>
          <h2 className="serif">{app.name}</h2>
          <p className="ap-summary">{app.summary}</p>
        </div>
        <dl className="ap-meta">
          <div>
            <dt><Users size={14} aria-hidden /> Used by</dt>
            <dd>{app.users}</dd>
          </div>
          <div>
            <dt><Layers size={14} aria-hidden /> Stack</dt>
            <dd className="ap-stack">
              {app.stack.map((s) => <span key={s}>{s}</span>)}
            </dd>
          </div>
        </dl>
      </motion.header>

      <Walkthrough app={app} />
      {app.id === "portal" && <Pipeline />}
      {app.features && <Inside title={app.features.title} items={app.features.items} />}
    </section>
  );
}

/** /apps: the internal apps I design and build, each walked through screen by screen. */
export function Apps() {
  return (
    <div className="ap">
      <div className="ap-top">
        <div className="ap-aurora" aria-hidden />
        <div aria-hidden style={{ height: 106 }} />
        <section className="ap-hero">
          <motion.span className="ap-eyebrow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
            <i aria-hidden />
            In production, used every day
          </motion.span>
          <motion.h1
            className="serif"
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.1, duration: 0.8, ease: EASE }}
          >
            Apps & Web Apps
          </motion.h1>
          <motion.p className="ap-lede" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7, ease: EASE }}>
            Internal apps, from the first screen to the server and the workflows behind them. Each one is walked through below, screen by screen, on demo data.
          </motion.p>
          <motion.nav className="ap-jump" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.7, ease: EASE }}>
            {APPS.map((a, i) => (
              <a key={a.id} href={`#${a.id}`}>
                <span>{String(i + 1).padStart(2, "0")}</span> {a.name}
              </a>
            ))}
          </motion.nav>
        </section>
      </div>

      <div className="ap-list">
        {APPS.map((a, i) => (
          <AppSection key={a.id} app={a} index={i} />
        ))}
      </div>
    </div>
  );
}
