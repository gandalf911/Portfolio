import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import { Boxes, CalendarRange, Flame, Filter, LayoutGrid, PieChart, ScatterChart, Users } from "lucide-react";
import type { ScreenId } from "../nav";
import { Overview } from "./Overview";
import { PortfolioStreak } from "./PortfolioStreak";
import { LifecycleFunnel } from "./LifecycleFunnel";
import { Catalogue } from "./Catalogue";
import { PropertyScoring } from "./PropertyScoring";
import { ListingSunburst } from "./ListingSunburst";
import { OnboardingHeatmap } from "./OnboardingHeatmap";
import { Transactions } from "./Transactions";
import { AccCurves } from "./AccCurves";
import { AgentPool } from "./AgentPool";
import { PoolYear } from "./PoolYear";
import { ScoringRadar } from "./ScoringRadar";

export type View = { label: string; icon: LucideIcon; component: ComponentType };

/** Les vitrines de chaque écran ouvert ; à plusieurs, un sélecteur apparaît au bout des onglets. */
export const SCREENS: Record<ScreenId, View[]> = {
  overview: [{ label: "Vue", icon: LayoutGrid, component: Overview }],
  portfolio: [
    { label: "Publications", icon: Flame, component: PortfolioStreak },
    { label: "Cycle de vie", icon: Filter, component: LifecycleFunnel },
  ],
  catalogue: [
    { label: "Annonces", icon: LayoutGrid, component: Catalogue },
    { label: "Scoring des biens", icon: ScatterChart, component: PropertyScoring },
    { label: "Typologie", icon: PieChart, component: ListingSunburst },
  ],
  onboarding: [{ label: "Vue", icon: LayoutGrid, component: OnboardingHeatmap }],
  transactions: [{ label: "Vue", icon: LayoutGrid, component: Transactions }],
  acc: [
    { label: "Classements", icon: Boxes, component: AccCurves },
    { label: "Pool d'agents", icon: Users, component: AgentPool },
    { label: "Année du pool", icon: CalendarRange, component: PoolYear },
  ],
  scoring: [{ label: "Vue", icon: LayoutGrid, component: ScoringRadar }],
};
