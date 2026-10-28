import { useEffect } from "react";
import { Lock } from "lucide-react";
import { NAV, type NavItem, type ScreenId } from "./nav";
import { LetterRoll } from "./LetterRoll";

export type MenuState = "closed" | "open" | "closing";

export function FullMenu({
  state,
  current,
  onClose,
  onPick,
}: {
  state: MenuState;
  current: ScreenId;
  onClose: () => void;
  onPick: (item: NavItem) => void;
}) {
  useEffect(() => {
    if (state !== "open") return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [state, onClose]);

  if (state === "closed") return null;
  return (
    <div className="avw-full" role="dialog" aria-label="Menu" data-state={state} style={{ pointerEvents: state === "closing" ? "none" : undefined }}>
      <div className="avw-fhead">
        <span>Averröes</span>
        <button type="button" className="avw-link" onClick={onClose}>
          Fermer
        </button>
      </div>
      <ul className="avw-fgrid">
        {NAV.map((seg, si) => (
          <li key={si} className={`avw-seg${seg.locked ? " avw-seg--locked" : ""}`}>
            <span aria-hidden={seg.locked || undefined}>{seg.segment}</span>
            <ul>
              {seg.items.map((item, ii) =>
                item.screen ? (
                  <li key={ii}>
                    <button
                      type="button"
                      className="avw-item"
                      aria-label={item.label}
                      aria-current={item.screen === current ? "page" : undefined}
                      onClick={() => onPick(item)}
                    >
                      <LetterRoll text={item.label} />
                    </button>
                  </li>
                ) : (
                  <li key={ii}>
                    <button type="button" className="avw-item avw-item--locked" aria-label="Private screen" onClick={() => onPick(item)}>
                      <span className="avw-mask" aria-hidden>{item.label}</span>
                      <Lock size={11} className="avw-lock" aria-hidden />
                    </button>
                  </li>
                ),
              )}
            </ul>
          </li>
        ))}
      </ul>
      <div className="avw-ffoot">Déconnexion</div>
    </div>
  );
}
