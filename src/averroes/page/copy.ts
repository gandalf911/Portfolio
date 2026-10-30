// Tout le texte de la page, en un seul endroit : relu d'un coup, testé d'un coup
// (pas de tiret cadratin, pas d'anecdote interdite), et recopiable tel quel dans Framer.

export const NAV = {
  brand: "Ziad Begdouri",
  links: [
    { label: "← Work", href: "https://begdouriziad.com/#work" },
    { label: "Product", href: "#product" },
    { label: "Architecture", href: "#architecture" },
    { label: "Data", href: "#data" },
    { label: "Craft", href: "#craft" },
  ],
  cta: { label: "Get in touch", href: "mailto:begdouriziad@gmail.com" },
};

export const HERO = {
  eyebrow: "Conceived, designed, built and run by me · 2024 to now",
  title: "Averröes. The system an entire ops team now runs on.",
  lede: [
    { text: "A production CRM for a real-estate network of 800+ advisors in Morocco. It replaced dozens of spreadsheets and tools with " },
    { text: "one web app", strong: true },
    { text: ", fed by the automations and data models I built underneath it. " },
    { text: "One person, end to end.", strong: true },
  ],
  stats: [
    { value: "31", label: "Screens in production" },
    { value: "8", label: "Systems unified" },
    { value: "29", label: "Workflows feeding it" },
    { value: "2 yrs", label: "Of data cleaning & modeling" },
  ],
};

export const STAGE = {
  hintA: "This is the real Averröes navigation. ",
  hintB: "Click “Menu” in the dock",
  hintC: ", then open any screen. Names and numbers are fictional.",
};


export const DESCENT_INTRO = {
  title: "What's under the hood",
  text:
    "Averröes looks simple on purpose. Underneath, it is six layers I designed, built and still run: from the screens people use every morning down to the data I spent two years cleaning. Scroll down through them.",
};

export type DescentItem = {
  id: "surface" | "product" | "application" | "automation" | "data" | "bedrock";
  anchor?: string;
  n: string;
  kicker: string;
  title: string;
  body: string[];
  points?: { k: string; v: string }[];
  visual: "surface" | "product" | "architecture" | "automation" | "audit" | "bedrock";
};

export const DESCENT: DescentItem[] = [
  {
    id: "surface",
    n: "01",
    kicker: "Surface",
    title: "Data people actually want to open",
    body: [
      "Every screen works in layers. A tile answers the question in one glance, a chart lets you explore, and one click drills down to the record behind the number.",
      "And it is meant to be fun: advisors as rated cards, monthly trophies, publication streaks in 3D, challenge seasons. Ops teams use what they enjoy.",
    ],
    visual: "surface",
  },
  {
    id: "product",
    anchor: "product",
    n: "02",
    kicker: "Product",
    title: "One place for every ops workflow",
    body: ["Thirty-one screens, five business segments. The modules I'm proudest of:"],
    points: [
      { k: "Subscription billing", v: "Monthly advisor fees, collection rate, unpaid follow-up and free months in one view, exported in two clicks for accounting." },
      { k: "Transactions", v: "Every deal followed from declaration to billing to payment, with the checks that flag a gap before anyone has to look for it." },
      { k: "ACC sections", v: "Each account manager's pool, rankings, monthly podiums and trophies." },
      { k: "Catalogue", v: "Every live listing as a card, filterable by city, cluster, type and advisor." },
      { k: "Promo & continuing education", v: "Onboarding cohorts, Zoom sessions where only approved guests get in, reminders and attendance, end to end." },
    ],
    visual: "product",
  },
  {
    id: "application",
    anchor: "architecture",
    n: "03",
    kicker: "Application",
    title: "Built to hold up when nobody is watching",
    body: ["Decisions I made, each with a reason:"],
    points: [
      { k: "Three databases, three trust levels", v: "One writable app schema, a read-only copy of the warehouse reached through a self-healing tunnel, and the live warehouse, read-only." },
      { k: "Access enforced at exactly three points", v: "Role defaults live in code, per-user overrides in the database, and the page, the API and the menu all ask the same question." },
      { k: "Nothing outside trusts the browser", v: "Anything sent to another platform is rebuilt by the server from the typed fields only. A tampered form cannot change an account type or backdate a contract." },
      { k: "Every card loads on its own", v: "One card was ready in 165 ms and still waited 1.5 s for its slowest neighbour. Now each one streams in as soon as its own query answers." },
      { k: "Refuse rather than lie", v: "If the warehouse comes back empty in the middle of a sync, the app stops and says so instead of sending zeros." },
      { k: "Migrations only add before a deploy", v: "Removals ship after, in a separate step. I learned that one by repairing production." },
    ],
    visual: "architecture",
  },
  {
    id: "automation",
    n: "04",
    kicker: "Automation",
    title: "29 workflows that keep it fed",
    body: [
      "Averröes prepares; n8n executes. The app composes a clean request (create this account, push these scores) and hands it to a workflow that talks to the outside platforms.",
      "Behind it runs the advisor lifecycle as a state machine of about 280 steps, from recruitment and payment to contract, accounts, e-learning, activation, retention and offboarding, with escalation deadlines across teams. Thinkific, Slack, Zoom and Google Sheets all sit in that layer.",
    ],
    visual: "automation",
  },
  {
    id: "data",
    anchor: "data",
    n: "05",
    kicker: "Data",
    title: "Two years of cleaning before the first chart",
    body: [
      "The part AI cannot do for you: learning what the data actually means. I cleaned, reconciled and modeled it with dbt for two years so every number on screen can be defended.",
      "Example: I audited the 2,063-line advisor scoring model and found three structural flaws. Missing data was scored as poor performance, single-track advisors were dragged down by an empty second track, and only 17 of 89 computed indicators reached the published table. Half the network sat within 0.06 points. I built a tuning layer that replays the formula exactly, then fixes it in the open.",
    ],
    visual: "audit",
  },
  {
    id: "bedrock",
    n: "06",
    kicker: "Bedrock",
    title: "Eight sources. One reading.",
    body: [
      "Consolidated, reconciled and kept current in one place: HubSpot, Zendesk, the advisor platform, Divalto, the listings marketplace, Zoho Mail, WhatsApp, and the PostgreSQL warehouse with dbt.",
    ],
    visual: "bedrock",
  },
];


