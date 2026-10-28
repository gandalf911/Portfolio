// Charte Averröes (crème / sapin / jade + terracotta / rose). Aucune autre teinte.
export const T = {
  bg: "#f7ede1",
  elevated: "#feefe0",
  surface: "#ffffff",
  text: "#1a3431",
  sapin: "#1a3431",
  sapinDeep: "#142826",
  muted: "rgba(26,52,49,.6)",
  border: "rgba(26,52,49,.08)",
  jade: "#84c9bd",
  jadeCta: "#1bbfa0",
  jadeInk: "#0e9a81",
  jadeSoft: "rgba(27,191,160,.14)",
  infoSoft: "rgba(132,201,189,.18)",
  terracotta: "#ec6048",
  terracottaSoft: "rgba(236,96,72,.14)",
  rose: "#c03163",
  roseSoft: "rgba(192,49,99,.12)",
  font: "Poppins, system-ui, sans-serif",
} as const;

/** Séries de graphe : les teintes de la charte, déclinées en clarté uniquement. */
export const SERIES = ["#1bbfa0", "#84c9bd", "#ec6048", "#c03163", "#1a3431", "#4fd6bd"];

export const TONE = {
  ok: { ink: T.jadeInk, bg: T.jadeSoft, solid: T.jadeCta },
  info: { ink: "#3d8d81", bg: T.infoSoft, solid: T.jade },
  warn: { ink: "#c4452f", bg: T.terracottaSoft, solid: T.terracotta },
  alert: { ink: "#a32550", bg: T.roseSoft, solid: T.rose },
  neutral: { ink: "rgba(26,52,49,.72)", bg: "rgba(26,52,49,.07)", solid: T.sapin },
} as const;
