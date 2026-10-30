import type { Person } from "../data/fiction";
import { T } from "../theme";

/** Visage d'une personne fictive : bulle d'initiales, jamais de photo réelle. */
export function Avatar({ person, size = 24, dark = false }: { person: Person; size?: number; dark?: boolean }) {
  const initials = (person.first[0] + person.last[0]).toUpperCase();
  return (
    <span
      title={`${person.first} ${person.last}`}
      style={{
        width: size, height: size, flexShrink: 0, borderRadius: "50%", display: "inline-grid", placeItems: "center",
        background: dark ? T.sapin : T.infoSoft, color: dark ? T.cream : T.jadeInk,
        border: `1px solid ${dark ? "rgba(255,255,255,.12)" : "rgba(27,191,160,.25)"}`,
        fontSize: size < 18 ? 7 : Math.round(size * 0.36), fontWeight: 600, letterSpacing: ".02em", lineHeight: 1,
      }}
    >
      {initials}
    </span>
  );
}
