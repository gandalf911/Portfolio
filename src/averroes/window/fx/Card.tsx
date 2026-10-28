import type { CSSProperties, ReactNode } from "react";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { T } from "../theme";

/** Carte Averröes : blanche, arrondie, pastille d'icône jade, flèche d'accès en coin. */
export function Card({
  icon: Icon,
  title,
  tone = "ok",
  arrow = true,
  style,
  children,
}: {
  icon?: LucideIcon;
  title?: string;
  tone?: "ok" | "alert";
  arrow?: boolean;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const chip = tone === "alert" ? { bg: T.roseSoft, fg: T.rose } : { bg: T.jadeSoft, fg: T.jadeCta };
  return (
    <div className="avw-card" style={style}>
      {(Icon || title) && (
        <div className="avw-card-h">
          {Icon && (
            <span style={{ width: 30, height: 30, borderRadius: 9, background: chip.bg, color: chip.fg, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Icon size={15} strokeWidth={1.8} aria-hidden />
            </span>
          )}
          {title && <span>{title}</span>}
        </div>
      )}
      {arrow && <ArrowUpRight className="avw-card-x" size={14} aria-hidden />}
      {children}
    </div>
  );
}
