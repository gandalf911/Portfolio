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
    { id: "leads", label: "Total", value: 41820, tone: "neutral" },
    { id: "platform", label: "Source A", value: 30210, tone: "info" },
    { id: "advisor", label: "Source B", value: 11610, tone: "ok" },
    { id: "qualified", label: "Groupe 1", value: 9840, tone: "ok" },
    { id: "unqualified", label: "Groupe 2", value: 18960, tone: "alert" },
    { id: "listed", label: "Sortie A", value: 4210, tone: "ok" },
    { id: "rejected", label: "Sortie B", value: 61, tone: "warn" },
    { id: "archived", label: "Sortie C", value: 20830, tone: "alert" },
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
      { label: "Metric 1", values: recruited, kind: "count" as const },
      { label: "Metric 2", values: signed, kind: "count" as const },
      { label: "% Metric 2 / Metric 1", values: pct(signed, recruited), kind: "pct" as const },
      { label: "Metric 3", values: elearning, kind: "count" as const },
      { label: "% Metric 3 / Metric 2 (cible 90 %)", values: pct(elearning, signed), kind: "pct" as const },
      { label: "Metric 4", values: leadsOn, kind: "count" as const },
      { label: "Délai médian Metric 2 → Metric 4 (j)", values: [null, 34, 21, 12, 13, 12, 13, 10, 8, 6], kind: "days" as const },
      { label: "Metric 5 (note)", values: [4.8, 4.4, 4.5, 4.2, 4.3, 4.4, 4.5, 4.4, 4.6, 4.7], kind: "score" as const },
    ] as { label: string; values: (number | null)[]; kind: "count" | "pct" | "days" | "score" }[],
  };
}
export const COHORTS = buildCohorts();

