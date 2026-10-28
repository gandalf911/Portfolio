import { motion } from "motion/react";
import { useBreakpoint } from "../lib/breakpoint";
import { EMAIL, FOOTER, NAV_LINKS } from "../content";
import { FooterNavButton, SocialButton } from "./buttons";
import { CopyButton } from "./CopyButton";
import { Particles } from "./Particles";
import { EASE, LINEAR, Reveal } from "./Reveal";
import "./Footer.css";

export function Footer() {
  const bp = useBreakpoint();
  const phone = bp === "phone";

  return (
    <footer id="contact" className={`footer footer--${bp}`}>
      <div className="footer__container bordered">
        <div className="footer__content">
          {/* Top left glow with its star dust */}
          <motion.div
            className="footer__shade"
            style={{ rotate: phone ? 30 : 20 }}
            initial={phone ? false : { opacity: 0, x: -276, y: -190 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0 }}
            transition={{ duration: 0.8, ease: LINEAR }}
          >
            <motion.div
              className="footer__particles"
              style={{ rotate: phone ? 15 : 5 }}
              initial={phone ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: LINEAR }}
            >
              <Particles />
            </motion.div>
            <img
              className="footer__glow"
              src={phone ? "/images/glow-footer-phone.svg" : "/images/glow-wide.svg"}
              alt=""
            />
          </motion.div>

          <Reveal
            className="footer__top"
            from={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5, ease: EASE }}
            disabled={phone}
          >
            <div className="footer__title-box">
              <h2 className="t-h2 footer__title">{FOOTER.title}</h2>
              <p className="t-body ta-center footer__text">{FOOTER.text}</p>
            </div>
            <div className="footer__email">
              {phone ? <CopyButton email="Begdouriziad@gmail.com" phone /> : <CopyButton email={EMAIL} />}
            </div>
          </Reveal>

          <div className="footer__bottom">
            <div className="footer__links">
              {NAV_LINKS.map((l) => (
                <Reveal key={l.label} from={{ opacity: 0, y: 20 }} transition={{ duration: 0.5, ease: EASE }} disabled={phone}>
                  <FooterNavButton label={l.label} href={l.href} />
                </Reveal>
              ))}
            </div>
            <div className="footer__nav-copyright">
              <div className="footer__menu">
                <div className="footer__line" />
                <div className="footer__socials">
                  <SocialButton href={FOOTER.github} icon="/images/social-github.svg" label="Github" />
                  <SocialButton href={FOOTER.linkedin} icon="/images/social-linkedin.svg" label="Linkedin" />
                </div>
                <div className="footer__line" />
              </div>
              <Reveal
                as="p"
                className="t-small ta-center footer__copyright"
                from={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, ease: EASE }}
                disabled={phone}
              >
                <a className="footer__copyright-link" href={FOOTER.copyrightHref}>
                  {FOOTER.copyright}
                </a>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
