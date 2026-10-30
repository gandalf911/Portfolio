// Charte Averröes (crème / sapin / jade + terracotta / rose). Aucune autre teinte.
/** Les teintes de fond, de texte et de bordure, par thème. Les accents ne changent pas. */
export const PALETTE = {
  light: {
    bg: "#f7ede1",
    elevated: "#feefe0",
    surface: "#ffffff",
    text: "#1a3431",
    muted: "rgba(26,52,49,.6)",
    border: "rgba(26,52,49,.08)",
    jadeSoft: "rgba(27,191,160,.14)",
    infoSoft: "rgba(132,201,189,.18)",
    ink: "26 52 49",
  },
  dark: {
    bg: "#0f1d1b",
    elevated: "#142826",
    surface: "#1a302d",
    text: "#feefe0",
    muted: "rgba(254,239,224,.62)",
    border: "rgba(254,239,224,.1)",
    jadeSoft: "rgba(27,191,160,.2)",
    infoSoft: "rgba(132,201,189,.16)",
    ink: "254 239 224",
  },
} as const;

/** Jetons des écrans : les teintes de thème pointent sur les variables de `.avw`. */
export const T = {
  bg: "var(--bg)",
  elevated: "var(--el)",
  surface: "var(--sf)",
  text: "var(--tx)",
  cream: "#feefe0", // texte posé sur le sapin : le même dans les deux thèmes
  sapin: "#1a3431",
  sapinDeep: "#142826",
  muted: "var(--mu)",
  border: "var(--bd)",
  jade: "#84c9bd",
  jadeCta: "#1bbfa0",
  jadeInk: "#0e9a81",
  jadeSoft: "var(--js)",
  infoSoft: "var(--is)",
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
  neutral: { ink: "rgb(var(--ink) / .72)", bg: "rgb(var(--ink) / .07)", solid: T.sapin },
} as const;