export const METHOD = {
  title: "How I build with AI",
  sub: "AI writes a large share of the code. Everything around it is the actual job, and it always runs in the same six steps.",
  steps: [
    {
      title: "Sit with the business units",
      text: "I start next to the teams who live the process: operations, sales, billing, recruitment. I map what they do by hand, where it breaks and what a good day would look like. The need comes from them, never from the tool.",
    },
    {
      title: "Find the data, model it, clean what exists",
      text: "Before any screen, I locate where each fact really lives (CRM, billing, marketplace, warehouse), build the dbt models that join it and clean the existing data until every number can be defended.",
    },
    {
      title: "Decide what to automate and what to code",
      text: "Some work belongs in a workflow that runs on its own, some needs an interface people open every day. I draw that line on purpose: n8n orchestrates, the app reads, explains and decides.",
    },
    {
      title: "Map the stack: what exists, what's missing",
      text: "I inventory the infrastructure already in place (databases, tunnels, APIs, hosting, access rights) and add only what the need requires, with security, cost and maintenance in view.",
    },
    {
      title: "Build with AI, under my rules",
      text: "Then I build, with AI as the fastest pair of hands I have, held to a written rulebook it must follow on every change. Speed comes from the AI; correctness comes from the design, the review and the tests.",
    },
    {
      title: "Deploy, then keep it running",
      text: "Shipping is the middle, not the end: migrations that never break the live version, monitoring and alerts, and the fixes and new requests that arrive once people rely on it every day.",
    },
  ],
};

export const FOOTER = {
  title: "Let's build something solid.",
  sub: "Tell me about the system you want to fix or build, I'll reply within a day.",
  email: "begdouriziad@gmail.com",
  links: [
    { label: "Work", href: "https://begdouriziad.com/#work" },
    { label: "About", href: "https://begdouriziad.com/#about" },
    { label: "Skills", href: "https://begdouriziad.com/#skills" },
    { label: "Faq", href: "https://begdouriziad.com/#faq" },
    { label: "Highlights", href: "https://begdouriziad.com/#highlights" },
  ],
  note: "Averröes is an internal CRM. Every name, number and photo on this page is illustrative.",
};

export const COPY: Record<string, unknown> = { NAV, HERO, STAGE, DESCENT_INTRO, DESCENT, METHOD, FOOTER };
