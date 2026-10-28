import { motion } from "motion/react";
import { pick, useBreakpoint } from "../lib/breakpoint";
import { ButtonPrimary } from "../components/buttons";
import { Particles } from "../components/Particles";
import { EASE, Reveal } from "../components/Reveal";
import { SmoothScroll } from "../components/SmoothScroll";
import "./Home.css";
import "./NotFound.css";

export function NotFound() {
  const bp = useBreakpoint();
  const rotate = bp === "desktop" ? -23 : -34;

  return (
    <div className="not-found">
      <SmoothScroll intensity={10} />
      <div className="not-found__hero">
        <motion.div
          className="shade not-found__shade"
          style={{ rotate }}
          initial={{ opacity: 0.001, rotate: -35, x: 318, y: -192 }}
          animate={{ opacity: 1, rotate, x: 0, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: EASE }}
        >
          <div
            className="shade__particles hero__particles-right not-found__particles"
            style={{ rotate: `${bp === "phone" ? 3 : -11}deg` }}
          >
            <Particles />
          </div>
          <img className="shade__glow" src="/images/glow-narrow.svg" alt="" />
        </motion.div>

        <Reveal className="not-found__container" from={{ opacity: 0, y: 50 }} transition={{ duration: 0.8, ease: EASE }}>
          <div className="not-found__content">
            <div className="not-found__top">
              <div className="not-found__title-box">
                <p className="t-body ta-center c-primary not-found__eyebrow">Opps something went  wrong</p>
                <p className="not-found__code" style={{ fontSize: pick(bp, { desktop: 310, tablet: 250, phone: 150 }) }}>
                  404
                </p>
              </div>
              <p className="t-body ta-center not-found__text">
                Looks like we are missing some page, or you typed something wrong in the URL, heres a way to get back.
              </p>
            </div>
            <div className="not-found__button">
              <ButtonPrimary label="Back to home" href="/" />
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
