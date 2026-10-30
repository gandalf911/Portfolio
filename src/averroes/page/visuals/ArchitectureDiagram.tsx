import { useInView } from "../useInView";

const DBS = [
  { x: 14, label: "App DB", sub: ["read-write", "users, audit, annotations"] },
  { x: 146, label: "Mirror", sub: ["read-only", "self-healing tunnel"] },
  { x: 278, label: "Live warehouse", sub: ["read-only", "freshest numbers"] },
];

/** Trois bases, trois niveaux de confiance, et n8n en bout de chaîne (viewBox 400 × 520). */
export function ArchitectureDiagram() {
  const { ref, inView, live } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className="vis vis-arch" data-on={inView || undefined} data-live={live || undefined}>
      <svg viewBox="0 0 400 520" width="100%" height="100%" aria-label="Architecture d'Averröes">
        <defs>
          <marker id="ah" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L8,4 L0,8 z" fill="#1bbfa0" />
          </marker>
        </defs>
        <path className="flow" d="M200,72 V150" markerEnd="url(#ah)" />
        <path className="flow" d="M140,232 C100,280 72,300 68,352" markerEnd="url(#ah)" />
        <path className="flow ro" d="M200,296 V352" markerEnd="url(#ah)" />
        <path className="flow ro" d="M260,232 C300,280 328,300 332,352" markerEnd="url(#ah)" />
        <path className="flow out" d="M290,190 H318" markerEnd="url(#ah)" />

        <g className="node soft">
          <rect x="120" y="30" width="160" height="42" rx="21" />
          <text x="200" y="56">31 screens · role-based access</text>
        </g>

        <g className="node core">
          <rect x="100" y="150" width="190" height="82" rx="16" />
          <text x="195" y="182" className="t-big">Averröes</text>
          <text x="195" y="202" className="t-sub">Next.js · TypeScript</text>
        </g>
        <g className="gates">
          {["page", "API", "menu"].map((g, i) => (
            <g key={g}>
              <rect x={120 + i * 52} y={248} width="44" height="18" rx="9" />
              <text x={142 + i * 52} y={260.5}>{g}</text>
            </g>
          ))}
          <text x="198" y="286" className="t-gate">3 enforcement points</text>
        </g>

        <g className="node n8n">
          <rect x="318" y="160" width="72" height="60" rx="12" />
          <text x="354" y="186" className="t-big">n8n</text>
          <text x="354" y="204" className="t-sub">29 flows</text>
        </g>

        {DBS.map((d) => (
          <g key={d.label} className="node db">
            <rect x={d.x} y="352" width="108" height="92" rx="12" />
            <ellipse cx={d.x + 54} cy="370" rx="13" ry="4.5" />
            <text x={d.x + 54} y="398" className="t-big">{d.label}</text>
            <text x={d.x + 54} y="416" className="t-sub">{d.sub[0]}</text>
            <text x={d.x + 54} y="430" className="t-sub">{d.sub[1]}</text>
          </g>
        ))}
        <text x="200" y="490" className="t-foot">writes only where it must · reads where it's cheapest</text>
      </svg>
    </div>
  );
}
