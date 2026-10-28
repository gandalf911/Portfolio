// Jeu de données fictif. Aucun nom, chiffre ni photo réels : les ordres de grandeur
// imitent le parc, rien de plus. Généré par un aléa à graine fixe pour que chaque
// rendu (et chaque capture) soit identique.

export type City = "Casablanca" | "Rabat" | "Marrakech" | "Tanger" | "Agadir" | "Fès";
export type Person = { id: string; first: string; last: string; city: City };
export type Tone = "ok" | "info" | "warn" | "alert" | "neutral";

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r = rng(20261021);
const int = (a: number, b: number) => Math.floor(a + r() * (b - a + 1));

const p = (id: string, first: string, last: string, city: City): Person => ({ id, first, last, city });

export const ACCS: Person[] = [
  p("a1", "Nadia", "Berrada", "Casablanca"),
  p("a2", "Omar", "Lazrak", "Rabat"),
  p("a3", "Leila", "Kettani", "Casablanca"),
  p("a4", "Karim", "Zniber", "Marrakech"),
  p("a5", "Salma", "Ouazzani", "Tanger"),
  p("a6", "Anas", "Filali", "Agadir"),
];

export const ADVISORS: Person[] = [
  p("c01", "Amine", "Sqalli", "Casablanca"),
  p("c02", "Hiba", "Guedira", "Rabat"),
  p("c03", "Yassine", "Belkora", "Casablanca"),
  p("c04", "Sara", "Mernissi", "Fès"),
  p("c05", "Imane", "Daoudi", "Marrakech"),
  p("c06", "Reda", "Jabri", "Casablanca"),
  p("c07", "Ines", "Benchekroun", "Casablanca"),
  p("c08", "Nour", "Iraqi", "Rabat"),
  p("c09", "Othmane", "Lahlou", "Tanger"),
  p("c10", "Kawtar", "Hajji", "Casablanca"),
  p("c11", "Adam", "Chami", "Agadir"),
  p("c12", "Rania", "Bouzidi", "Marrakech"),
  p("c13", "Ilyas", "Rifai", "Casablanca"),
  p("c14", "Malak", "Ziani", "Rabat"),
  p("c15", "Walid", "Mansouri", "Casablanca"),
  p("c16", "Yasmine", "Skalli", "Fès"),
  p("c17", "Ayoub", "Benali", "Tanger"),
  p("c18", "Lina", "Sefrioui", "Casablanca"),
  p("c19", "Zakaria", "Tounsi", "Marrakech"),
  p("c20", "Aya", "Khatib", "Rabat"),
  p("c21", "Badr", "Alami", "Casablanca"),
  p("c22", "Soukaina", "Fassi", "Agadir"),
  p("c23", "Mehdi", "Naciri", "Casablanca"),
  p("c24", "Ghizlane", "Sbai", "Marrakech"),
];

export const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct"];

/* ---------- Conseillers › Vue d'ensemble ---------- */
export const OVERVIEW = {
  retention: {
    pct: 23.4,
    remaining: 612,
    total: 2614,
    avgMonths: 6.2,
    buckets: [
      { label: "< 3 m", value: 41 },
      { label: "3–6 m", value: 52 },
      { label: "6–12 m", value: 37 },
      { label: "12–24 m", value: 9 },
      { label: "24 m +", value: 4 },
    ],
  },
  network: { active: 612, recruitedThisYear: 1060 },
  recoveryPct: 71.8,
  onboarding: { score: 4.5, responses: 148 },
  unpaid: { count: 19, example: ADVISORS[9], months: 5 },
  spotlight: { acc: ACCS[2], recruits: 24, month: "octobre" },
  topScoring: [
    { who: ADVISORS[0], score: 3.9, profile: { offre: 4.2, demande: 2.6, tx: 4.6 } },
    { who: ADVISORS[6], score: 3.7, profile: { offre: 3.4, demande: 3.9, tx: 3.8 } },
    { who: ADVISORS[3], score: 3.5, profile: { offre: 4.6, demande: 1.8, tx: 3.9 } },
  ],
};

