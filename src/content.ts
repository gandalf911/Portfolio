// Every piece of copy on the portfolio, as published on begdouriziad.com.

export const EMAIL = "begdouriziad@gmail.com";

export const NAV_LINKS = [
  { label: "Work", href: "/#projects" },
  { label: "About", href: "/#about" },
  { label: "Skills", href: "/#services" },
  { label: "Faq", href: "/#faq-s" },
  { label: "Certifications", href: "/#certifications" },
];

export const HERO = {
  role: "Business Analyst & Automation Engineer · Casablanca",
  title: "I turn manual operations into systems that run themselves.",
  text: "I'm Ziad. I map how the work really flows, then build the CRMs, data pipelines and n8n workflows that carry it, so teams stop copying data between tools.",
  // the same figures as the About section
  proof: ["30+ workflows in production", "8 systems unified", "3 years in ops & data"],
};

export type Project = { title: string; image: string; href: string; position?: string; description?: string };

// Cards without their own page yet open the Averröes case study.
const CASE_STUDY = "/averroes";

// Slideshow order.
export const PROJECTS: Project[] = [
  { title: "Onboarding & Offboarding systems", href: "/onboarding", image: "/images/project-onboarding.jpg" },
  {
    title: "Averröes",
    description: "The platform behind 800+ real\u2011estate advisors. 8 systems in one app, built solo end to end.",
    href: CASE_STUDY,
    image: "/images/project-averroes-statue.jpg",
    position: "62% 30%",
  },
  {
    title: "Web Design",
    description: "Websites I design and build for clients, starting with Diag Immo Invest.",
    href: "/web-design",
    image: "/images/project-clusters.png",
  },
  {
    title: "Apps & Web App Development",
    description: "An onboarding portal with LLM-based OCR, the advisors\u2019 daily workspace and a commission simulator.",
    href: "/apps",
    image: "/images/project-apps.png",
    position: "54.9% 94.9%",
  },
  {
    title: "Data Visualization",
    description: "Drill-down pies, a draggable Sankey, tables that open up and a 3D referral galaxy, live on demo data.",
    href: "/data-viz",
    image: "/images/project-sync.png",
  },
];

export const ABOUT = {
  title: "From finance to systems engineering.",
  text: "Operational Architect bridging the gap between Data Intelligence and Systems Engineering. I translate complex business logic into high-fidelity automated ecosystems, transforming manual friction into invisible, scalable growth",
  contactTitle: "Get in touch",
  contactText: "Open to new challenges in operations, automation, and data infrastructure | let's talk.",
};

export const STATS = [
  { end: 30, suffix: "+", label: "Workflows Engineered" },
  { end: 99.9, suffix: "%", label: "Operational Uptime" },
  { end: 5, suffix: "", label: "Years of Experience" },
];

export type Service = { id?: string; title: string; text: string; phoneText?: string; image: string; alt: string };

export const SERVICES: Service[] = [
  {
    title: "Automation Systems",
    text: "End-to-end automation on self-hosted n8n: 30+ workflows that carry an advisor from sign-up to offboarding across HubSpot, Thinkific, PandaDoc, Zoom, WhatsApp and S3. Legacy Zapier and Apps Script flows migrated with nothing left to do by hand, retries and alerts on every failure path, and 160+ hours of manual work saved every week.",
    image: "/images/service-automation.png",
    alt: "A person in a red hoodie working at a computer",
  },
  {
    id: "second",
    title: "Data Models & Dashboards",
    text: "dbt models for reporting and advisor scoring, a warehouse replicated into a live Postgres mirror, and dashboards people actually open: drill-down charts, cohort tables that show who is behind every number, a draggable Sankey of the whole pipeline. I audit the models too, and rebuilt a scoring model whose missing data was quietly being scored as failure.",
    image: "/images/service-data.jpg",
    alt: "A silhouette in front of a wall of red light points",
  },
  {
    id: "third",
    title: "Operational Processes",
    text: "The operating model behind the systems: onboarding with an express track, retention over the first 45 days, offboarding, claims, and neighbourhood clusters across Moroccan cities. I write the playbooks, set the KPIs and the back-office SLAs, then automate the steps, so the process enforces itself as the team grows.",
    image: "/images/service-processes.jpg",
    alt: "A person working at a computer in red light",
  },
  {
    id: "forth",
    title: "Web & App Solutions",
    text: "Full-stack apps, built and run end to end. Averr\u00f6es, the CRM a 45-person operations team works in (Next.js, PostgreSQL, Redis, Kubernetes, SSO, role-based access); an advisor portal; a sign-up portal that reads documents with an LLM; a commission simulator; and websites for clients.",
    image: "/images/service-web.png",
    alt: "A person in a red beanie working on a laptop",
  },
];

export type StackItem = { name: string; src?: string };

