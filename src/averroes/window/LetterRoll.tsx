const STAGGER = 0.035;

/** Survol « letter roll » du menu : chaque lettre monte, son double arrive par dessous. */
export function LetterRoll({ text }: { text: string }) {
  const letters = Array.from(text).map((c, i) => (
    <i key={i} style={{ transitionDelay: `${i * STAGGER}s` }}>
      {c === " " ? "\u00a0" : c}
    </i>
  ));
  return (
    <span className="avw-roll">
      <span>{letters}</span>
      <span aria-hidden>{letters}</span>
    </span>
  );
}
