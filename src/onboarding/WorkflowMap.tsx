import { useEffect, useMemo, useRef, useState } from "react";
import { Boxes, ChevronLeft, ChevronRight, GitBranch, MousePointer2, Siren, Waypoints, Zap, type LucideIcon } from "lucide-react";

/* The real n8n workflows, redrawn: every node at its real position, every wire,
   every coloured zone. Only the labels are generic (no people, URLs or IDs). */

export type WorkflowData = {
  id: string;
  name: string;
  summary: string;
  w: number;
  h: number;
  zones: { label: string; group: string; color: string; desc: string; x: number; y: number; w: number; h: number; count: number }[];
  nodes: { x: number; y: number; k: string; l: string; z: number | null }[];
  edges: number[][];
  stats: { nodes: number; edges: number; crm: number; alerts: number; triggers: number };
};

const KINDS: Record<string, { label: string; color: string }> = {
  trigger: { label: "Trigger", color: "#ffffff" },
  crm: { label: "HubSpot", color: "#ff7a59" },
  logic: { label: "Condition / router", color: "#7d848c" },
  data: { label: "Transform", color: "#4b5158" },
  code: { label: "Code", color: "#b9a6ff" },
  message: { label: "Email / WhatsApp / Slack", color: "#5fe39a" },
  platform: { label: "Advisor platform API", color: "#4fd6bd" },
  learning: { label: "Mailbox / Thinkific", color: "#f2b24a" },
  db: { label: "Database / storage", color: "#60a5fa" },
  alert: { label: "Error alert", color: "#ff4d4d" },
  sub: { label: "Sub-workflow", color: "#e0566f" },
  api: { label: "Webhook", color: "#9aa7ff" },
};

const NODE = 80;

function edgePath(a: { x: number; y: number }, b: { x: number; y: number }) {
  const x1 = a.x + NODE, y1 = a.y + NODE / 2, x2 = b.x, y2 = b.y + NODE / 2;
  const dx = Math.max(120, Math.abs(x2 - x1) * 0.5);
  return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
}

