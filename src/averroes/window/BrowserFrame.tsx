import type { ReactNode } from "react";

export function BrowserFrame({ path, children }: { path: string; children: ReactNode }) {
  return (
    <div className="avw-frame">
      <div className="avw-chrome">
        <span className="avw-dot" style={{ background: "#ff5f57" }} />
        <span className="avw-dot" style={{ background: "#febc2e" }} />
        <span className="avw-dot" style={{ background: "#28c840" }} />
        <span className="avw-url">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" aria-hidden>
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          {path}
        </span>
        <span className="avw-tag">Illustrative data</span>
      </div>
      {children}
    </div>
  );
}
