import { ArrowRight, BellRing, DoorOpen, Database, LockOpen, MessagesSquare, type LucideIcon } from "lucide-react";
import { HERO, NEXT, PRINCIPLES } from "../onboarding/data";
import { Impact } from "../onboarding/Impact";
import { Journey } from "../onboarding/Journey";
import { Hub, WorkflowInventory } from "../onboarding/Hub";
import { WorkflowCarousel, type WorkflowData } from "../onboarding/WorkflowMap";
import launcher from "../onboarding/workflows/launcher.json";
import offboarding from "../onboarding/workflows/offboarding.json";
import elearning from "../onboarding/workflows/elearning.json";
import documents from "../onboarding/workflows/documents.json";
import retention from "../onboarding/workflows/retention.json";

const WORKFLOW_MAPS = [launcher, offboarding, elearning, documents, retention] as WorkflowData[];
import "./Onboarding.css";

const PRINCIPLE_ICON: Record<(typeof PRINCIPLES)[number]["icon"], LucideIcon> = {
  state: Database,
  channel: MessagesSquare,
  unlock: LockOpen,
  alarm: BellRing,
  door: DoorOpen,
};

/** /onboarding: the onboarding and offboarding systems case study. */
export function Onboarding() {
  return (
    <div className="obs">
      <div className="obs-top">
        <div className="obs-aurora" aria-hidden />
        <div className="obs-stars" aria-hidden />
        <div aria-hidden style={{ height: 106 }} />
        <section className="obs-hero">
          <span className="obs-eyebrow">
            <i aria-hidden />
            {HERO.eyebrow}
          </span>
          <h1 className="serif">{HERO.title}</h1>
          <p className="obs-lede">
            {HERO.lede.map((p, i) => (p.strong ? <b key={i}>{p.text}</b> : <span key={i}>{p.text}</span>))}
          </p>
          <div className="obs-stats">
            {HERO.stats.map((s) => (
              <div key={s.label} className="obs-stat">
                <div className="obs-stat-n serif">{s.value}</div>
                <div className="obs-stat-l">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="obs-section" id="impact">
        <h2 className="obs-title serif">The impact</h2>
        <p className="obs-sub">Faster contracts, more of them signed, every access ready in days, and advisors who say it works. Measured, not estimated.</p>
        <Impact />
      </section>

      <section className="obs-section" id="journey">
        <h2 className="obs-title serif">Follow one advisor</h2>
        <p className="obs-sub">
          Eleven stages, from the first payment to the exit survey. Each one is triggered by the CRM and handled by n8n. Click any stage, or let it play.
        </p>
        <Journey />
      </section>

      <section className="obs-section" id="design">
        <h2 className="obs-title serif">How it's designed</h2>
        <p className="obs-sub">Before automating anything, I redrew the process with the teams. Five rules came out of it, and every workflow follows them.</p>
        <div className="obs-principles">
          {PRINCIPLES.map((p, i) => {
            const Icon = PRINCIPLE_ICON[p.icon];
            return (
              <article key={p.title} className="obs-principle" style={{ animationDelay: `${i * 80}ms` }}>
                <span className="obs-principle-ico">
                  <Icon size={18} aria-hidden />
                </span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="obs-section" id="architecture">
        <h2 className="obs-title serif">One orchestrator, eleven tools</h2>
        <p className="obs-sub">n8n sits in the middle. The CRM tells it what happened, it tells every other tool what to do, and it reports back.</p>
        <div className="obs-arch">
          <Hub />
          <WorkflowInventory />
        </div>
      </section>

      <section className="obs-section" id="workflows">
        <h2 className="obs-title serif">Under the hood</h2>
        <p className="obs-sub">
          The five real workflows, redrawn from n8n: every node in its place, every wire, every zone. Only the labels are made generic.
        </p>
        <WorkflowCarousel workflows={WORKFLOW_MAPS} />
      </section>

      <section className="obs-section obs-section--end">
        <a className="obs-next" href={NEXT.href}>
          <span>
            <small>{NEXT.label}</small>
            <b className="serif">{NEXT.title}</b>
          </span>
          <ArrowRight size={22} aria-hidden />
        </a>
      </section>
    </div>
  );
}
