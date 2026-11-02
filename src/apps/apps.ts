// The apps on /apps. Screens in /public/apps, captured on demo data (1280 × 800), plus the
// first screen on a phone when the app has a phone layout. Each app is walked through screen by screen.
export type Screen = { src: string; title: string; caption: string };
export type Feature = { icon: string; title: string; text: string };
export type App = {
  id: string;
  name: string;
  sector: string;
  summary: string;
  users: string;
  stack: string[];
  screens: Screen[];
  /** the first screen on a phone; desktop-only tools have none */
  phone?: string;
  /** a grid of what the app holds, under this title */
  features?: { title: string; items: Feature[] };
};

export const APPS: App[] = [
  {
    id: "portal",
    name: "Onboarding Portal",
    sector: "Advisor onboarding · Document intake with OCR",
    summary:
      "Every new advisor goes through this portal before their account opens. A one-time code unlocks it, the advisor picks a legal status and drops their ID, company and bank documents, and an LLM reads them back into editable fields in seconds. Once the advisor confirms, the whole file goes to an n8n workflow: nobody retypes a document.",
    users: "Every advisor joining the network",
    stack: ["React", "Vite", "Express", "Docker", "CNDP-compliant LLM", "n8n", "Amazon S3"],
    screens: [
      { src: "/apps/portal-1.jpg", title: "Identity check", caption: "A one-time code, sent by SMS and email, unlocks the advisor's personal link." },
      { src: "/apps/portal-2.jpg", title: "Six-digit code", caption: "Codes expire, resends are rate-limited, and a used link can't be opened again." },
      { src: "/apps/portal-3.jpg", title: "Legal status", caption: "Pending sole trader, sole trader or company: each status asks for its own documents." },
      { src: "/apps/portal-4.jpg", title: "OCR read-back", caption: "The LLM fills in identity, company and bank fields; the advisor checks them before sending." },
    ],
    phone: "/apps/portal-phone.jpg",
  },
  {
    id: "galaxy",
    name: "Galaxy",
    sector: "Advisor workspace · Single sign-on launcher",
    summary:
      "The workspace advisors open every day, behind the company's single sign-on. Every tool, form and document floats on a physics-driven bubble map: tap a bubble and it opens its own constellation. Training sign-ups are written straight to the database the back office reads.",
    users: "Every advisor in the network",
    stack: ["React", "Vite", "Matter.js", "Express", "PostgreSQL", "Docker"],
    screens: [
      { src: "/apps/galaxy-1.jpg", title: "Bubble map", caption: "Every tool on one screen, laid out by a physics engine you can drag and fling." },
      { src: "/apps/galaxy-2.jpg", title: "A constellation", caption: "A bubble opens into its own group: perks, requests, valuations, listing boosts." },
      { src: "/apps/galaxy-3.jpg", title: "Training sign-up", caption: "The quarter's sessions, ticked and saved in one go, straight to the back office." },
      { src: "/apps/galaxy-4.jpg", title: "Single sign-on", caption: "Advisors sign in with their company account; the team has a separate door." },
    ],
    phone: "/apps/galaxy-phone.jpg",
    features: { title: "Inside the workspace", items: [
      { icon: "KeyRound", title: "Single sign-on", text: "Company accounts, nothing new to remember" },
      { icon: "Orbit", title: "Physics bubble map", text: "Matter.js layout, drag and fling" },
      { icon: "CalendarCheck", title: "Training sign-up", text: "Written straight to Postgres" },
      { icon: "FileText", title: "Official documents", text: "Read in place, in a PDF viewer" },
      { icon: "Gift", title: "Perks & requests", text: "Billboards, cards, valuations, boosts" },
      { icon: "Search", title: "Search", text: "Every tool, by name" },
      { icon: "Bug", title: "Bug reports", text: "One tap to the support form" },
      { icon: "Gamepad2", title: "Mini-games", text: "Seven of them, for the breaks" },
    ] },
  },
  {
    id: "simulator",
    name: "Commission Simulator",
    sector: "Advisor tool · Commission calculator",
    summary:
      "Before a deal is signed, an advisor wants to know what it will pay. The simulator takes the deal as they describe it (sale or rent, property type, price, side of the deal, mandate, their own rate, a business introducer) and applies the full commission scale in the browser. It shows the total, the rate applied and how the commission splits between the company, the referral network, the advisor and the introducer, side by side when the advisor holds both sides.",
    users: "Every advisor, and the back office inside Averröes",
    stack: ["React", "Vite", "TypeScript", "shadcn/ui", "Recharts"],
    screens: [
      { src: "/apps/simulator-1.jpg", title: "The deal", caption: "Sale or rent, property type, price and side of the deal: the form only asks what the scale needs." },
      { src: "/apps/simulator-2.jpg", title: "The total", caption: "Commission, combined rate and a donut of who gets what, as soon as the advisor hits Calculate." },
      { src: "/apps/simulator-3.jpg", title: "Both sides", caption: "When the advisor holds the seller and the buyer, each side gets its own split and subtotal." },
      { src: "/apps/simulator-4.jpg", title: "Custom rate & introducer", caption: "An advisor's own rate, refused below the base rate, and the business introducer's share." },
    ],
    phone: "/apps/simulator-phone.jpg",
    features: { title: "What it handles", items: [
      { icon: "Building2", title: "Six property types", text: "Apartments, new builds, land, shops, offices" },
      { icon: "ArrowLeftRight", title: "Sale or rent", text: "Each with its own scale" },
      { icon: "Split", title: "Seller, buyer or both", text: "One split per side of the deal" },
      { icon: "FileSignature", title: "Mandate-aware", text: "Exclusive or not, 3 or 6 months" },
      { icon: "Percent", title: "Custom rates", text: "The advisor's own rate, never below the base" },
      { icon: "Handshake", title: "Business introducer", text: "Their share, side by side" },
      { icon: "Store", title: "Business sales", text: "Goodwill priced on price plus rent" },
      { icon: "PieChart", title: "Visual split", text: "Company, network, advisor, introducer" },
    ] },
  },
  {
    id: "clinic",
    name: "Graft Planner",
    sector: "Hair transplant clinic · Patient assessment & PDF file",
    summary:
      "Before a hair transplant, the doctor assesses the patient and hands over a file: the diagnosis, the graft plan, and the care before and after the procedure. This tool does it in one screen. The doctor fills in the assessment on the left and clicks the zones to graft directly on a 3D head in the middle, which turns to show each one. A live summary builds up on the right, and one click generates a branded six-page PDF for the patient, in French, English or Arabic.",
    users: "The clinic's doctors, for every patient",
    stack: ["React", "Vite", "TypeScript", "Three.js", "React Three Fiber", "react-pdf", "Zustand", "i18next"],
    screens: [
      { src: "/apps/clinic-1.jpg", title: "Assessment", caption: "Patient, health, scalp and hair quality on the left; the zones to graft light up on the 3D head." },
      { src: "/apps/clinic-2.jpg", title: "Zones on a 3D head", caption: "Click a zone on the head or tick it in the list: the head turns to it and the summary updates." },
      { src: "/apps/clinic-3.jpg", title: "Three languages", caption: "French, English or Arabic, with the whole layout mirrored right to left in Arabic." },
      { src: "/apps/clinic-4.jpg", title: "The patient's file", caption: "A six-page PDF built in the browser: cover with the 3D view, diagnosis, day of the procedure, aftercare." },
    ],
    features: { title: "What it handles", items: [
      { icon: "Box", title: "3D head", text: "Clickable graft zones, shader-highlighted" },
      { icon: "Stethoscope", title: "Full assessment", text: "Health, scalp, hair, technique, grafts" },
      { icon: "FileText", title: "PDF in the browser", text: "Six branded pages, nothing uploaded" },
      { icon: "Camera", title: "3D on the cover", text: "The doctor's view, photographed into the file" },
      { icon: "Languages", title: "FR, EN, AR", text: "Arabic laid out right to left" },
      { icon: "History", title: "Session recovery", text: "Reopen the last patient after a reload" },
      { icon: "ListChecks", title: "Checks before export", text: "Name, date and at least one zone" },
      { icon: "CalendarCheck", title: "Aftercare plan", text: "Pre-op, day of, recovery, follow-up" },
    ] },
  },
];

// What happens once an advisor sends their file from the portal.
export const PORTAL_PIPELINE: Feature[] = [
  { icon: "Upload", title: "Documents", text: "ID, company and bank documents, from a phone or a laptop" },
  { icon: "ScanText", title: "OCR", text: "A CNDP-compliant LLM reads every field" },
  { icon: "UserCheck", title: "Advisor review", text: "The advisor corrects anything misread, then sends" },
  { icon: "Workflow", title: "n8n workflow", text: "Receives the whole file and routes it" },
];
export const PORTAL_OUTPUTS: Feature[] = [
  { icon: "Archive", title: "Amazon S3", text: "Every document stored in an S3 bucket" },
  { icon: "Contact", title: "CRM", text: "The extracted fields land on the advisor's record" },
];
