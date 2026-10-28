import { motion } from "motion/react";
import { pick, useBreakpoint } from "../lib/breakpoint";
import { ABOUT, ACHIEVEMENTS, EMAIL, FAQS, HERO_TITLE, PROJECTS, SERVICES, STACK_ROW_1, STACK_ROW_2, STATS, type Logo } from "../content";
import { ButtonSecondary } from "../components/buttons";
import { FaqList } from "../components/Faq";
import { LiquidMetal } from "../components/LiquidMetal";
import { Particles } from "../components/Particles";
import { ProgressBox } from "../components/ProgressBox";
import { ProjectCard } from "../components/ProjectCard";
import { EASE, LINEAR } from "../components/Reveal";
import { ServiceStack } from "../components/ServiceStack";
import { Slideshow } from "../components/Slideshow";
import { SmoothScroll } from "../components/SmoothScroll";
import { TextReveal } from "../components/TextReveal";
import { Ticker } from "../components/Ticker";
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

function StackLogo({ logo }: { logo: Logo }) {
  return (
    <div className="stack-logo" style={{ width: logo.w, height: logo.h, borderRadius: logo.radius ?? 10 }}>
      {logo.liquidMetal ? (
        <LiquidMetal dispersion={0.015} edge={0.4} liquify={0.07} patternBlur={0.005} patternScale={2} speed={0.3} />
      ) : (
        <img src={logo.src} alt={logo.name} draggable={false} />
      )}
    </div>
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
            <WordAppear text={HERO_TITLE} className={`t-h1${phone ? " ta-center" : ""}`} disabled={phone} />
          </div>
          <motion.div
            className="hero__image-wrap"
            initial={phone ? false : { opacity: 0.001, rotateX: -20, rotateY: 20 }}
            animate={{ opacity: 1, rotateX: 0, rotateY: 0 }}
            transition={{ delay: 0, duration: 0.8, ease: EASE }}
          >
            <div className="hero__image">
              <img src="/images/portrait.png" alt="" />
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
              <Slideshow
                startFrom={1}
                gap={50}
                interval={2}
                drag={phone}
                perspective={phone ? 200 : 2000}
                effectsOpacity={0.25}
                effectsScale={0.5}
                effectsRotate={35}
              >
                {PROJECTS.map((p) => (
                  <ProjectCard key={p.title} project={p} />
                ))}
              </Slideshow>
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
        <Ticker className="stack__row">
          {STACK_ROW_1.map((l) => (
            <StackLogo key={l.name} logo={l} />
          ))}
        </Ticker>
        <Ticker className="stack__row" reverse>
          {STACK_ROW_2.map((l) => (
            <StackLogo key={l.name} logo={l} />
          ))}
        </Ticker>
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
