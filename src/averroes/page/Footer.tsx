import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { FOOTER } from "./copy";

export function Footer() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(FOOTER.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.location.href = `mailto:${FOOTER.email}`;
    }
  };
  return (
    <footer className="footer">
      <div className="footer-card">
        <div className="aurora aurora-foot" aria-hidden />
        <div className="stars" aria-hidden />
        <div className="footer-body">
          <h2 className="serif">{FOOTER.title}</h2>
          <p>{FOOTER.sub}</p>
          <button type="button" className="email" onClick={copy}>
            {FOOTER.email}
            {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
          </button>
          <nav className="pills foot-pills">
            {FOOTER.links.map((l) => (
              <a key={l.label} className="pill" href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="footer-note">{FOOTER.note}</div>
        <div className="footer-copy">Copyright Ziad Begdouri. All rights reserved.</div>
      </div>
    </footer>
  );
}
