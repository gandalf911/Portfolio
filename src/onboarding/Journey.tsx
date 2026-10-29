import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Building2, Expand, FileSignature, Hash, Mail, MessageCircle, Pause, Play, ShieldCheck, Timer, Video, X, Zap, type LucideIcon,
} from "lucide-react";
import { ADVISOR, STAGES, SYSTEMS, type Channel, type Email, type Stage, type SystemId } from "./data";

/* « Follow one advisor » : un jeton parcourt le cycle de vie ; chaque étape montre
   ce qui la déclenche, ce que fait n8n, le message qui part et les outils touchés. */

const STEP_MS = 4200;
const ICONS: Partial<Record<SystemId, LucideIcon>> = { zoom: Video, slack: Hash, portal: ShieldCheck, platform: Building2, esign: FileSignature };
const CHANNEL: Record<Channel, { icon: LucideIcon; label: string }> = {
  email: { icon: Mail, label: "Email" },
  whatsapp: { icon: MessageCircle, label: "WhatsApp" },
  slack: { icon: Hash, label: "Slack" },
  zoom: { icon: Video, label: "Zoom" },
};
const initials = `${ADVISOR.first[0]}${ADVISOR.last[0]}`;

function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return setInView(true);
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, inView };
}

function SystemChip({ id, index }: { id: SystemId; index: number }) {
  const sys = SYSTEMS.find((s) => s.id === id)!;
  const Icon = ICONS[id];
  return (
    <span className="ob-sys" style={{ animationDelay: `${180 + index * 70}ms` }}>
      <span className="ob-sys-ico">{sys.logo ? <img src={sys.logo} alt="" /> : Icon ? <Icon size={15} aria-hidden /> : null}</span>
      {sys.label}
    </span>
  );
}

/** Aperçu d'un email dans le style de ceux envoyés : bandeau sapin, mosaïque géométrique, bouton jade. */
function EmailPreview({ email, to, onOpen }: { email: Email; to: string; onOpen?: () => void }) {
  return (
    <div className="ob-email">
      <div className="ob-email-head">
        <span>Advisor network</span>
        <span>ONBOARDING</span>
      </div>
      <div className="ob-email-mosaic" aria-hidden>
        <i className="t1" />
        <i className="t2" />
        <i className="t3" />
        <i className="t4" />
        <i className="t5" />
        <i className="t6" />
      </div>
      <div className="ob-email-hero">
        <b>
          {email.headline} <em>{email.accent}</em>
        </b>
        <p>{email.body}</p>
      </div>
      <div className="ob-email-body">
        <span className="ob-email-btn">{email.cta} &rarr;</span>
        <span className="ob-email-meta">to {to} · sent by n8n, 0 s after the trigger</span>
        {onOpen && (
          <button type="button" className="ob-email-open" onClick={onOpen}>
            <Expand size={12} aria-hidden /> See the full email
          </button>
        )}
      </div>
    </div>
  );
}

/** L'email complet (version anonymisée de celui envoyé en production), en surimpression. */
function FullEmail({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [onClose]);
  return createPortal(
    <div className="ob-modal" onClick={onClose} role="dialog" aria-label="Full email">
      <div className="ob-modal-card" onClick={(e) => e.stopPropagation()} data-lenis-prevent>
        <div className="ob-modal-bar">
          <span>
            <Mail size={13} aria-hidden /> The documents email, as advisors receive it · names and links are samples
          </span>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={16} aria-hidden />
          </button>
        </div>
        <iframe src={src} title="Documents email" />
      </div>
    </div>,
    document.body,
  );
}