/* ---------- Offre › Portfolio Bien : série de publications ---------- */
function buildStreak() {
  const days: { date: string; count: number }[] = [];
  const d = new Date(Date.UTC(2025, 10, 3)); // lundi 3 nov. 2025
  const end = Date.UTC(2026, 9, 20);
  let i = 0;
  while (d.getTime() <= end) {
    const wd = d.getUTCDay();
    if (wd !== 0 && wd !== 6) {
      // deux creux (vacances d'hiver, Aïd) pour casser la série
      const gap = (i > 52 && i < 55) || (i > 140 && i < 142) || (i > 196 && i < 198);
      const base = 8 + Math.sin(i / 17) * 5 + i / 30;
      days.push({ date: d.toISOString().slice(0, 10), count: gap ? 0 : Math.max(1, Math.round(base + r() * 9)) });
      i++;
    }
    d.setUTCDate(d.getUTCDate() + 1);
  }
  let longest = 0, run = 0;
  for (const x of days) { run = x.count > 0 ? run + 1 : 0; longest = Math.max(longest, run); }
  return { days, longest, current: run };
}
export const STREAK = buildStreak();

export const LEAD_FLOW: {
  nodes: { id: string; label: string; value: number; tone: Tone }[];
  links: { from: string; to: string; value: number }[];
} = {
  nodes: [
    { id: "leads", label: "Leads reçus", value: 41820, tone: "neutral" },
    { id: "platform", label: "Leads plateforme", value: 30210, tone: "info" },
    { id: "advisor", label: "Leads conseiller", value: 11610, tone: "ok" },
    { id: "qualified", label: "Qualifiés", value: 9840, tone: "ok" },
    { id: "unqualified", label: "Non qualifiés", value: 18960, tone: "alert" },
    { id: "listed", label: "Publiés", value: 4210, tone: "ok" },
    { id: "rejected", label: "Rejetés", value: 61, tone: "warn" },
    { id: "archived", label: "Archivés", value: 20830, tone: "alert" },
  ],
  links: [
    { from: "leads", to: "platform", value: 30210 },
    { from: "leads", to: "advisor", value: 11610 },
    { from: "platform", to: "unqualified", value: 18960 },
    { from: "platform", to: "qualified", value: 11250 },
    { from: "advisor", to: "qualified", value: 11610 },
    { from: "qualified", to: "listed", value: 4210 },
    { from: "qualified", to: "rejected", value: 61 },
    { from: "qualified", to: "archived", value: 18589 },
  ],
};

/* ---------- Offre › Catalogue ---------- */
export const LISTINGS: {
  kind: "VENTE" | "LOCATION";
  price: number;
  type: string;
  project: string;
  place: string;
  area: number;
  rooms: number;
  source: "Plateforme" | "Conseiller";
  photo: string;
  photos: number;
  advisor: Person;
}[] = [
  { kind: "VENTE", price: 1850000, type: "Appartement", project: "Les Jardins d'Anfa", place: "Casablanca, Anfa", area: 118, rooms: 3, source: "Plateforme", photo: "/catalogue/1.jpg", photos: 7, advisor: ADVISORS[0] },
  { kind: "LOCATION", price: 9500, type: "Appartement", project: "Résidence Oasis", place: "Casablanca, Oasis", area: 96, rooms: 2, source: "Conseiller", photo: "/catalogue/2.jpg", photos: 6, advisor: ADVISORS[7] },
  { kind: "VENTE", price: 3200000, type: "Villa", project: "Palmeraie Est", place: "Marrakech, Palmeraie", area: 310, rooms: 5, source: "Conseiller", photo: "/catalogue/3.jpg", photos: 8, advisor: ADVISORS[4] },
  { kind: "LOCATION", price: 14000, type: "Bureaux", project: "Plateau Agdal", place: "Rabat, Agdal", area: 140, rooms: 4, source: "Plateforme", photo: "/catalogue/4.jpg", photos: 5, advisor: ADVISORS[13] },
  { kind: "VENTE", price: 1240000, type: "Appartement", project: "Marina Bay", place: "Tanger, Malabata", area: 89, rooms: 2, source: "Plateforme", photo: "/catalogue/5.jpg", photos: 6, advisor: ADVISORS[8] },
  { kind: "LOCATION", price: 7200, type: "Appartement", project: "Hay Riad Parc", place: "Rabat, Hay Riad", area: 82, rooms: 2, source: "Conseiller", photo: "/catalogue/6.jpg", photos: 4, advisor: ADVISORS[19] },
];

