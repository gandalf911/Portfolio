import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Navigation } from "./Navigation";
import "./Layout.css";

/** Framer layout template "Main", shared by every page: header on top, footer at the end. */
export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="layout">
      <header className="layout__header">
        <div className="layout__nav">
          <Navigation />
        </div>
      </header>
      {children}
      <div className="layout__footer">
        <Footer />
      </div>
    </div>
  );
}
