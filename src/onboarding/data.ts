// All the copy of the /onboarding case study, in one place.
// Built from the real n8n workflows (structure only): no company name, no real person,
// every advisor and message below is fictional.

export const HERO = {
  eyebrow: "Case study · Designed, automated and run by me · 2025 to now",
  title: "Joining, learning, leaving. On autopilot.",
  lede: [
    { text: "A real-estate network of 800+ advisors used to onboard people by hand: chasing documents, creating accounts, sending links. I redesigned the process and " },
    { text: "automated it end to end", strong: true },
    { text: ", from the first payment to the exit survey. HubSpot holds the state, n8n does the work, and " },
    { text: "nobody chases anybody.", strong: true },
  ],
  stats: [
    { value: "1,755", label: "Advisors onboarded through it" },
    { value: "−90%", label: "Time to a signed contract" },
    { value: "19×", label: "More contracts signed within a week" },
    { value: "4.9/5", label: "Onboarding satisfaction" },
  ],
};

export type Channel = "email" | "whatsapp" | "slack" | "zoom";
export type SystemId = "hubspot" | "n8n" | "gmail" | "whatsapp" | "thinkific" | "zoom" | "zoho" | "slack" | "portal" | "platform" | "esign" | "postgres";

export type Email = { headline: string; accent: string; body: string; cta: string; full?: string };

export type Stage = {
  id: string;
  phase: "onboarding" | "offboarding";
  label: string;
  title: string;
  trigger: string;
  steps: string[];
  message?: { channel: Channel; to: string; text: string; email?: Email };
  systems: SystemId[];
  sla?: string;
};

export const ADVISOR = { first: "Salma", last: "Idrissi", city: "Rabat" };

