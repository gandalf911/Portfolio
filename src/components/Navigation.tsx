import { motion } from "motion/react";
import { useState } from "react";
import { useBreakpoint } from "../lib/breakpoint";
import { NAV_LINKS } from "../content";
import { ButtonPrimary, HeaderNavButton } from "./buttons";
import { EASE } from "./Reveal";
import "./Navigation.css";

const TRANSITION = { duration: 0.5, ease: EASE };

/** The section links in one bar, a highlight sliding under the one hovered. */
function LinkBar() {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="nav__bar" onMouseLeave={() => setHover(null)}>
      {NAV_LINKS.map((l, i) => (
        <a key={l.label} href={l.href} className="nav__link" onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}>
          {hover === i && (
            <motion.span layoutId="nav-hover" className="nav__link-hover" transition={{ type: "spring", bounce: 0.15, duration: 0.4 }} />
          )}
          <span className="nav__link-text">{l.label}</span>
        </a>
      ))}
    </div>
  );
}

/** Logo on the left, the section links grouped in the middle, "Get in touch" on the right;
 *  on phones, a menu. */
export function Navigation() {
  const bp = useBreakpoint();
  const phone = bp === "phone";
  const [open, setOpen] = useState(false);
  const isOpen = phone && open;
  const close = () => setOpen(false);

  if (!phone)
    return (
      <nav className={`nav nav--${bp}`}>
        <div className="nav__row">
          <a href="/" className="nav__logo" aria-label="Ziad Begdouri, home">
            <img src="/images/logo-mark.png" alt="Ziad Begdouri" width={496} height={81} />
          </a>
          <LinkBar />
          <div className="nav__cta">
            {/* Scrolls to the contact card in the footer (a mailto: link does nothing without a mail app). */}
            <ButtonPrimary label="Get in touch" href="#contact" />
          </div>
        </div>
      </nav>
    );

  return (
    <nav className={`nav nav--${bp}${isOpen ? " is-open" : ""}`}>
      <motion.div
        className="nav__container"
        initial={false}
        animate={phone ? { height: isOpen ? "100vh" : "auto" } : undefined}
        transition={TRANSITION}
      >
        <div className="nav__brand">
          <a href="/" className="nav__logo" aria-label="Ziad Begdouri, home">
            <img src="/images/logo-mark.png" alt="Ziad Begdouri" width={496} height={81} />
          </a>
          {phone && (
            <div
              className="nav__menu-icon"
              role="button"
              tabIndex={0}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              onClick={() => setOpen((o) => !o)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen((o) => !o)}
            >
              {isOpen ? (
                <div className="nav__x">
                  <span style={{ transform: "rotate(-45deg)" }} />
                  <span style={{ transform: "rotate(45deg)" }} />
                </div>
              ) : (
                <div className="nav__bars">
                  <span />
                  <span />
                  <span />
                </div>
              )}
            </div>
          )}
        </div>

        <motion.div
          className="nav__menu"
          initial={false}
          animate={phone ? { height: isOpen ? "auto" : 1 } : undefined}
          transition={TRANSITION}
        >
          <div className="nav__links">
            {NAV_LINKS.map((l) => (
              <HeaderNavButton key={l.label} label={l.label} href={l.href} onClick={isOpen ? close : undefined} />
            ))}
          </div>
          <div className="nav__cta">
            {/* Scrolls to the contact card in the footer (a mailto: link does nothing without a mail app). */}
            <ButtonPrimary label="Get in touch" href="#contact" onClick={isOpen ? close : undefined} />
          </div>
        </motion.div>
      </motion.div>
    </nav>
  );
}
