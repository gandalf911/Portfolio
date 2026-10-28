// La navigation d'Averröes. `screen` marque les sept écrans dont la vitrine est
// rejouée ici. Les autres restent privés : leur nom n'est même pas dans le code,
// seulement un faux mot de même longueur, affiché flouté (`masked`).

export type ScreenId = "overview" | "portfolio" | "catalogue" | "onboarding" | "transactions" | "acc" | "scoring";

export type NavItem = { label: string; screen?: ScreenId };
export type NavSegment = { segment: string; items: NavItem[]; locked?: boolean };

let seed = 11;
/** Faux mot déterministe de `len` lettres (espaces compris), pour garder la silhouette du menu. */
function masked(len: number): string {
  const letters = "aeiourstlnmcdpbvhgf";
  let out = "";
  for (let i = 0; i < len; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    out += i > 2 && i < len - 2 && seed % 9 === 0 && out.at(-1) !== " " ? " " : letters[seed % letters.length];
  }
  return out;
}
const priv = (len: number): NavItem => ({ label: masked(len) });
const privSeg = (len: number, items: number[]): NavSegment => ({ segment: masked(len), locked: true, items: items.map(priv) });

export const NAV: NavSegment[] = [
  privSeg(9, [7, 15]),
  {
    segment: "Conseillers",
    items: [
      { label: "Vue d'ensemble", screen: "overview" },
      { label: "Onboarding", screen: "onboarding" },
      priv(11),
      priv(3),
      priv(9),
      { label: "Scoring", screen: "scoring" },
      priv(5),
    ],
  },
  privSeg(8, [9, 9]),
  privSeg(8, [8]),
  privSeg(6, [13]),
  {
    segment: "Offre",
    items: [
      priv(14),
      { label: "Catalogue", screen: "catalogue" },
      { label: "Portfolio Bien", screen: "portfolio" },
      { label: "ACC", screen: "acc" },
      priv(11),
    ],
  },
  {
    segment: "Demande",
    items: [priv(14), priv(18), priv(15), { label: "Transactions", screen: "transactions" }],
  },
  privSeg(10, [10]),
  privSeg(7, [7]),
  privSeg(9, [19]),
  privSeg(12, [21]),
];

export function locate(screen: ScreenId): { segment: NavSegment; item: NavItem } {
  for (const segment of NAV) {
    const item = segment.items.find((i) => i.screen === screen);
    if (item) return { segment, item };
  }
  throw new Error(`screen ${screen} absent de NAV`);
}
