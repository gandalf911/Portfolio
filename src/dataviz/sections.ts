import { lazy, type ComponentType, type LazyExoticComponent } from "react";

type Demo = LazyExoticComponent<ComponentType>;

/** A demo module's named export, loaded only when its frame comes into view. */
const load = <M,>(importer: () => Promise<M>, name: keyof M): Demo =>
  lazy(() => importer().then((m) => ({ default: m[name] as ComponentType })));

/** One live view: the existing Averröes window screens are drawn for 1152 x 522,
    the dedicated demos for 1100 x 640 (plus the 16 px frame padding on each side). */
export type View = { label: string; demo: Demo; width: number; height: number; dark?: boolean };

export type Section = {
  id: string;
  title: string;
  where: string;
  lede: string;
  strengths: string[];
  views: View[];
};

const SCREEN = { width: 1184, height: 554 };
const DEMO = { width: 1132, height: 672 };

const screen = (label: string, importer: () => Promise<Record<string, unknown>>, name: string): View => ({
  label,
  demo: load(importer, name),
  ...SCREEN,
});
const demo = (label: string, importer: () => Promise<Record<string, unknown>>, name: string, dark = false): View => ({
  label,
  demo: load(importer, name),
  ...DEMO,
  dark,
});

export const SECTIONS: Section[] = [
  {
    id: "pie",
    title: "Drill-down pie charts",
    where: "Advisors › Onboarding",
    lede: "A breakdown that answers the next question by itself: click a slice and it opens into what it is made of, down to three levels.",
    strengths: [
      "Nautilus layout: slices sorted by size, each one reaching further out, so the ranking reads before the numbers do.",
      "Click a slice or its legend row to drill in: the disc folds away and sweeps back in at the next level. The breadcrumb jumps back to any level.",
      "The long tail folds into an “Autres” slice that can itself be opened, so nothing is dropped and the total always holds.",
      "Hover a slice or a legend row: the slice lifts out, the centre switches to its figures and the side column previews what is inside.",
      "Two datasets of different depth in one component, two and three levels, with each person's face in the legend.",
    ],
    views: [demo("Drill-down", () => import("./demos/NautilusPie"), "NautilusPie")],
  },
  {
    id: "sunburst",
    title: "Sunburst",
    where: "Listings › Portfolio",
    lede: "Every published listing on one disc: transaction type at the core, property type around it, sub-type on the outer ring.",
    strengths: [
      "Three nested rings drawn in hand-written SVG geometry, no charting library.",
      "Labels follow the arc and flip at the bottom of the disc so none is ever upside down.",
      "Hovering a segment rewrites the centre readout with its count and share.",
      "Sale and rent each own one charte hue, lightened ring by ring.",
    ],
    views: [screen("Sunburst", () => import("../averroes/window/screens/ListingSunburst"), "ListingSunburst")],
  },
  {
    id: "sankey",
    title: "Lifecycle Sankey",
    where: "Listings › Portfolio",
    lede: "Where every item goes in a multi-stage process, from the way it came in to the way it left.",
    strengths: [
      "No chart library: each flow is a cubic Bézier ribbon as thick as its volume, ordered at each card so ribbons never cross at the edges.",
      "Drag any stage card, or move it with the arrow keys: its ribbons re-route on every frame, and “Réinitialiser” eases every card back home.",
      "Percentages are placed by solving the curve, then nudged until they overlap no card and no other label. Flows under 3 % stay unlabelled.",
      "Hover a stage: everything unrelated dims, and the tooltip shows its volume, its share and where it goes next.",
      "A live three.js shader breathes behind the chart and glows in the colour of the card you hold; it pauses when off-screen.",
    ],
    views: [demo("Sankey", () => import("./demos/PropertySankey"), "PropertySankey", true)],
  },
  {
    id: "tables",
    title: "Tables that open up",
    where: "Transactions › Analysis",
    lede: "A number in a table is never a dead end: click it and the people behind it slide in.",
    strengths: [
      "Every count is a button, totals included; the drawer lists exactly the advisors it counts, each with their face.",
      "The count and its list are computed by the same function from the same records, so they can never disagree.",
      "A true cohort staircase: horizons a cohort hasn't reached yet show as a dot, never as a misleading zero.",
      "A heat tint on each cell shows the strongest cohorts before you read a single figure.",
      "Accent-insensitive search with live totals, and the list cascades in again on every keystroke.",
    ],
    views: [demo("Cohorts", () => import("./demos/DrillTable"), "DrillTable")],
  },
  {
    id: "preview",
    title: "Property preview",
    where: "Transactions › Declarations",
    lede: "A reference number becomes the property itself: hover it to see the listing, click it to open the full record.",
    strengths: [
      "The preview card shows photo, price, price per m² and publication date the instant you hover.",
      "No request on hover: the property is joined to each row on the server, so the card is already there.",
      "The card is measured before it paints, then flips sides to stay inside the window, even when the page is scaled down.",
      "Clicking the reference opens a lightbox: photo slideshow, keyboard arrows and the key facts beside it.",
      "Until you touch it, the demo runs itself, moving the card from row to row.",
    ],
    views: [demo("Transactions", () => import("./demos/PreviewTable"), "PreviewTable")],
  },
  {
    id: "pool",
    title: "The agent pool",
    where: "Listings › ACC record",
    lede: "Each account manager's pool of advisors, seen whole and then one by one.",
    strengths: [
      "A waffle chart: one square per advisor, coloured by segment, popping in on a staggered grid.",
      "Per-advisor rows carry two mini flow charts, so a long roster stays scannable.",
      "The year as a Nightingale rose: twelve equal wedges, radius on a square-root scale so the area carries the value.",
      "Series stack from the centre outward; hovering a petal reads out its month.",
    ],
    views: [
      screen("Pool", () => import("../averroes/window/screens/AgentPool"), "AgentPool"),
      screen("Year rose", () => import("../averroes/window/screens/PoolYear"), "PoolYear"),
    ],
  },
  {
    id: "acc",
    title: "ACC dashboard",
    where: "Listings › ACC record",
    lede: "The account managers' cockpit: rankings, recruitment curves and the state of their portfolio on one screen.",
    strengths: [
      "One selection drives the whole screen: pick a manager and the figures, the stacked bars, the gauges and their column all follow.",
      "Switching dimension re-stacks the same columns instead of redrawing them; clicking a month fades the others and opens its breakdown.",
      "Values move from where they were: gauges, counters and columns ease to the new figure, never back from zero.",
      "A dashboard you can rearrange: resize any card S, M or L, drag to swap, and the rows always fill edge to edge.",
      "In the Rankings view, recruitment curves end on each manager's avatar.",
    ],
    views: [
      demo("Dashboard", () => import("./demos/AccDashboard"), "AccDashboard"),
      screen("Rankings", () => import("../averroes/window/screens/AccCurves"), "AccCurves"),
    ],
  },
  {
    id: "more",
    title: "And the rest of the toolbox",
    where: "Across Averröes",
    lede: "The same standard everywhere else: every chart animated, every person with a face, nothing left floating in an empty frame.",
    strengths: [
      "A contribution heatmap that folds into an isometric 3D skyline.",
      "A lifecycle funnel drawn as one continuous ribbon whose thickness follows each stage.",
      "A scatter cut into four quadrants by its two medians.",
      "Cohort heatmaps and a scoring radar with its podium.",
    ],
    views: [
      screen("3D skyline", () => import("../averroes/window/screens/PortfolioStreak"), "PortfolioStreak"),
      screen("Funnel", () => import("../averroes/window/screens/LifecycleFunnel"), "LifecycleFunnel"),
      screen("Scatter", () => import("../averroes/window/screens/PropertyScoring"), "PropertyScoring"),
      screen("Heatmap", () => import("../averroes/window/screens/OnboardingHeatmap"), "OnboardingHeatmap"),
      screen("Radar", () => import("../averroes/window/screens/ScoringRadar"), "ScoringRadar"),
      screen("Transactions", () => import("../averroes/window/screens/Transactions"), "Transactions"),
    ],
  },
  {
    id: "galaxy",
    title: "The referral galaxy",
    where: "Advisors › Referral network",
    lede: "The whole referral network as a galaxy you can fly around: founders at the core, each generation spiralling outward.",
    strengths: [
      "Hundreds of people in one draw call: a single instanced mesh for the advisors, one line buffer for every referral.",
      "Reads like a tree: each founder owns a slice sized to their branch, and every generation sits on a wider, slightly turned ring.",
      "On arrival the network flies out from the core, generation by generation.",
      "Hover any star, even the smallest, to see who it is, how many advisors they brought in and their generation.",
      "Filters and a click on any advisor isolate a lineage in place: the rest shrinks and dims, nothing is rebuilt.",
    ],
    views: [demo("Galaxy", () => import("./demos/MlmGalaxy"), "MlmGalaxy", true)],
  },
];
