import { motion } from "motion/react";
import { pick, useBreakpoint } from "../lib/breakpoint";
import { ABOUT, ACHIEVEMENTS, EMAIL, FAQS, HERO, PROJECTS, SERVICES, STACK, STATS } from "../content";
import { ButtonPrimary, ButtonSecondary } from "../components/buttons";
import { FaqList } from "../components/Faq";
import { Particles } from "../components/Particles";
import { ProgressBox } from "../components/ProgressBox";
import { FlowGallery } from "../components/FlowGallery";
import { EASE, LINEAR } from "../components/Reveal";
import { ServiceStack } from "../components/ServiceStack";
import { SmoothScroll } from "../components/SmoothScroll";
import { StackLogos } from "../components/StackLogos";
import { TextReveal } from "../components/TextReveal";
import { WordAppear } from "../components/WordAppear";
import { Journey } from "./Journey";
import "./Home.css";

/** A glow picture with its star dust, appearing once in view (sections below the hero). */
function SectionShade({
  className,
  rotate,
  from,
  particlesClass,
  particlesRotate,
  glow,
}: {
  className: string;
  rotate: number;
  from: { x: number; y: number };
  particlesClass: string;
  particlesRotate: number;
  glow: string;
}) {
  return (
    <motion.div
      className={`shade ${className}`}
      style={{ rotate }}
      initial={{ opacity: 0, ...from }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration: 0.8, ease: LINEAR }}
    >
      <motion.div
        className={`shade__particles ${particlesClass}`}
        style={{ rotate: particlesRotate }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0 }}
        transition={{ delay: 0.5, duration: 0.8, ease: LINEAR }}
      >
        <Particles />
      </motion.div>
      <img className="shade__glow" src={glow} alt="" />
    </motion.div>
  );
}

