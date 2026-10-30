import type { ReactNode } from "react";
import { LOGO_PATH, LOGO_VIEWBOX } from "./logoPath";
import type { NavItem, NavSegment, ScreenId } from "./nav";
import type { View } from "./screens";
import { T } from "./theme";

function Logo() {
  return (
    <svg width="30" height="30" viewBox={LOGO_VIEWBOX} aria-hidden>
      <path fill={T.jade} d={LOGO_PATH} />
    </svg>
  );
}

function Me({ size }: { size: number }) {
  return (
    <span
      style={{
        width: size, height: size, borderRadius: "50%", background: T.sapin, color: T.cream,
        display: "grid", placeItems: "center", fontSize: size * 0.36, fontWeight: 600, flexShrink: 0,
      }}
    >
      ZB
    </span>
  );
}

/** Coquille d'Averröes : logo, présence, fil d'Ariane, utilisateur, onglets du segment. */
export function AppShell({
  segment,
  item,
  current,
  hidden,
  onTab,
  views,
  view,
  onView,
  children,
}: {
  segment: NavSegment;
  item: NavItem;
  current: ScreenId;
  hidden: boolean;
  onTab: (item: NavItem) => void;
  views: View[];
  view: number;
  onView: (i: number) => void;
  children: ReactNode;
}) {
  return (
    <div aria-hidden={hidden || undefined}>
      <div className="avw-head">
        <span className="avw-logo">
          <Logo /> Averröes
        </span>
        <span className="avw-online">
          EN LIGNE <Me size={26} />
        </span>
      </div>
      <div className="avw-sub">
        <div className="avw-crumb" data-testid="crumb">
          {segment.segment}
          <b>{item.label}</b>
        </div>
        <span className="avw-user">
          <span>
            Ziad Begdouri<small>MASTER CHIEF</small>
          </span>
          <Me size={32} />
        </span>
      </div>
      <div className="avw-tabs">
        {segment.items.map((t, i) => (
          <button
            key={i}
            type="button"
            className={`avw-tab${t.screen ? "" : " avw-tab--locked"}`}
            aria-current={t.screen === current ? "page" : undefined}
            aria-label={t.screen ? undefined : "Private screen"}
            onClick={() => onTab(t)}
          >
            <span aria-hidden={t.screen ? undefined : true}>{t.label}</span>
          </button>
        ))}
        {views.length > 1 && (
          <div className="avw-views" role="group" aria-label="Vues de l'écran">
            {views.map((v, i) => (
              <button key={v.label} type="button" className="avw-view" aria-pressed={i === view} onClick={() => onView(i)}>
                <v.icon size={12} aria-hidden /> {v.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="avw-stage">{children}</div>
    </div>
  );
}