/* ---------- Demande › Transactions : courbe, entonnoir, répartition (libellés neutres) ---------- */
export const TX = {
  m1: [38, 44, 41, 52, 47, 58, 49, 55, 63, 71],
  m2: [22, 27, 25, 31, 30, 36, 29, 35, 41, 46],
  funnel: [
    { label: "Étape 1", value: 1420 },
    { label: "Étape 2", value: 1085 },
    { label: "Étape 3", value: 812 },
    { label: "Étape 4", value: 566 },
    { label: "Étape 5", value: 431 },
  ],
  mix: [
    { label: "Catégorie A", value: 46 },
    { label: "Catégorie B", value: 27 },
    { label: "Catégorie C", value: 17 },
    { label: "Catégorie D", value: 10 },
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
  { title: "Prix A", acc: ACCS[2], detail: "24 · Metric 1", tone: "jade" },
  { title: "Prix B", acc: ACCS[0], detail: "81 · Metric 2", tone: "gold" },
  { title: "Prix C", acc: ACCS[3], detail: "9 · Metric 3", tone: "sapin" },
  { title: "Prix D", acc: ACCS[1], detail: "17 · Metric 4", tone: "rose" },
];

/* ---------- Conseillers › Scoring ---------- */
export const SCORING = {
  profile: { m1: 4.1, m2: 1.4, m3: 4.6 },
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

/* ---------- Offre › Portfolio Bien : cycle de vie (étapes neutres) ---------- */
export const LIFECYCLE: { label: string; value: number; tone: Tone }[] = [
  { label: "Étape 1", value: 1180, tone: "info" },
  { label: "Étape 2", value: 3720, tone: "info" },
  { label: "Étape 3", value: 260, tone: "info" },
  { label: "Étape 4", value: 2810, tone: "info" },
  { label: "Étape 5", value: 18, tone: "ok" },
  { label: "Étape 6", value: 52, tone: "warn" },
  { label: "Étape 7", value: 3050, tone: "ok" },
  { label: "Étape 8", value: 88, tone: "warn" },
  { label: "Étape 9", value: 570, tone: "ok" },
  { label: "Étape 10", value: 1640, tone: "neutral" },
  { label: "Étape 11", value: 15072, tone: "alert" },
];

/* ---------- Offre › Catalogue : scoring des biens publiés (Metric 1 × Metric 2) ---------- */
function buildPropertyScores() {
  const pts: { x: number; y: number }[] = [];
  const gauss = () => (r() + r() + r() + r() - 2) / 2; // ~N(0, 0.58)
  for (let i = 0; i < 3120; i++) {
    const x = Math.max(12, Math.min(94, 54 + gauss() * 26));
    // l'axe y tombe sur des paliers, resserré autour de 35
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
  const quad = (x: number, y: number) => (x >= mx ? (y >= my ? "a" : "b") : y >= my ? "c" : "d");
  const counts = { a: 0, b: 0, c: 0, d: 0 };
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
    { key: "s1", label: "Segment 1", count: 30, tone: "alert" as Tone },
    { key: "s2", label: "Segment 2", count: 24, tone: "warn" as Tone },
    { key: "s3", label: "Segment 3", count: 30, tone: "info" as Tone },
  ],
  rows: [
    { who: ADVISORS[2], leads: { all: [238, 2], subset: [104, 0] }, pipe: { srcA: [2, 0, 1], srcB: [0, 0, 0] } },
    { who: ADVISORS[13], leads: { all: [211, 5], subset: [88, 3] }, pipe: { srcA: [4, 1, 0], srcB: [1, 0, 0] } },
    { who: ADVISORS[20], leads: { all: [196, 0], subset: [31, 0] }, pipe: { srcA: [7, 6, 0], srcB: [3, 2, 0] } },
  ],
};

/* ---------- Offre › ACC : l'année du pool, mois par mois ---------- */
export const POOL_YEAR = {
  months: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"],
  // trois séries mensuelles (Nov et Déc pas encore écoulés)
  intake: [152, 188, 161, 214, 131, 176, 118, 129, 163, 171, 0, 0],
  listed: [61, 78, 70, 96, 58, 82, 49, 55, 72, 68, 0, 0],
  deals: [9, 12, 10, 14, 8, 13, 7, 9, 11, 10, 0, 0],
};

/* ---------- Dock : notifications, fil d'actualité, FAQ (tout est fictif) ---------- */
export const ME: Person = p("me", "Ziad", "Begdouri", "Casablanca");

export type Notif = { id: string; tone: Tone; tag: string; kind: string; who?: Person; text: string; ago: string; unread: boolean };
export const NOTIFS: Notif[] = [
  { id: "n1", tone: "alert", tag: "Urgent", kind: "Accès", who: ADVISORS[17], text: "Demande d'accès en attente de validation.", ago: "il y a 4 min", unread: true },
  { id: "n2", tone: "warn", tag: "À traiter", kind: "Déclarations", who: ADVISORS[6], text: "Nouvelle déclaration à rattacher à un bien.", ago: "il y a 22 min", unread: true },
  { id: "n3", tone: "ok", tag: "Bonne nouvelle", kind: "Réseau", who: ACCS[2], text: "Trois nouveaux conseillers rejoignent son réseau.", ago: "il y a 1 h", unread: true },
  { id: "n4", tone: "info", tag: "Info", kind: "Scoring", text: "Scores et rangs recalculés pour 598 conseillers.", ago: "il y a 3 h", unread: false },
  { id: "n5", tone: "warn", tag: "À traiter", kind: "Publication", who: ADVISORS[9], text: "Un bien attend une seconde vérification.", ago: "hier", unread: false },
  { id: "n6", tone: "info", tag: "Info", kind: "Formation", text: "Séance de jeudi 14 h : 18 inscrits, lien envoyé.", ago: "hier", unread: false },
];

export const FEED: { id: string; who: Person; role: string; ago: string; text: string; photo?: string; notes?: string[]; likes: number; comments: number }[] = [
  { id: "f1", who: ACCS[0], role: "ACC · Casablanca", ago: "il y a 2 h", text: "Bienvenue aux 12 conseillers de la promo d'octobre ! Première visio jeudi à 14 h, le lien arrive par email.", photo: "/catalogue/1.jpg", likes: 24, comments: 6 },
  { id: "f2", who: ME, role: "Équipe produit", ago: "hier", text: "Nouveautés de la semaine dans Averröes :", notes: ["Transactions : courbe, entonnoir et répartition, mois par mois", "Mode sombre, depuis le dock", "Notifications triées par priorité, à marquer comme lues", "FAQ et signalement de bug sans quitter l'écran"], likes: 31, comments: 9 },
  { id: "f3", who: ACCS[3], role: "ACC · Marrakech", ago: "lundi", text: "Bravo à Imane Daoudi pour sa première transaction ce mois-ci. Belle façon d'ouvrir la saison !", photo: "/catalogue/3.jpg", likes: 48, comments: 12 },
];

export const FAQ: { q: string; a: string }[] = [
  { q: "Comment ouvrir un écran ?", a: "Menu, dans le dock, liste tous les segments. Un écran verrouillé est privé." },
  { q: "Qui voit quoi ?", a: "Chaque rôle a son préréglage d'accès ; un administrateur peut ouvrir ou fermer un segment pour une personne." },
  { q: "D'où viennent les chiffres ?", a: "Dans cette vitrine, d'un jeu de données fictif. Aucun nom ni chiffre n'est réel." },
  { q: "Comment signaler un bug ?", a: "Onglet Bug : la zone concernée et ce qui s'est passé. La réponse arrive dans les notifications." },
];
