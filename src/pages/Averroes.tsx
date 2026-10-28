import { CaseStudyRoot } from "../averroes/framer/entry";

/** /averroes: the Averröes case study, the same component the Framer page embeds (part "page"). */
export function Averroes() {
  return (
    <div style={{ width: "100%", overflow: "clip", background: "#0b0b0b" }}>
      <CaseStudyRoot part="page" />
    </div>
  );
}