export function Home() {
  const bp = useBreakpoint();
  const phone = bp === "phone";
  const tablet = bp === "tablet";

  return (
    <div className="home">
      <SmoothScroll intensity={10} />

      {/* ---------- Hero ---------- */}
      <section className="hero">
        <motion.div
          className="shade hero__shade-left"
          style={{ rotate: 30 }}
          initial={phone ? false : { opacity: 0.001, rotate: 33, x: -257, y: -237 }}
          animate={{ opacity: 1, rotate: 30, x: 0, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8, ease: LINEAR }}
        >
          <motion.div
            className="shade__particles hero__particles-left"
            style={{ rotate: 5 }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0 }}
            transition={{ delay: 1.8, duration: 0.8, ease: LINEAR }}
          >
            <Particles />
          </motion.div>
          <img className="shade__glow" src="/images/glow-wide.svg" alt="" />
        </motion.div>

        <motion.div
          className="shade hero__shade-right"
          style={{ rotate: tablet || phone ? -34 : -23 }}
          initial={phone ? false : { opacity: 0.001, rotate: -35, x: 318, y: -192 }}
          animate={{ opacity: 1, rotate: tablet || phone ? -34 : -23, x: 0, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8, ease: EASE }}
        >
          <motion.div
            className="shade__particles hero__particles-right"
            style={{ rotate: phone ? 3 : -11 }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0 }}
            transition={{ delay: 1.8, duration: 0.8, ease: LINEAR }}
          >
            <Particles />
          </motion.div>
          <img className="shade__glow" src="/images/glow-narrow.svg" alt="" />
        </motion.div>

        <div className="hero__container">
          <div className="hero__title">
            <motion.p
              className="hero__role"
              initial={phone ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <span className="hero__dot" aria-hidden />
              {HERO.role}
            </motion.p>
            <WordAppear text={HERO.title} className="t-h1 hero__headline" disabled={phone} />
            <motion.p
              className="t-body-lg hero__text"
              initial={phone ? false : { opacity: 0, y: 12, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.55, duration: 0.7, ease: EASE }}
            >
              {HERO.text}
            </motion.p>
            <motion.div
              className="hero__actions"
              initial={phone ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7, ease: EASE }}
            >
              <ButtonPrimary label="See my work" href="#projects" />
              <a className="hero__link" href="#contact">
                Get in touch
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M1 13 13 1m0 0H3.25M13 1v9.75" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </motion.div>
            <motion.ul
              className="hero__proof"
              initial={phone ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8, ease: EASE }}
            >
              {HERO.proof.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </motion.ul>
          </div>
          <motion.div
            className="hero__image-wrap"
            initial={phone ? false : { opacity: 0.001, rotateX: -20, rotateY: 20 }}
            animate={{ opacity: 1, rotateX: 0, rotateY: 0 }}
            transition={{ delay: 0, duration: 0.8, ease: EASE }}
          >
            <div className="hero__image">
              <img src="/images/portrait-hero.jpg" alt="Portrait of Ziad Begdouri" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------- Selected Work ---------- */}
      <section className="projects" id="projects">
        {!phone && (
          <SectionShade
            className="projects__shade-left"
            rotate={27}
            from={{ x: -251, y: -224 }}
            particlesClass="projects__particles-left"
            particlesRotate={5}
            glow="/images/glow-wide.svg"
          />
        )}
        {!phone && (
          <SectionShade
            className="projects__shade-right"
            rotate={-16}
            from={{ x: 323, y: -149 }}
            particlesClass="projects__particles-right"
            particlesRotate={-11}
            glow="/images/glow-narrow.svg"
          />
        )}
        <div className="projects__container">
          <div className="projects__content">
            <div className="projects__title">
              <h2 className="t-h2">Selected Work</h2>
            </div>
            <div className="projects__slideshow">
              <FlowGallery projects={PROJECTS} />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- About ---------- */}
      <section className="about" id="about">
        <div className="about__container">
          <div className="about__content">
            <div className="about__top">
              <div className="about__title-box">
                <h3 className="t-h3 about__heading">{ABOUT.title}</h3>
                <TextReveal className="about__lead">
                  <p className="t-lead">{ABOUT.text}</p>
                </TextReveal>
              </div>
              <div className="about__contact">
                <div className="about__title-box">
                  <div className="about__contact-title">
                    <h3 className="t-h3">{ABOUT.contactTitle}</h3>
                    <div className="about__button">
                      <ButtonSecondary href={`mailto:${EMAIL}`} />
                    </div>
                  </div>
                  <TextReveal className="about__lead">
                    <p className="t-lead">{ABOUT.contactText}</p>
                  </TextReveal>
                </div>
              </div>
            </div>
            <div className="about__progress">
              <div className="about__line" />
              <div className="about__boxes">
                {STATS.map((s) => (
                  <ProgressBox
                    key={s.label}
                    end={s.end}
                    suffix={s.suffix}
                    label={s.label}
                    size={pick(bp, { desktop: 72, tablet: 58, phone: 45 })}
                  />
                ))}
              </div>
              <div className="about__line" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- What I Build ---------- */}
      <section className="services" id="services">
        <div className="services__shade-track">
          {!phone && (
            <div className="services__shade">
              <div className="shade__particles services__particles" style={{ rotate: "-51deg" }}>
                <Particles />
              </div>
              <img className="services__glow" src="/images/glow-services.svg" alt="" />
            </div>
          )}
        </div>
        <div className="services__container">
          <div className="services__content">
            <h2 className="t-h2 services__title">What I Build</h2>
            <ServiceStack services={SERVICES} bp={bp} />
          </div>
        </div>
      </section>

      {/* ---------- The Stack ---------- */}
      <div className="stack">
        <h2 className="t-h2 stack__title">The Stack</h2>
        <StackLogos items={STACK} />
      </div>

      {/* ---------- My Journey ---------- */}
      <Journey />

      {/* ---------- FAQ ---------- */}
      <section className="faq" id="faq-s">
        <div className="faq__container">
          <div className="faq__content">
            <h2 className="t-h2 faq__title">Frequently Asked Questions</h2>
            <FaqList items={FAQS} phone={phone} />
          </div>
        </div>
      </section>

      {/* ---------- Achievements ---------- */}
      <section className="achievements" id="testimonials">
        <div className="achievements__container">
          <div className="achievements__content">
            <h2 className="t-h2 achievements__title"> Latest Achievements &amp; Milestones</h2>
            <div className="achievements__grid">
              {ACHIEVEMENTS.map((a) => (
                <div key={a.title} className="achievement bordered">
                  <h3 className="t-h3 achievement__text">{a.value}</h3>
                  <h5 className="t-h5 ta-center achievement__text">{a.title}</h5>
                  <p className="t-body ta-center achievement__text">{a.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
