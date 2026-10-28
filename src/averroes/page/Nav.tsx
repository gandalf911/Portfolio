import { NAV } from "./copy";

function Mark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M12 2l1.8 6.2L20 6l-4.4 4.8L22 12l-6.4 1.2L20 18l-6.2-2.2L12 22l-1.8-6.2L4 18l4.4-4.8L2 12l6.4-1.2L4 6l6.2 2.2z" />
    </svg>
  );
}

export function Nav() {
  return (
    <header className="nav">
      <a className="brand" href="https://begdouriziad.com">
        <Mark /> {NAV.brand}
      </a>
      <nav className="pills">
        {NAV.links.map((l) => (
          <a key={l.href} className="pill" href={l.href}>
            {l.label}
          </a>
        ))}
      </nav>
      <a className="cta" href={NAV.cta.href}>
        {NAV.cta.label}
      </a>
    </header>
  );
}
