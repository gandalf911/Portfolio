// Every piece of copy on the portfolio, as published on begdouriziad.com.

export const EMAIL = "begdouriziad@gmail.com";

export const NAV_LINKS = [
  { label: "Work", href: "/#projects" },
  { label: "About", href: "/#about" },
  { label: "Skills", href: "/#services" },
  { label: "Faq", href: "/#faq-s" },
  { label: "Highlights", href: "/#testimonials" },
];

export const HERO = {
  role: "Business Analyst & Automation Engineer · Casablanca",
  title: "I turn manual operations into systems that run themselves.",
  text: "I'm Ziad. I map how the work really flows, then build the CRMs, data pipelines and n8n workflows that carry it, so teams stop copying data between tools.",
  // the same figures as the About and Highlights sections
  proof: ["30+ workflows in production", "8 systems unified", "3 years in ops & data"],
};

export type Project = { title: string; image: string; href: string; position?: string; description?: string };

// Cards without their own page yet open the Averröes case study.
const CASE_STUDY = "/averroes";

// Slideshow order, as on the site (card 6 sits before card 5).
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
  { title: "Customer Complaint Process", href: CASE_STUDY, image: "/images/project-complaints.png" },
  {
    title: "Apps & Web App Development",
    description: "An onboarding portal with LLM-based OCR, the advisors\u2019 daily workspace and a commission simulator.",
    href: "/apps",
    image: "/images/project-apps.png",
    position: "54.9% 94.9%",
  },
  { title: "Data Synchronization Workflows", href: CASE_STUDY, image: "/images/project-sync.png" },
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
    title: "Complex Automation Systems",
    text: "End-to-end automation engines built on self-hosted n8n, unifying CRMs (HubSpot), LMS (Thinkific), payments, document storage (AWS S3) and messaging (Whatsapp) into a single autonomous lifecycle. I created then migrated  and improved 13+ legacy Zapier flows to n8n with zero manual residuals, covering everything from agent onboarding to offboarding, complaint handling, and inter-system data sync.",
    image: "/images/service-automation.png",
    alt: "Graphic design",
  },
  {
    id: "second",
    title: "Data Models & Dashboards",
    text: "High-fidelity data layers |modeling raw data with DBT across HubSpot, Postgres, and Mongo, then surfacing it through 3-level dashboards and proprietary scoring algorithms. From GMV clusters to consultant performance, I turn noisy operational data into real-time decision tools with strict verification checks.",
    // The phone layout of this card still shows the template's placeholder text.
    phoneText:
      "Web design is the art and science of creating visually appealing and functional websites that provide seamless user experiences. By blending aesthetics, usability, and cutting-edge technology, web design shapes how individuals interact with digital spaces. It encompasses layout design, typography, color schemes, and responsive frameworks, ensuring websites look and perform flawlessly across devices. Whether for businesses, personal portfolios, or e-commerce platforms",
    image: "/images/service-data.png",
    alt: "A man with long hair is working on a computer.",
  },
  {
    id: "third",
    title: "Operational Processes",
    text: "Designing and rolling out the actual operating model behind the systems. Onboarding, scoring, offboarding, complaint handling, neighborhood-cluster dispatching across Moroccan regions. I write the playbooks, define the KPIs, and then automate the steps so process and tooling stay in lock-step as the team scales.",
    image: "/images/service-processes.png",
    alt: "Abstract illustration of a network of connected icons",
  },
  {
    id: "forth",
    title: "Web & App Solutions",
    text: "Internal portals and ops apps that turn complex back-office work into intuitive, low-latency control panels. Recent example: a production OCR-driven document portal that automates intake, validation, and routing for the agent network. Built with a focus on real users in the field, not just dashboards for management.",
    image: "/images/service-web.jpg",
    alt: "Abstract dark blue and brown waves",
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

export const ACHIEVEMENTS = [
  { value: "30+", title: "Workflows engineered", text: "Migrated the consultant lifecycle from Zapier to self-hosted n8n - zero manual residuals." },
  { value: "OCR", title: "Portal in production", text: "A live document portal that automates document intake and validation across the agent network." },
  { value: "99.9%", title: "Operational uptime", text: "AI-monitored Slack incident alerts catch anomalies before they reach end users." },
  { value: "8+", title: "Systems unified", text: "HubSpot, Divalto, Thinkific, Zoho, Wati and Postgres synchronized in real time via n8n and DBT." },
  { value: "100%", title: "Data accuracy", text: "Strict verification checks across 3-level transaction dashboards and scoring systems." },
  {
    value: "Multi-region",
    title: "Ops framework",
    text: "Modular admin interfaces dispatch and support agents across clusters in Casablanca, Rabat and Marrakech.",
  },
];

export const FAQS = [
  {
    q: "What exactly do you do?",
    a: "I sit at the intersection of business operations and Data & Product. I diagnose process bottlenecks, design automation systems, and ship the integrations that make them run | from CRM and LMS pipelines to dashboards, scoring algorithms, and incident response.",
  },
  {
    q: "What's your stack?",
    a: "n8n | HubSpot | Google AppScript | JavaScript | HTML | Zendesk |Google Workspace at an advanced level |plus the BI & reporting layer (Sheets, dashboards, OCR). I also work with Wati, SMTP, Thinkific, Zoho, and Slack for end-to-end pipelines.",
  },
  {
    q: "How do you approach a new system?",
    a: "I start by mapping the current workflow end-to-end, find where the data and decisions break, and prototype the smallest piece that proves the whole flow. Then I scale it |with verification checks, monitoring, and clear ownership | before retiring whatever it replaces.",
  },
  {
    q: "Where are you based and what languages do you work in?",
    a: "Casablanca, Morocco. I work fluently in English, French, and Arabic | comfortable across European, MENA, and remote-first teams.",
  },
  {
    q: "Are you open to new opportunities?",
    a: "Yes, actively interested in operations engineering, automation, and data-infrastructure roles. The fastest way to reach me is begdouriziad@gmail.com or LinkedIn.",
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