export const STAGES: Stage[] = [
  {
    id: "payment",
    phase: "onboarding",
    label: "Payment",
    title: "Sign-up confirmed, the file opens itself",
    trigger: "HubSpot deal moves to “Payment received”",
    steps: [
      "Checks the deal is unique, then links contact and deal",
      "Normalises the phone number to the platform format",
      "Builds a personal document link and sends it",
      "Moves the deal to “Waiting for documents”",
    ],
    message: { channel: "email", to: "Salma", text: "Welcome aboard! Upload your documents here, it takes 3 minutes: secure link inside.", email: { headline: "Welcome aboard,", accent: "Salma.", body: "We just need a few documents to get you started. It takes three minutes.", cta: "Upload my documents", full: "/emails/documents.html" } },
    systems: ["hubspot", "n8n", "gmail"],
    sla: "Stamps the time spent in each stage",
  },
  {
    id: "documents",
    phase: "onboarding",
    label: "Documents",
    title: "A secure portal instead of email attachments",
    trigger: "Advisor submits the portal form",
    steps: [
      "Stores ID, bank details and company papers in a private bucket",
      "Reads the documents (OCR) and attaches them to the HubSpot contact",
      "Creates the company record for incorporated advisors",
      "Missing piece? Deal to “Missing items” and the owner is pinged",
    ],
    message: { channel: "slack", to: "Advisor owner", text: "Salma Idrissi: bank details missing. Deal moved to Missing items." },
    systems: ["portal", "n8n", "hubspot", "slack"],
    sla: "Reminder after 15 days without documents",
  },
  {
    id: "kyc",
    phase: "onboarding",
    label: "KYC & contract",
    title: "Back-office checks, then the contract goes out",
    trigger: "Documents complete",
    steps: [
      "Sends the KYC form, then routes the file to back-office validation",
      "Validated: the contract is generated and sent for e-signature",
      "Express track skips the wait for advisors who qualify",
      "Signature lands back on the deal, nothing to re-type",
    ],
    message: { channel: "email", to: "Salma", text: "Your contract is ready. Sign it online, it opens your accesses right away.", email: { headline: "Your contract is", accent: "ready.", body: "Sign it online: your accesses open the minute it comes back.", cta: "Sign my contract" } },
    systems: ["hubspot", "n8n", "esign", "gmail"],
  },
  {
    id: "accounts",
    phase: "onboarding",
    label: "Accounts",
    title: "Every access created in one pass",
    trigger: "Contract signed",
    steps: [
      "Creates the professional mailbox",
      "Creates the learning account and enrols the advisor in module 0",
      "Creates the advisor-platform account through its API, with sponsor and manager",
      "Emails each access separately, deal to “Active advisor”",
    ],
    message: { channel: "email", to: "Salma", text: "Your mailbox and your training space are live. Start with module 0 today.", email: { headline: "Your accesses are", accent: "live.", body: "Professional mailbox and training space are ready. Start with module 0 today.", cta: "Start my training" } },
    systems: ["n8n", "zoho", "thinkific", "platform", "gmail", "hubspot"],
  },
  {
    id: "elearning",
    phase: "onboarding",
    label: "E-learning",
    title: "Training that unlocks itself",
    trigger: "Thinkific: course completed",
    steps: [
      "Writes the module result on the HubSpot contact (M0 to M10, quiz)",
      "Unlocks the next module, then the specialised tracks",
      "Photo shooting and first-deal tracks open at the right time",
      "Progress visible in the CRM, no spreadsheet to update",
    ],
    message: { channel: "whatsapp", to: "Salma", text: "Module 4 done, well played! Module 5 is open: pricing a property." },
    systems: ["thinkific", "n8n", "hubspot", "whatsapp"],
  },
  {
    id: "visio",
    phase: "onboarding",
    label: "Live training",
    title: "Zoom sessions only the invited can join",
    trigger: "Advisor added to a training cohort",
    steps: [
      "Registers each invitee and approves them",
      "Zoom sends a personal link, the public link is never shared",
      "Attendance comes back after the session",
      "No-shows are invited to the next session",
    ],
    message: { channel: "zoom", to: "Salma", text: "You're registered: “Your first mandate”, Thursday 10:00. Your personal link is below." },
    systems: ["zoom", "n8n", "hubspot"],
  },
  {
    id: "activation",
    phase: "onboarding",
    label: "Activation",
    title: "Leads on, starter kit in hand",
    trigger: "Training complete",
    steps: [
      "Opens lead access on the advisor platform",
      "Sends the starter kit and sets the advisor's neighbourhoods",
      "Deal to “Leads on”: the onboarding is officially over",
      "Satisfaction survey goes out",
    ],
    message: { channel: "whatsapp", to: "Salma", text: "Your lead access is open. Here is your starter kit to land a first deal." },
    systems: ["platform", "n8n", "hubspot", "whatsapp"],
  },
  {
    id: "retention",
    phase: "onboarding",
    label: "First 45 days",
    title: "Nobody is left alone after day one",
    trigger: "Daily sweep, from day 1",
    steps: [
      "Day 1 and day 2: a WhatsApp follow-up sent in the manager's name",
      "Survey answers become a score on the contact and the deal",
      "A low score creates a task for the manager",
      "“First deal” programme and back-office SLAs tracked in the CRM",
    ],
    message: { channel: "whatsapp", to: "Salma", text: "Hi Salma, it's Nadia, your manager. How was your first day? Anything I can unblock?" },
    systems: ["n8n", "whatsapp", "hubspot", "postgres"],
  },
  {
    id: "exit",
    phase: "offboarding",
    label: "Exit request",
    title: "Leaving is a pipeline too",
    trigger: "Offboarding requested",
    steps: [
      "Opens a deal in the offboarding pipeline, linked to contact and company",
      "Records the reason and updates the contract register",
      "Back-office qualifies the request",
    ],
    message: { channel: "slack", to: "Back-office", text: "New exit request: reason recorded, qualification needed." },
    systems: ["hubspot", "n8n", "slack"],
  },
  {
    id: "handover",
    phase: "offboarding",
    label: "Handover",
    title: "Hand everything over before cutting anything",
    trigger: "Request qualified",
    steps: [
      "Finds the advisor's listings and reassigns them to their manager",
      "Moves the people they sponsored to a new sponsor",
      "Each reassignment is its own stage, so nothing is half done",
    ],
    message: { channel: "email", to: "Sponsored advisors", text: "Your sponsor is changing. Nothing changes for you, here is your new contact.", email: { headline: "Your sponsor is", accent: "changing.", body: "Nothing changes for you. Here is your new point of contact.", cta: "Meet my new sponsor" } },
    systems: ["platform", "n8n", "hubspot", "gmail"],
  },
  {
    id: "closing",
    phase: "offboarding",
    label: "Closing",
    title: "Accesses closed, the door left open",
    trigger: "Handover complete",
    steps: [
      "Sends the termination amendment",
      "Removes mailbox and learning access, suspends the platform account",
      "Sends an exit survey, the answers feed the retention work",
    ],
    message: { channel: "email", to: "Salma", text: "Thank you for these months together. Two minutes to tell us what we could do better?", email: { headline: "Thank you,", accent: "Salma.", body: "Two minutes to tell us what we could have done better?", cta: "Share my feedback" } },
    systems: ["esign", "zoho", "thinkific", "platform", "n8n", "gmail"],
  },
];

