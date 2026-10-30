import { useEffect, useState } from "react";
import { Store, UsersRound, type LucideIcon } from "lucide-react";
import { LOGO_PATH, LOGO_VIEWBOX } from "../../window/logoPath";
import { useInView } from "../useInView";

const SOURCES: { label: string; logo?: string[]; icon?: LucideIcon }[] = [
  { label: "HubSpot", logo: ["/logos/hubspot.svg"] },
  { label: "Zendesk", logo: ["/logos/zendesk.svg"] },
  { label: "Advisor platform", icon: UsersRound },
  { label: "Divalto", logo: ["/logos/divalto.png"] },
  { label: "Listings marketplace", icon: Store },
  { label: "Zoho Mail", logo: ["/logos/zoho.svg"] },
  { label: "WhatsApp", logo: ["/logos/whatsapp.svg"] },
  { label: "PostgreSQL warehouse + dbt", logo: ["/logos/postgresql.svg", "/logos/dbt.svg"] },
];

/** « Eight sources. One reading. » : huit tuiles en orbite, les rayons s'allument vers le centre. */
export function BedrockHub() {
  const { ref, live } = useInView<HTMLDivElement>();
  const [lit, setLit] = useState(0);
  useEffect(() => {
    if (!live) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return setLit(SOURCES.length);
    let k = 0;
    const t = window.setInterval(() => {
      k += 1;
      setLit(k);
      if (k >= SOURCES.length) window.clearInterval(t);
    }, 220);
    return () => window.clearInterval(t);
  }, [live]);
  const pos = (i: number) => {
    const a = (i / SOURCES.length) * Math.PI * 2 - Math.PI / 2;
    return { x: 50 + Math.cos(a) * 36, y: 50 + Math.sin(a) * 36 };
  };
  return (
    <div ref={ref} className="vis vis-bedrock">
      <svg className="spokes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {SOURCES.map((s, i) => {
          const p = pos(i);
          return <line key={s.label} x1="50" y1="50" x2={p.x} y2={p.y} data-on={i < lit || undefined} />;
        })}
      </svg>
      <div className="hub-ring" data-on={lit >= SOURCES.length || undefined}>
        <svg viewBox={LOGO_VIEWBOX} width="44" height="44" aria-label="Averröes">
          <path fill="#84C9BD" d={LOGO_PATH} />
        </svg>
      </div>
      {SOURCES.map((s, i) => {
        const p = pos(i);
        return (
          <div key={s.label} className="tile" data-on={i < lit || undefined} style={{ left: `${p.x}%`, top: `${p.y}%` }}>
            <span className="tile-box">
              {s.logo?.map((src) => (
                <img key={src} src={src} alt="" />
              ))}
              {s.icon && <s.icon size={26} color="#1BBFA0" strokeWidth={1.8} aria-hidden />}
            </span>
            <span className="tile-label">{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}