function WorkflowMap({ data }: { data: WorkflowData }) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return setArmed(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setArmed(true), io.disconnect()), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const paths = useMemo(() => data.edges.map(([a, b]) => ({ d: edgePath(data.nodes[a], data.nodes[b]), a, b, x: data.nodes[a].x })), [data]);
  const pulses = useMemo(() => paths.filter((_, i) => i % Math.max(1, Math.ceil(paths.length / 16)) === 0), [paths]);

  // titles keep the same size on screen whatever the canvas scale; the frame follows the workflow's shape, within limits
  const LABEL = data.w / 105;
  const ratio = Math.min(3.2, Math.max(1.6, data.w / data.h));
  const zone = active === null ? null : data.zones[active];
  const inZone = (z: number | null) => active === null || z === active;
  const composition = useMemo(() => {
    const list = data.nodes.filter((n) => active === null || n.z === active);
    const c = new Map<string, number>();
    for (const n of list) c.set(n.k, (c.get(n.k) ?? 0) + 1);
    return { total: list.length, parts: [...c.entries()].sort((a, b) => b[1] - a[1]) };
  }, [data, active]);

  const groups = useMemo(() => {
    const m = new Map<string, { color: string; zones: { i: number; label: string; count: number }[] }>();
    data.zones.forEach((z, i) => {
      const g = m.get(z.group) ?? { color: z.color, zones: [] };
      g.zones.push({ i, label: z.label, count: z.count });
      m.set(z.group, g);
    });
    return [...m.entries()];
  }, [data]);

  return (
    <div ref={ref} className="wf-body">
      <div className="wf-canvas" style={{ aspectRatio: String(ratio) }} onMouseLeave={() => setActive(null)}>
        <svg viewBox={`0 0 ${data.w} ${data.h}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-label={`${data.name}: n8n workflow map`}>
          {data.zones.map((z, i) => {
            const on = active === i;
            return (
              <rect
                key={i}
                className="wf-zone"
                x={z.x}
                y={z.y}
                width={z.w}
                height={z.h}
                rx={48}
                fill={z.color}
                fillOpacity={on ? 0.18 : active === null ? 0.07 : 0.025}
                stroke={z.color}
                strokeOpacity={on ? 0.9 : active === null ? 0.3 : 0.1}
                strokeWidth={on ? 14 : 6}
                onMouseEnter={() => setActive(i)}
              />
            );
          })}

          <g className="wf-edges" pointerEvents="none">
            {paths.map((p, i) => {
              const lit = inZone(data.nodes[p.a].z) || inZone(data.nodes[p.b].z);
              return (
                <path
                  key={i}
                  d={p.d}
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={armed ? 0 : 1}
                  stroke={active !== null && lit ? data.zones[active].color : "#ffffff"}
                  strokeOpacity={active === null ? 0.28 : lit ? 0.75 : 0.06}
                  style={{ ["--d" as string]: `${Math.round((p.x / data.w) * 1400)}ms` }}
                />
              );
            })}
          </g>

          <g pointerEvents="none">
            {data.nodes.map((n, i) => (
              <rect
                key={i}
                className="wf-node"
                x={n.x}
                y={n.y}
                width={NODE}
                height={NODE}
                rx={n.k === "trigger" ? 40 : 18}
                fill={KINDS[n.k]?.color ?? "#666"}
                fillOpacity={inZone(n.z) ? 1 : 0.15}
                style={{ opacity: armed ? 1 : 0, ["--d" as string]: `${Math.round((n.x / data.w) * 1400) + 150}ms` }}
              >
                <title>{n.l}</title>
              </rect>
            ))}
          </g>

          {armed && (
            <g pointerEvents="none">
              {pulses.map((p, i) => (
                <circle key={i} r={LABEL / 5} fill="#fff" visibility="hidden" opacity={active === null || inZone(data.nodes[p.a].z) ? 0.9 : 0}>
                  <set attributeName="visibility" to="visible" begin={`${1.6 + i * 0.27}s`} />
                  <animateMotion dur={`${2.2 + (i % 5) * 0.35}s`} repeatCount="indefinite" begin={`${1.6 + i * 0.27}s`} path={p.d} />
                </circle>
              ))}
            </g>
          )}

          {/* Titles last, sitting on the zone border like a legend: never under a node. */}
          <g pointerEvents="none">
            {data.zones.map((z, i) => {
              const w = z.label.length * LABEL * 0.56 + LABEL * 1.1;
              if (w > z.w + LABEL * 1.5) return null;
              const on = active === i;
              const dim = active !== null && !on;
              return (
                <g key={i} opacity={dim ? 0.25 : 1} style={{ transition: "opacity .3s" }}>
                  <rect x={z.x + LABEL * 0.6} y={z.y - LABEL * 0.72} width={w} height={LABEL * 1.45} rx={LABEL * 0.72} fill="#0d0d0d" stroke={z.color} strokeOpacity={on ? 1 : 0.5} strokeWidth={LABEL / 18} />
                  <text x={z.x + LABEL * 0.6 + w / 2} y={z.y + LABEL * 0.36} textAnchor="middle" fontSize={LABEL} fontWeight="600" fill={z.color}>
                    {z.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <div className="wf-foot">
        <div className="wf-detail">
          {zone ? (
            <>
              <span className="wf-chip" style={{ color: zone.color, borderColor: zone.color }}>
                {zone.group}
              </span>
              <h4>{zone.label}</h4>
              <p>{zone.desc}</p>
            </>
          ) : (
            <>
              <span className="wf-chip">
                <MousePointer2 size={12} aria-hidden /> Hover a zone to see what it does
              </span>
              <h4>{data.name}</h4>
              <p>{data.summary}</p>
            </>
          )}
          <div className="wf-bar" aria-label="Node types">
            {composition.parts.map(([k, v]) => (
              <i key={k} style={{ flexGrow: v, background: KINDS[k]?.color }} title={`${KINDS[k]?.label}: ${v}`} />
            ))}
          </div>
          <div className="wf-bar-legend">
            {composition.parts.slice(0, 6).map(([k, v]) => (
              <span key={k}>
                <i style={{ background: KINDS[k]?.color }} />
                {KINDS[k]?.label} <b>{v}</b>
              </span>
            ))}
            <span className="wf-total">{composition.total} nodes</span>
          </div>
        </div>

        <div className="wf-zones" onMouseLeave={() => setActive(null)}>
          {groups.map(([g, { color, zones }]) => (
            <div key={g} className="wf-group">
              <span style={{ color }}>{g}</span>
              <div>
                {zones.map((z) => (
                  <span
                    key={z.i}
                    className="wf-zbtn"
                    data-on={active === z.i || undefined}
                    style={{ ["--c" as string]: data.zones[z.i].color }}
                    onMouseEnter={() => setActive(z.i)}
                  >
                    {z.label} <small>{z.count}</small>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Les cinq workflows dans le même cadre : onglets, flèches, une carte à la fois. */
export function WorkflowCarousel({ workflows }: { workflows: WorkflowData[] }) {
  const [at, setAt] = useState(0);
  const data = workflows[at];
  const go = (d: number) => setAt((i) => (i + d + workflows.length) % workflows.length);
  const stats: { icon: LucideIcon; value: number; label: string }[] = [
    { icon: Boxes, value: data.stats.nodes, label: "nodes" },
    { icon: Waypoints, value: data.stats.edges, label: "connections" },
    { icon: GitBranch, value: data.zones.length, label: data.zones.length > 1 ? "process zones" : "process zone" },
    { icon: Zap, value: data.stats.crm, label: "HubSpot operations" },
    { icon: Siren, value: data.stats.alerts, label: "error alerts" },
  ];

  return (
    <div className="wf">
      <div className="wf-tabs" role="tablist" aria-label="Workflows">
        {workflows.map((w, i) => (
          <button key={w.id} type="button" role="tab" aria-selected={i === at} className="wf-tab" onClick={() => setAt(i)}>
            {w.name} <small>{w.stats.nodes}</small>
          </button>
        ))}
      </div>
      <div className="wf-head">
        <div>
          <span className="wf-kicker">
            n8n · production · workflow {at + 1} of {workflows.length}
          </span>
          <h3 className="serif" key={data.id}>
            {data.name}
          </h3>
        </div>
        <div className="wf-stats">
          {stats.map((s) => (
            <span key={s.label}>
              <s.icon size={14} aria-hidden />
              <b>{s.value}</b> {s.label}
            </span>
          ))}
        </div>
        <div className="wf-arrows">
          <button type="button" onClick={() => go(-1)} aria-label="Previous workflow">
            <ChevronLeft size={18} aria-hidden />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next workflow">
            <ChevronRight size={18} aria-hidden />
          </button>
        </div>
      </div>
      <div className="wf-slide" key={data.id}>
        <WorkflowMap data={data} />
      </div>
    </div>
  );
}