/* ---------- Conseillers › Onboarding : entonnoir par cohorte ---------- */
function buildCohorts() {
  const recruited = [71, 92, 84, 105, 69, 116, 98, 31, 121, 67];
  const signed = recruited.map((v, i) => Math.round(v * (0.83 + ((i * 7) % 12) / 100)));
  const elearning = signed.map((v, i) => (i === 9 ? Math.round(v * 0.24) : Math.round(v * (0.55 + ((i * 5) % 30) / 100))));
  const leadsOn = elearning.map((v, i) => Math.round(v * (0.32 + i * 0.06)));
  const pct = (a: number[], b: number[]) => a.map((v, i) => Math.round((v / b[i]) * 100));
  return {
    months: MONTHS,
    rows: [
      { label: "Recrutés", values: recruited, kind: "count" as const },
      { label: "Contrat signé", values: signed, kind: "count" as const },
      { label: "% contrat signé", values: pct(signed, recruited), kind: "pct" as const },
      { label: "E-learning terminé", values: elearning, kind: "count" as const },
      { label: "% e-learning / contrat signé (cible 90 %)", values: pct(elearning, signed), kind: "pct" as const },
      { label: "Actif · Leads On", values: leadsOn, kind: "count" as const },
      { label: "Délai médian contrat → Leads On (j)", values: [null, 34, 21, 12, 13, 12, 13, 10, 8, 6], kind: "days" as const },
      { label: "Satisfaction onboarding", values: [4.8, 4.4, 4.5, 4.2, 4.3, 4.4, 4.5, 4.4, 4.6, 4.7], kind: "score" as const },
    ] as { label: string; values: (number | null)[]; kind: "count" | "pct" | "days" | "score" }[],
  };
}
export const COHORTS = buildCohorts();

/* ---------- Demande › Transactions ---------- */
export const TX = {
  declared: 44,
  billed: 682,
  paid: 1164,
  stages: [
    { label: "Paiement exécuté", value: 948 },
    { label: "Facture définitive envoyée", value: 251 },
    { label: "Facture proforma envoyée", value: 233 },
    { label: "Paiement constaté", value: 176 },
    { label: "BC envoyé au conseiller", value: 139 },
  ],
};

/* ---------- Offre › ACC ---------- */
export const ACC_SERIES = {
  months: MONTHS,
  series: ACCS.map((acc, k) => ({
    acc,
    values: MONTHS.map((_, i) => Math.max(1, Math.round(14 + Math.sin(i / 1.6 + k) * 9 + (k === 0 && i === 5 ? 18 : 0) + int(0, 7)))),
  })),
};

export const TROPHIES: { title: string; acc: Person; detail: string; tone: "jade" | "gold" | "sapin" | "rose" }[] = [
  { title: "Recruteur du mois", acc: ACCS[2], detail: "24 recrues", tone: "jade" },
  { title: "Publicationniste du mois", acc: ACCS[0], detail: "81 biens publiés", tone: "gold" },
  { title: "As de la vente", acc: ACCS[3], detail: "9 ventes", tone: "sapin" },
  { title: "As de la location", acc: ACCS[1], detail: "17 locations", tone: "rose" },
];

/* ---------- Conseillers › Scoring ---------- */
export const SCORING = {
  profile: { offre: 4.1, demande: 1.4, tx: 4.6 },
  global: 3.68,
  who: ADVISORS[0],
  risers: [
    { who: ADVISORS[10], from: 391, to: 28 },
    { who: ADVISORS[15], from: 377, to: 44 },
    { who: ADVISORS[2], from: 362, to: 39 },
    { who: ADVISORS[18], from: 349, to: 51 },
    { who: ADVISORS[21], from: 318, to: 60 },
  ],
  fallers: [
    { who: ADVISORS[11], from: 36, to: 402 },
    { who: ADVISORS[5], from: 52, to: 381 },
    { who: ADVISORS[16], from: 64, to: 371 },
    { who: ADVISORS[22], from: 91, to: 377 },
    { who: ADVISORS[12], from: 97, to: 360 },
  ],
};

/* ---------- Offre › Portfolio Bien : cycle de vie (état courant du parc) ---------- */
export const LIFECYCLE: { label: string; value: number; tone: Tone }[] = [
  { label: "Soumis", value: 1180, tone: "info" },
  { label: "Qualification", value: 3720, tone: "info" },
  { label: "Affectation", value: 260, tone: "info" },
  { label: "En traitement", value: 2810, tone: "info" },
  { label: "Finalisé", value: 18, tone: "ok" },
  { label: "Rejeté", value: 52, tone: "warn" },
  { label: "Publié", value: 3050, tone: "ok" },
  { label: "Suspendu", value: 88, tone: "warn" },
  { label: "Vendu", value: 570, tone: "ok" },
  { label: "Vendu hors PF", value: 1640, tone: "neutral" },
  { label: "Archivé", value: 15072, tone: "alert" },
];

