import { useInView } from "../useInView";

const LAYERS = [
  { label: "Scan", sub: "one glance, one answer" },
  { label: "Explore", sub: "charts you can click" },
  { label: "Deep dive", sub: "the record behind the number" },
];

const BARS = [40, 62, 48, 80, 55, 92, 70];
const HOT_BAR = 5;
const ROWS = ["Amine S.", "Hiba G.", "Sara M.", "Reda J."];

/**
 * Trois plans superposés : le même chiffre lu à trois profondeurs. Un surlignage
 * descend de la tuile à sa barre, puis à la ligne qui la justifie.
 */
export function SurfaceLayers() {
  const { ref, inView, live } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className="vis vis-surface" data-on={inView || undefined} data-live={live || undefined}>
      <div className="planes">
        <div className="plane plane-0">
          <span className="plane-tag">Scan</span>
          <div className="p-tiles">
            <span className="hot"><b>612</b>advisors</span>
            <span><b>71,8%</b>collected</span>
            <span><b>4,5</b>onboarding</span>
          </div>
        </div>
        <div className="plane plane-1">
          <span className="plane-tag">Explore</span>
          <div className="p-bars">
            {BARS.map((h, k) => (
              <i key={k} className={k === HOT_BAR ? "hot" : undefined} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="plane plane-2">
          <span className="plane-tag">Deep dive</span>
          <div className="p-rows">
            {ROWS.map((name, k) => (
              <span key={name} className={k === 0 ? "hot" : undefined}>
                <em />
                {name}
                <i />
              </span>
            ))}
          </div>
        </div>
      </div>
      <ul className="vis-legend">
        {LAYERS.map((l, i) => (
          <li key={l.label}>
            <b>{i + 1}</b> {l.label} <span>{l.sub}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
