import { useRef } from "react";
import { Bell, Camera, CircleHelp, Heart, House, Lightbulb, Newspaper, Search, Settings, Sun, type LucideIcon } from "lucide-react";

export type DockAction = "menu" | "feedback" | "notifs" | "feed" | "theme";

type Item = { icon: LucideIcon; label: string; action?: DockAction };

const BASE = 50;
const MAX = 80;
const REACH = 150;

/** Le dock d'Averröes : grossissement à la macOS sous le curseur. Menu, FAQ, notifications,
 *  fil et thème agissent ; recherche, capture, favoris et paramètres restent décoratifs. */
export function Dock({ onAction, unread, dark }: { onAction: (a: DockAction) => void; unread: number; dark: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const items: Item[] = [
    { icon: House, label: "Menu", action: "menu" },
    { icon: Search, label: "Rechercher" },
    { icon: CircleHelp, label: "Améliorations / FAQ & bug", action: "feedback" },
    { icon: Bell, label: "Notifications", action: "notifs" },
    { icon: Newspaper, label: "Fil d'actualité", action: "feed" },
    { icon: Camera, label: "Capture d'écran" },
    { icon: Heart, label: "Favoris" },
    { icon: Settings, label: "Paramètres" },
    { icon: dark ? Sun : Lightbulb, label: dark ? "Mode clair" : "Mode sombre", action: "theme" },
  ];

  const magnify = (x: number | null) => {
    const el = ref.current;
    if (!el) return;
    // read every position first, then write: interleaving forced a layout per button
    const buttons = Array.from(el.children) as HTMLElement[];
    const centres = x === null ? [] : buttons.map((b) => {
      const r = b.getBoundingClientRect();
      return r.left + r.width / 2;
    });
    buttons.forEach((b, i) => {
      let size = BASE;
      if (x !== null) {
        const d = Math.abs(x - centres[i]);
        if (d < REACH) size = BASE + (MAX - BASE) * (1 - d / REACH);
      }
      b.style.width = b.style.height = `${size}px`;
    });
  };

  return (
    <div className="avw-dockwrap">
      <div className="avw-dock" ref={ref} onMouseMove={(e) => magnify(e.clientX)} onMouseLeave={() => magnify(null)}>
        {items.map(({ icon: Icon, label, action }) => (
          <button
            key={action ?? label}
            type="button"
            className="avw-di"
            aria-label={label}
            aria-disabled={action ? undefined : true}
            onClick={action ? () => onAction(action) : undefined}
          >
            <span className="avw-tip">{label}</span>
            <Icon strokeWidth={1.8} aria-hidden />
            {action === "notifs" && unread > 0 && <span className="avw-badge">{unread}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
