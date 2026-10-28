import { Hero } from "../page/Hero";
import { WindowStage } from "../page/WindowStage";
import { Descent } from "../page/Descent";
import { Method } from "../page/Method";
import { Footer } from "../page/Footer";
import { AverroesWindow } from "../window/AverroesWindow";
import { SCOPED_CSS } from "./scopedCss.generated";

export type Part = "page" | "hero" | "window" | "windowOnly" | "descent" | "method" | "footer";

const FONTS =
  "@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter+Tight:wght@300;400;500;600&family=Poppins:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');";

/**
 * Entrée Framer : toute la page, ou une seule de ses parties (pour composer la page
 * avec des sections natives autour). Le CSS de la page est préfixé `.acs` au build :
 * il ne touche rien hors du composant.
 */
export function CaseStudyRoot({ part = "page" }: { part?: Part }) {
  const top = (
    <div className="top">
      <div className="aurora" aria-hidden />
      <div className="stars" aria-hidden />
      {/* La barre de navigation est celle du portfolio, posée par Framer au-dessus : on garde seulement sa hauteur. */}
      <div aria-hidden style={{ height: 106 }} />
      <Hero />
    </div>
  );
  return (
    <div className="acs">
      <style>{FONTS}</style>
      <style>{SCOPED_CSS}</style>
      {(part === "page" || part === "hero") && top}
      {(part === "page" || part === "window") && <WindowStage />}
      {part === "windowOnly" && <AverroesWindow />}
      {(part === "page" || part === "descent") && <Descent />}
      {(part === "page" || part === "method") && <Method />}
      {part === "footer" && <Footer />}
    </div>
  );
}
