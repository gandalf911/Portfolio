import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronsDown, MapPin } from "lucide-react";
import { getLenis } from "../components/SmoothScroll";
import "./Journey.css";

type Highlight = { title: string; text: string; stack?: string };
type Role = {
  /** wheel label: the month the role started */
  start: string;
  range: string;
  title: string;
  org: { name: string; logo?: string; place: string };
  /** first and last month, inclusive; no end = ongoing */
  from: [number, number];
  to?: [number, number];
  summary: ReactNode;
  highlights?: Highlight[];
};

const ROLES: Role[] = [
  {
    start: "Mar 2024",
    range: "Mar 2024 — Present",
    title: "Business Analyst · Data & Automation (FDE)",
    org: { name: "Yakeey", logo: "/images/yakeey-logo.png", place: "Real-estate proptech · Casablanca" },
    from: [2024, 3],
    summary: (
      <>
        Part of the operations team (800+ real-estate advisors). I joined as a business analyst and the role grew into an
        internal Forward Deployed Engineer: learn the business alongside the teams, then design, build, deploy and run the
        tools it runs on.
      </>
    ),
    highlights: [
      {
        title: "Averröes",
        text: "Internal platform built from scratch and carried alone end to end (scoping, architecture, development, deployment, operations). 45 users, 8 data sources consolidated, 30+ management screens, business actions written back to the advisor platform, role-based access, audit log and SSO.",
        stack: "Next.js, TypeScript, PostgreSQL, Redis, Kubernetes, S3",
      },
      {
        title: "Onboarding redesign",
        text: "Process rethought, express track, automated account and contract creation, e-learning and Zoom training tracked end to end.",
        stack: "HubSpot, n8n, Thinkific, PandaDoc, Zoom, Wati",
      },
      {
        title: "Retention over the first 45 days",
        text: "D+1 and D+2 follow-ups, starter kit, satisfaction surveys, a “First Deal” program, back-office SLAs tracked in Averröes.",
      },
      {
        title: "Data",
        text: "dbt models for reporting and advisor scoring, replication workflows feeding Averröes' mirror database from the warehouse.",
        stack: "dbt, PostgreSQL, SQL, n8n, DBeaver, Compass, Metabase",
      },
      {
        title: "Automation",
        text: "30+ workflows designed, 160+ hours of work saved every week, migration from Zapier and Apps Script to n8n.",
      },
      {
        title: "A suite of 3 apps",
        text: "Averröes, Galaxy (advisor portal: tools, training, transaction declarations) and Portal (advisor sign-up, secure document upload, OCR document reading).",
        stack: "React, Node.js, PostgreSQL, Docker, GitHub & GitLab, Claude, S3",
      },
      {
        title: "Business analysis",
        text: "Process design (onboarding, offboarding, claims), KPI-driven management, the bridge between product, DevOps, operations, back-office, sales and engineering.",
      },
      {
        title: "Outcome",
        text: "The whole operation run from a single tool, 160 hours of manual work saved every week, and processes that enforce themselves.",
      },
    ],
  },
  {
    start: "Aug 2023",
    range: "Aug 2023 — Jan 2024",
    title: "Project Manager & Public Relations",
    org: { name: "Business Consulting Center | NGO", place: "Marrakech" },
    from: [2023, 8],
    to: [2024, 1],
    summary: (
      <>
        Designed the NGO's digital and visual identity, built the 2024–2025 action plan, ran a multi-channel
        communication strategy, coordinated strategic partnerships and on-the-ground events, and reported on KPIs and
        capital raised through public campaigns.
      </>
    ),
  },
  {
    start: "Jan 2023",
    range: "Jan 2023 — May 2023",
    title: "Internal Audit Intern",
    org: { name: "CDG Capital", logo: "/logos/cdg-capital.png", place: "Rabat" },
    from: [2023, 1],
    to: [2023, 5],
    summary: (
      <>
        Quantitative and qualitative analysis of operational and financial data. Built a new financial model to evaluate
        service performance and surface margin opportunities.
      </>
    ),
  },
  {
    start: "Nov 2020",
    range: "Nov 2020 — Dec 2021",
    title: "Wealth Management Consultant",
    org: { name: "Business Consulting Center", place: "Marrakech" },
    from: [2020, 11],
    to: [2021, 12],
    summary: (
      <>
        Tax-exemption simulations for expatriates, tax-optimization strategies, and financial-situation analysis for
        heritage management | translating complex fiscal logic into clear client recommendations.
      </>
    ),
  },
  {
    start: "Nov 2019",
    range: "Nov 2019 — Feb 2020",
    title: "Financial Consultant",
    org: { name: "Oney Bank", logo: "/logos/oney.svg", place: "Rabat" },
    from: [2019, 11],
    to: [2020, 2],
    summary: (
      <>
        In-depth analysis of clients' financial needs and commercialization of renewable-credit offers; collaborated with
        the analytical-review team on credit-margin analysis and process optimization.
      </>
    ),
  },
];