/* ---------- Offre › Catalogue : scoring des biens publiés (attractivité × priorité) ---------- */
function buildPropertyScores() {
  const pts: { x: number; y: number }[] = [];
  const gauss = () => (r() + r() + r() + r() - 2) / 2; // ~N(0, 0.58)
  for (let i = 0; i < 3120; i++) {
    const x = Math.max(12, Math.min(94, 54 + gauss() * 26));
    // la priorité tombe sur des paliers (barème à points), resserrée autour de 35
    const y = Math.max(12, Math.min(80, Math.round((36 + gauss() * 17 + (x > 60 ? -2 : 3)) / 3) * 3));
    pts.push({ x, y });
  }
  const mx = 54.2, my = 36;
  // agrégation en grille : une bulle par case, rayon selon l'effectif
  const bins = new Map<string, { x: number; y: number; n: number }>();
  for (const p of pts) {
    const bx = Math.round(p.x / 3.2) * 3.2, key = `${bx}|${p.y}`;
    const b = bins.get(key) ?? { x: bx, y: p.y, n: 0 };
    b.n++;
    bins.set(key, b);
  }
  const quad = (x: number, y: number) => (x >= mx ? (y >= my ? "engine" : "blind") : y >= my ? "rework" : "radar");
  const counts = { engine: 0, blind: 0, rework: 0, radar: 0 };
  for (const p of pts) counts[quad(p.x, p.y)]++;
  return { total: pts.length, medianX: mx, medianY: my, bins: [...bins.values()], counts, quad };
}
export const PROPERTY_SCORES = buildPropertyScores();

/* ---------- Offre › Catalogue : biens publiés par transaction, typologie, sous-typologie ---------- */
export type SunNode = { label: string; value: number; children?: SunNode[] };
export const LISTING_MIX: SunNode[] = [
  {
    label: "Vente",
    value: 2240,
    children: [
      { label: "Appartement", value: 1290, children: [{ label: "Appartement", value: 1160 }, { label: "Duplex", value: 72 }, { label: "Studio", value: 58 }] },
      { label: "Villa", value: 440, children: [{ label: "Villa", value: 440 }] },
      { label: "Local commercial", value: 250, children: [{ label: "Local commercial", value: 250 }] },
      { label: "Terrain", value: 160, children: [{ label: "Lot de villa", value: 140 }, { label: "Terrain nu", value: 20 }] },
      { label: "Bureaux", value: 100, children: [{ label: "Bureaux", value: 100 }] },
    ],
  },
  {
    label: "Location",
    value: 880,
    children: [
      { label: "Appartement", value: 540, children: [{ label: "Appartement", value: 360 }, { label: "Studio", value: 165 }, { label: "Duplex", value: 15 }] },
      { label: "Local commercial", value: 180, children: [{ label: "Local commercial", value: 180 }] },
      { label: "Villa", value: 110, children: [{ label: "Villa", value: 110 }] },
      { label: "Bureaux", value: 50, children: [{ label: "Bureaux", value: 50 }] },
    ],
  },
];

/* ---------- Offre › ACC : pool d'agents ---------- */
export const POOL = {
  groups: [
    { key: "tx", label: "A transacté", count: 30, tone: "alert" as Tone },
    { key: "pub", label: "A publié, sans transaction", count: 24, tone: "warn" as Tone },
    { key: "none", label: "Jamais publié", count: 30, tone: "info" as Tone },
  ],
  rows: [
    { who: ADVISORS[2], leads: { all: [238, 2], clusters: [104, 0] }, pipe: { platform: [2, 0, 1], advisor: [0, 0, 0] } },
    { who: ADVISORS[13], leads: { all: [211, 5], clusters: [88, 3] }, pipe: { platform: [4, 1, 0], advisor: [1, 0, 0] } },
    { who: ADVISORS[20], leads: { all: [196, 0], clusters: [31, 0] }, pipe: { platform: [7, 6, 0], advisor: [3, 2, 0] } },
  ],
};

/* ---------- Offre › ACC : l'année du pool, mois par mois ---------- */
export const POOL_YEAR = {
  months: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"],
  // entrés en traitement, publiés, transactions (Nov et Déc pas encore écoulés)
  intake: [152, 188, 161, 214, 131, 176, 118, 129, 163, 171, 0, 0],
  listed: [61, 78, 70, 96, 58, 82, 49, 55, 72, 68, 0, 0],
  deals: [9, 12, 10, 14, 8, 13, 7, 9, 11, 10, 0, 0],
};
