import type { ReactNode } from "react";
import { DESCENT, DESCENT_INTRO, type DescentItem } from "./copy";
import { DescentCard } from "./DescentCard";
import { WordFill } from "./WordFill";
import { SurfaceLayers } from "./visuals/SurfaceLayers";
import { ProductModules } from "./visuals/ProductModules";
import { StateMachineStrip } from "./visuals/StateMachineStrip";
import { ArchitectureDiagram } from "./visuals/ArchitectureDiagram";
import { ScoringAudit } from "./visuals/ScoringAudit";
import { BedrockHub } from "./visuals/BedrockHub";

const VISUALS: Record<DescentItem["visual"], () => ReactNode> = {
  surface: () => <SurfaceLayers />,
  product: () => <ProductModules />,
  architecture: () => <ArchitectureDiagram />,
  automation: () => <StateMachineStrip />,
  audit: () => <ScoringAudit />,
  bedrock: () => <BedrockHub />,
};

export function Descent() {
  return (
    <section className="section descent">
      <h2 className="section-title serif">{DESCENT_INTRO.title}</h2>
      <WordFill className="wordfill" text={DESCENT_INTRO.text} />
      <div className="dstack">
        {DESCENT.map((d, i) => (
          <DescentCard key={d.id} item={d} index={i} visual={VISUALS[d.visual]()} />
        ))}
      </div>
    </section>
  );
}
