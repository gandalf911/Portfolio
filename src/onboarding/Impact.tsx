import { useEffect, useRef, useState } from "react";
import { CalendarCheck, Info, KeyRound, Smile, Users, type LucideIcon } from "lucide-react";
import { IMPACT } from "./data";

/* Avant / après, mesuré dans le CRM : barres qui se déploient à l'entrée dans l'écran. */

const TILE_ICONS: LucideIcon[] = [Users, KeyRound, CalendarCheck, Smile];
const fmt = (v: number) => String(v);

export function Impact() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return setOn(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setOn(true), io.disconnect()), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="imp" data-on={on || undefined}>
      <div className="imp-compare">
        <div className="imp-legend">
          <span>
            <i className="imp-dot imp-dot--before" /> Before · late 2024
          </span>
          <span>
            <i className="imp-dot imp-dot--after" /> After · 2026
          </span>
        </div>
        {IMPACT.compare.map((c, i) => {
          const max = Math.max(c.before, c.after);
          return (
            <div key={c.label + c.unit} className="imp-row" style={{ ["--i" as string]: i }}>
              <div className="imp-row-head">
                <b>{c.label}</b>
                <span>{c.unit}</span>
                <em>{c.note}</em>
              </div>
              <div className="imp-bars">
                <div className="imp-bar imp-bar--before">
                  <i style={{ width: `${(c.before / max) * 100}%` }} />
                  <span>{fmt(c.before)}</span>
                </div>
                <div className="imp-bar imp-bar--after">
                  <i style={{ width: `${(c.after / max) * 100}%` }} />
                  <span>{fmt(c.after)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="imp-tiles">
        {IMPACT.tiles.map((t, i) => {
          const Icon = TILE_ICONS[i];
          return (
            <div key={t.label} className="imp-tile" style={{ ["--i" as string]: i }}>
              <span className="imp-tile-ico">
                <Icon size={17} aria-hidden />
              </span>
              <div className="imp-tile-n serif">{t.value}</div>
              <div className="imp-tile-l">{t.label}</div>
              <p>{t.text}</p>
            </div>
          );
        })}
      </div>

      <p className="imp-method">
        <Info size={13} aria-hidden /> {IMPACT.method}
      </p>
    </div>
  );
}