/** Months in a role, both ends included; an ongoing role counts up to this month. */
function months(r: Role) {
  const now = new Date();
  const [y1, m1] = r.to ?? [now.getFullYear(), now.getMonth() + 1];
  return (y1 - r.from[0]) * 12 + (m1 - r.from[1]) + 1;
}

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function useMedia(query: string) {
  const [match, setMatch] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

/* ---------- the wheel ---------- */

// Geometry taken from the stepper: labels 122 px apart, a raised-cosine bump 48 px deep
// and 320 px tall around the knob; the labels follow the same curve as the line.
const SPACING = 122;
const DEPTH = 48;
const HALF = 160;
const H = 640;
const LINE_X = 116;
/** where the line's svg sits in the wheel column */
const LINE_LEFT = 76;
const bump = (dy: number) => (Math.abs(dy) >= HALF ? 0 : DEPTH * (0.5 + 0.5 * Math.cos((Math.PI * dy) / HALF)));

const LINE_PATH = (() => {
  const pts: string[] = [];
  for (let y = -10; y <= H + 10; y += 4) pts.push(`${(LINE_X - bump(y - H / 2)).toFixed(2)} ${y}`);
  return `M ${pts.join(" L ")}`;
})();

/** A number whose digits roll into place, one column per digit, the rightmost first. */
function Rolling({ value }: { value: number }) {
  const digits = String(value).split("");
  return (
    <span className="jstep__num" aria-label={String(value)}>
      {digits.map((d, i) => {
        const fromRight = digits.length - 1 - i;
        return (
          <span key={fromRight} className="jstep__col" aria-hidden>
            <span className="jstep__reel" style={{ transform: `translateY(-${Number(d) * 10}%)`, transitionDelay: `${fromRight * 90}ms` }}>
              {Array.from({ length: 10 }, (_, n) => (
                <span key={n}>{n}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** One role, with its months rolling up from zero whenever it becomes the active one. */
function Panel({ role, on }: { role: Role; on: boolean }) {
  return (
    <div className="jstep__panel" aria-hidden={!on}>
      <div className="jstep__metric">
        <Rolling value={on ? months(role) : 0} />
        <span className="jstep__unit">
          months
          <small>{role.range}</small>
        </span>
      </div>
      <div className="jstep__org">
        {role.org.logo ? <img src={role.org.logo} alt={role.org.name} /> : <span className="jstep__org-name">{role.org.name}</span>}
        <span className="jstep__place">
          <MapPin size={13} aria-hidden /> {role.org.place}
        </span>
      </div>
      <h5 className="t-h5 jstep__title">{role.title}</h5>
      <p className="jstep__summary">{role.summary}</p>
      {role.highlights && (
        <ul className="jstep__grid">
          {role.highlights.map((h) => (
            <li key={h.title}>
              <strong>{h.title}</strong>
              <span>{h.text}</span>
              {h.stack && <em>{h.stack}</em>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smooth = (x: number) => x * x * (3 - 2 * x);
// a short hold at both ends, so the first and last roles rest before the section lets go
const HOLD = 0.08;

/**
 * Desktop: the section pins while the page scrolls through it. The dates glide along the curve,
 * trailing the scroll with an ease (written straight to the DOM, no React render per frame); the
 * nearest role is state, and its panel fades in while the previous one fades out.
 */
function Stepper() {
  const ref = useRef<HTMLDivElement>(null);
  const labels = useRef<(HTMLLIElement | null)[]>([]);
  const dots = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const n = ROLES.length;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const still = reducedMotion();
    let raf = 0;
    let target = 0;
    let pos = -1;
    let prev = 0;

    const read = () => {
      const travel = el.offsetHeight - window.innerHeight;
      const p = travel > 0 ? clamp(-el.getBoundingClientRect().top / travel, 0, 1) : 0;
      target = clamp((p - HOLD) / (1 - 2 * HOLD), 0, 1) * (n - 1);
    };
    const paint = () => {
      labels.current.forEach((li, i) => {
        if (!li) return;
        const d = i - pos;
        const near = Math.abs(d);
        li.style.transform = `translate(${-bump(d * SPACING)}px, ${H / 2 + d * SPACING}px) translateY(-50%)`;
        // eased falloff: bright at the knob, softly dimming over a step and a half
        li.style.opacity = String(Math.max(0.08, 1 - smooth(clamp(near / 1.5, 0, 1)) * 0.92));
        li.style.setProperty("--on", String(1 - smooth(clamp(near * 1.6, 0, 1))));
      });
      dots.current.forEach((dot, i) => dot?.style.setProperty("--on", String(1 - smooth(clamp(Math.abs(i - pos), 0, 1)))));
      setActive(Math.round(pos));
    };
    // The wheel trails the scroll with an exponential ease instead of being locked to it.
    const tick = (t: number) => {
      const dt = prev ? Math.min(64, t - prev) : 16;
      prev = t;
      const k = still || pos < 0 ? 1 : 1 - Math.exp(-dt / 90);
      pos = pos < 0 ? target : pos + (target - pos) * k;
      if (Math.abs(target - pos) < 0.0005) pos = target;
      paint();
      raf = pos === target ? 0 : requestAnimationFrame(tick);
      if (!raf) prev = 0;
    };
    const onScroll = () => {
      read();
      if (!raf) raf = requestAnimationFrame(tick);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [n]);

  /** Scroll the page to where role `i` sits, so the wheel and the scroll never disagree. */
  const go = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const travel = el.offsetHeight - window.innerHeight;
    const p = HOLD + (i / (n - 1)) * (1 - 2 * HOLD);
    const top = el.getBoundingClientRect().top + window.scrollY + p * travel;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(top, { immediate: reducedMotion(), duration: 1.4 });
    else window.scrollTo({ top, behavior: reducedMotion() ? "auto" : "smooth" });
  };

  return (
    <div ref={ref} className="jstep" style={{ height: `${n * 45 + 100}vh` }}>
      <div className="jstep__sticky">
        <div className="jstep__stage">
          <div className="jstep__wheel" style={{ height: H }}>
            <svg className="jstep__line" width={LINE_X + 4} height={H} viewBox={`0 0 ${LINE_X + 4} ${H}`} aria-hidden>
              <defs>
                <linearGradient id="jstep-fade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#fff" stopOpacity="0" />
                  <stop offset="0.12" stopColor="#fff" stopOpacity="0" />
                  <stop offset="0.24" stopColor="#fff" stopOpacity="1" />
                  <stop offset="0.76" stopColor="#fff" stopOpacity="1" />
                  <stop offset="0.88" stopColor="#fff" stopOpacity="0" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={LINE_PATH} fill="none" stroke="url(#jstep-fade)" strokeWidth="1.2" />
            </svg>

            <ol className="jstep__labels" aria-label="Roles">
              {ROLES.map((r, i) => (
                <li key={r.start} ref={(li) => void (labels.current[i] = li)} className={i === active ? "is-active" : undefined}>
                  <button type="button" onClick={() => go(i)} aria-current={i === active ? "step" : undefined}>
                    {r.start}
                  </button>
                  <i aria-hidden />
                </li>
              ))}
            </ol>

            <button
              type="button"
              className="jstep__knob"
              style={{ left: LINE_LEFT + LINE_X, top: H / 2 }}
              data-up={active === n - 1 || undefined}
              onClick={() => go(active === n - 1 ? 0 : active + 1)}
              aria-label={active === n - 1 ? "Back to the latest role" : "Next role"}
            >
              <ChevronsDown size={26} strokeWidth={2} aria-hidden />
            </button>
          </div>

          <div className="jstep__side">
            {ROLES.map((r, i) => (
              <div key={r.start} className={`jstep__slot${i === active ? " is-on" : i < active ? " is-past" : ""}`}>
                <Panel role={r} on={i === active} />
              </div>
            ))}
          </div>
        </div>

        <div className="jstep__dots" aria-hidden>
          {ROLES.map((r, i) => (
            <i key={r.start} ref={(d) => void (dots.current[i] = d)} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Narrow or short screens: the same roles as a plain list. */
function List() {
  return (
    <div className="journey__list">
      {ROLES.map((r) => (
        <div key={r.start} className="journey__item">
          <div className="journey__line" />
          <p className="t-small journey__item-date">{r.range.toUpperCase()}</p>
          <h5 className="t-h5 journey__text">{r.title}</h5>
          <p className="t-body journey__org">
            {r.org.logo ? <img className="journey__logo" src={r.org.logo} alt={r.org.name} /> : <span>{r.org.name}</span>}
            <span>· {r.org.place}</span>
          </p>
          <div className="t-body rt journey__text">
            <p>{r.summary}</p>
            {r.highlights?.map((h) => (
              <p key={h.title}>
                <strong>{h.title}:</strong> {h.text}
                {h.stack && (
                  <>
                    <br />
                    <em>Stack: {h.stack}</em>
                  </>
                )}
              </p>
            ))}
          </div>
        </div>
      ))}
      <div className="journey__line" />
    </div>
  );
}

/** "My Journey": the career timeline, as a scroll-driven time stepper on desktop. */
export function Journey() {
  const wide = useMedia("(min-width: 1100px) and (min-height: 760px)");
  return (
    <div className="journey" id="journey">
      <div className="journey__wrap">
        <div className="journey__inner">
          <h2 className="t-h2 journey__title">My Journey</h2>
          {wide ? <Stepper /> : <List />}
        </div>
      </div>
    </div>
  );
}