function Message({ stage, onOpen }: { stage: Stage; onOpen: (src: string) => void }) {
  const m = stage.message;
  if (!m) return null;
  if (m.email) {
    const full = m.email.full;
    return <EmailPreview email={m.email} to={m.to} onOpen={full ? () => onOpen(full) : undefined} />;
  }
  const C = CHANNEL[m.channel];
  return (
    <div className={`ob-msg ob-msg--${m.channel}`}>
      <div className="ob-msg-head">
        <C.icon size={14} aria-hidden /> {C.label}
        <span>to {m.to}</span>
      </div>
      {m.channel === "email" && <div className="ob-msg-subject">{stage.title}</div>}
      {m.channel === "slack" && <div className="ob-msg-subject"># onboarding-alerts</div>}
      <p className="ob-msg-body">{m.text}</p>
      <span className="ob-msg-meta">sent by n8n · 0 s after the trigger</span>
    </div>
  );
}

export function Journey() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [full, setFull] = useState<string | null>(null);
  const stage = STAGES[at];
  const firstOff = STAGES.findIndex((s) => s.phase === "offboarding");

  useEffect(() => {
    if (!inView || !playing || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setAt((k) => (k + 1) % STAGES.length), STEP_MS);
    return () => window.clearTimeout(t);
  }, [at, inView, playing]);

  const pick = (i: number) => {
    setAt(i);
    setPlaying(false);
  };
  const pct = (at / (STAGES.length - 1)) * 100;

  return (
    <div ref={ref} className="ob-journey">
      <div className="ob-journey-top">
        <div className="ob-advisor">
          <span className="ob-avatar">{initials}</span>
          <span>
            <b>
              {ADVISOR.first} {ADVISOR.last}
            </b>
            <small>New advisor · {ADVISOR.city} · fictional</small>
          </span>
        </div>
        <button type="button" className="ob-play" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"}>
          {playing ? <Pause size={14} aria-hidden /> : <Play size={14} aria-hidden />} {playing ? "Pause the journey" : "Play the journey"}
        </button>
      </div>

      <div className="ob-track" style={{ ["--split" as string]: `${(firstOff / (STAGES.length - 1)) * 100}%` }}>
        <div className="ob-phase ob-phase--on">Onboarding</div>
        <div className="ob-phase ob-phase--off">Offboarding</div>
        <div className="ob-rail">
          <div className="ob-rail-fill" style={{ width: `${pct}%` }} />
          <span className="ob-token" style={{ left: `${pct}%` }}>
            {initials}
            {playing && inView && <i key={at} className="ob-token-ring" style={{ animationDuration: `${STEP_MS}ms` }} />}
          </span>
        </div>
        <ol className="ob-stops">
          {STAGES.map((s, i) => (
            <li key={s.id} style={{ left: `${(i / (STAGES.length - 1)) * 100}%` }}>
              <button
                type="button"
                className="ob-stop"
                data-state={i < at ? "done" : i === at ? "now" : undefined}
                data-phase={s.phase}
                onClick={() => pick(i)}
              >
                <span className="ob-stop-dot" />
                <span className="ob-stop-label">{s.label}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="ob-detail" key={stage.id}>
        <div className="ob-col">
          <span className="ob-trigger">
            <Zap size={13} aria-hidden /> {stage.trigger}
          </span>
          <h3 className="serif">{stage.title}</h3>
          <ol className="ob-steps">
            {stage.steps.map((step, i) => (
              <li key={step} style={{ animationDelay: `${120 + i * 110}ms` }}>
                <b>{i + 1}</b>
                {step}
              </li>
            ))}
          </ol>
          {stage.sla && (
            <span className="ob-sla">
              <Timer size={13} aria-hidden /> {stage.sla}
            </span>
          )}
        </div>
        <div className="ob-col ob-col--msg">
          <span className="ob-col-label">What goes out</span>
          <Message stage={stage} onOpen={(src) => { setFull(src); setPlaying(false); }} />
        </div>
        <div className="ob-col">
          <span className="ob-col-label">Systems involved</span>
          <div className="ob-syslist">
            {stage.systems.map((id, i) => (
              <SystemChip key={id} id={id} index={i} />
            ))}
          </div>
          <span className="ob-count">
            Stage {at + 1} of {STAGES.length} · {stage.phase === "onboarding" ? "onboarding" : "offboarding"}
          </span>
        </div>
      </div>
      {full && <FullEmail src={full} onClose={() => setFull(null)} />}
    </div>
  );
}