export const PRINCIPLES: { title: string; text: string; icon: "state" | "channel" | "unlock" | "alarm" | "door" }[] = [
  {
    icon: "state",
    title: "One state, one place",
    text: "The HubSpot deal stage is the truth. Every stage change fires a webhook, n8n reacts, and the time spent in each stage is stamped on the deal. Anyone can see where an advisor is, and since when.",
  },
  {
    icon: "channel",
    title: "Talk where people are",
    text: "Email for documents and accesses, WhatsApp for the nudges people actually read, Slack for the colleague who has to act. Each message goes on the channel that gets it done.",
  },
  {
    icon: "unlock",
    title: "Training that runs itself",
    text: "Each completed module comes back from Thinkific, lands in the CRM and opens the next one. Live sessions on Zoom only let invited people in, with a personal link each.",
  },
  {
    icon: "alarm",
    title: "Fail loud, never silent",
    text: "Every API call has an error branch that posts the advisor and the failed step in Slack. A daily sweep catches files stuck too long in a stage and sends the reminder.",
  },
  {
    icon: "door",
    title: "Offboarding is designed too",
    text: "Its own pipeline: reassign listings and sponsored advisors first, close accesses last, then ask why. A clean exit protects the network and the people who stay.",
  },
];

export const SYSTEMS: { id: SystemId; label: string; logo?: string }[] = [
  { id: "n8n", label: "n8n", logo: "/images/stack-n8n.svg" },
  { id: "hubspot", label: "HubSpot CRM", logo: "/logos/hubspot.svg" },
  { id: "gmail", label: "Email", logo: "/images/stack-google.svg" },
  { id: "whatsapp", label: "WhatsApp", logo: "/logos/whatsapp.svg" },
  { id: "thinkific", label: "Thinkific", logo: "/images/mark-thinkific.svg" },
  { id: "zoom", label: "Zoom" },
  { id: "zoho", label: "Zoho Mail", logo: "/logos/zoho.svg" },
  { id: "slack", label: "Slack" },
  { id: "portal", label: "Document portal" },
  { id: "platform", label: "Advisor platform" },
  { id: "esign", label: "E-signature" },
  { id: "postgres", label: "PostgreSQL", logo: "/images/stack-postgresql.svg" },
];

// Bars measured in the CRM by join date: Jul–Dec 2024 (before the redesign, 258 advisors) vs Apr–Sep 2026 (full pipeline, 519).
// Hero figures (1,755 / −90% / 19× / 4.9) as given by Ziad.
export const IMPACT = {
  method: "Measured in the CRM by join date: 258 advisors who joined between July and December 2024, before the redesign, against 519 who joined between April and September 2026, with the full pipeline live.",
  compare: [
    { label: "Joining to signed contract", unit: "days, median", before: 28.5, after: 4, better: "lower", note: "−86%" },
    { label: "Joining to signed contract", unit: "days, average", before: 49.7, after: 6.1, better: "lower", note: "−88%" },
    { label: "Contracts actually signed", unit: "% of new advisors", before: 56, after: 90, better: "higher", note: "+34 pts" },
  ],
  tiles: [
    { value: "1,755", label: "advisors onboarded", text: "through the redesigned process and its automations." },
    { value: "4 days", label: "to every access", text: "median from joining to mailbox, learning space and platform account, none created by hand." },
    { value: "23 days", label: "to lead access", text: "median from joining to the first leads, training included, now tracked for every advisor." },
    { value: "4.9/5", label: "onboarding satisfaction", text: "average rating in the onboarding survey. Every answer is scored and followed up." },
  ],
};

export const NEXT = { label: "Next case study", title: "Averröes", href: "/averroes" };
