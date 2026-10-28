import { useRef } from "react";
import { Bell, Camera, CircleHelp, Heart, House, Lightbulb, Newspaper, Search, Settings, type LucideIcon } from "lucide-react";

const ITEMS: { icon: LucideIcon; label: string; badge?: string }[] = [
  { icon: House, label: "Menu" },
  { icon: Search, label: "Rechercher" },
  { icon: CircleHelp, label: "Améliorations / FAQ & bug" },
  { icon: Bell, label: "Notifications", badge: "9+" },
  { icon: Newspaper, label: "Fil d'actualité" },
  { icon: Camera, label: "Capture d'écran" },
  { icon: Heart, label: "Favoris" },
  { icon: Settings, label: "Paramètres" },
  { icon: Lightbulb, label: "Mode sombre" },
];

const BASE = 50;
const MAX = 80;
const REACH = 150;

/** Le dock d'Averröes : grossissement à la macOS sous le curseur. Seul « Menu » agit. */
export function Dock({ onMenu }: { onMenu: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  const magnify = (x: number | null) => {
    const el = ref.current;
    if (!el) return;
    for (const b of Array.from(el.children) as HTMLElement[]) {
      let size = BASE;
      if (x !== null) {
        const r = b.getBoundingClientRect();
        const d = Math.abs(x - (r.left + r.width / 2));
        if (d < REACH) size = BASE + (MAX - BASE) * (1 - d / REACH);
      }
      b.style.width = b.style.height = `${size}px`;
    }
  };

  return (
    <div className="avw-dockwrap">
      <div className="avw-dock" ref={ref} onMouseMove={(e) => magnify(e.clientX)} onMouseLeave={() => magnify(null)}>
        {ITEMS.map(({ icon: Icon, label, badge }) => (
          <button
            key={label}
            type="button"
            className="avw-di"
            aria-label={label}
            onClick={label === "Menu" ? onMenu : undefined}
          >
            <span className="avw-tip">{label}</span>
            <Icon strokeWidth={1.8} aria-hidden />
            {badge && <span className="avw-badge">{badge}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