// The tools on the stack spheres, one sphere each. No src = drawn inline (Framer).
export const STACK: StackItem[] = [
  { name: "DBT", src: "/images/stack-dbt.svg" },
  { name: "Gitlab", src: "/images/stack-gitlab.svg" },
  { name: "Github", src: "/images/stack-github.svg" },
  { name: "Mongo DB", src: "/images/stack-mongodb.svg" },
  { name: "PostgreSQL", src: "/images/stack-postgresql.svg" },
  { name: "Metabase", src: "/images/stack-metabase.svg" },
  { name: "DBeaver", src: "/images/stack-dbeaver.svg" },
  { name: "N8n", src: "/images/stack-n8n.svg" },
  { name: "Zapier", src: "/images/stack-zapier.svg" },
  { name: "Netlify", src: "/images/stack-netlify.svg" },
  { name: "Vercel", src: "/images/stack-vercel.svg" },
  { name: "Supabase", src: "/images/stack-supabase.svg" },
  { name: "Railway", src: "/images/stack-railway.png" },
  { name: "Cursor", src: "/images/stack-cursor.svg" },
  { name: "VScode", src: "/images/stack-vscode.svg" },
  { name: "Zoho", src: "/images/stack-zoho.svg" },
  { name: "Hubspot", src: "/images/stack-hubspot.svg" },
  { name: "Thinkific", src: "/images/stack-thinkific.svg" },
  { name: "MIRO", src: "/images/stack-miro.svg" },
  { name: "Google", src: "/images/stack-google.svg" },
  { name: "Claude" },
  { name: "Claude Code", src: "/images/stack-claude.svg" },
  { name: "Framer" },
];

// From LinkedIn, Licenses & certifications, current ones only (TOEFL and TOEIC have expired).
// Each card shows the issuer's logo; the caption reads beside the opened card.
export const CERTIFICATIONS = [
  { id: "n8n-101", image: "/certs/n8n-101.svg?v=2", alt: "n8n 101", caption: "n8n101 · Essentials: Your First Workflows · n8n, Oct 2026 · ID 22782109" },
  { id: "n8n-102", image: "/certs/n8n-102.svg?v=2", alt: "n8n 102", caption: "n8n102 · Integrations: APIs and Connected Workflows · n8n, Oct 2026 · ID 22803196" },
  { id: "n8n-103", image: "/certs/n8n-103.svg?v=2", alt: "n8n 103", caption: "n8n103 · In Practice: AI, Testing and Best Practices · n8n, Oct 2026 · ID 22820325" },
  { id: "coursera", image: "/certs/coursera.svg?v=2", alt: "Coursera", caption: "Automating Sales Tasks with Zapier · Coursera Project Network, Aug 2025" },
  { id: "cfi", image: "/certs/cfi.svg?v=2", alt: "Corporate Finance Institute", caption: "Accounting Fundamentals · Corporate Finance Institute, Feb 2023 · ID 67264371" },
  { id: "bloomberg", image: "/certs/bloomberg.svg?v=2", alt: "Bloomberg", caption: "Bloomberg Market Concepts · Bloomberg, Jan 2022" },
];

export const FAQS = [
  {
    q: "What exactly do you do?",
    a: "I work as an internal Forward Deployed Engineer: I learn how the business actually runs, alongside the teams, then design, build, deploy and run the tools it runs on. At Yakeey that means Averr\u00f6es, the platform the whole operations team works in, and the automations and data models underneath it.",
  },
  {
    q: "What's your stack?",
    a: "Apps: Next.js, React, TypeScript and Node.js. Data: PostgreSQL, dbt, SQL, Redis and Metabase. Automation: n8n (30+ workflows, migrated from Zapier and Apps Script), HubSpot, Thinkific, Zoom, Wati and PandaDoc. Infrastructure: Docker, Kubernetes, S3, GitHub and GitLab. And Claude, every day.",
  },
  {
    q: "Can you take a project from idea to production on your own?",
    a: "Yes. Averr\u00f6es was scoped, designed, built, deployed and is run by me alone: 45 users, 8 data sources consolidated, 30+ screens, role-based access, an audit log and SSO. Inside a team, I am the bridge between product, DevOps, operations and engineering.",
  },
  {
    q: "How do you approach a new system?",
    a: "I map the current workflow end to end with the people who run it, find where the data and the decisions break, and build the smallest piece that proves the whole flow. Then I scale it, with verification checks, monitoring and clear ownership, before retiring whatever it replaces.",
  },
  {
    q: "Where are you based and what languages do you work in?",
    a: "Casablanca, Morocco. I work fluently in English, French and Arabic, and I am comfortable across European, MENA and remote-first teams.",
  },
  {
    q: "Are you open to new opportunities?",
    a: "Yes, I am actively interested in solutions engineering, automation and data-infrastructure roles. The fastest way to reach me is begdouriziad@gmail.com or LinkedIn.",
  },
];

export const FOOTER = {
  title: "Let's build something solid.",
  text: "Tell me about the system you want to fix or build, I'll reply within a day.",
  github: "https://github.com/gandalf911",
  linkedin: "https://www.linkedin.com/in/begdouri-ziad/",
  copyright: "Copyright Ziad Begdouri. All rights reserved.",
  copyrightHref: "https://www.linkedin.com/in/begdouri-ziad",
};
