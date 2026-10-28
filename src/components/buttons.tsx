import { motion } from "motion/react";
import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import { EASE } from "./Reveal";
import "./buttons.css";

const CLEAR = (c: string) => `linear-gradient(232deg, ${c} 0%, ${c} 50%, ${c} 100%)`;
const HOT = "linear-gradient(232deg, rgba(170, 19, 31, 1) 17%, rgba(218, 91, 40, 1) 38%, rgba(0, 0, 0, 0.04) 42%)";

/**
 * Shared shape of the Framer pill buttons: a gradient "rim" with an inner fill inset by 1 px.
 * On hover the rim turns into the red/orange gradient and the fill darkens.
 */
function Pill({
  href,
  className,
  rim,
  fill,
  hoverFill,
  radius,
  duration,
  newTab,
  onClick,
  style,
  children,
}: {
  href?: string;
  className: string;
  rim: string;
  fill: string;
  hoverFill: string;
  radius: number | string;
  duration: number;
  newTab?: boolean;
  onClick?: MouseEventHandler;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const transition = { duration, ease: EASE };
  return (
    <motion.a
      href={href}
      className={`pill ${className}`}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener" : undefined}
      onClick={onClick}
      style={{ borderRadius: radius, backgroundImage: CLEAR(rim), backgroundColor: rim, ...style }}
      initial={false}
      whileHover="hover"
      variants={{ hover: { backgroundImage: HOT, backgroundColor: "rgba(0, 0, 0, 0)" } }}
      transition={transition}
    >
      <motion.span
        className="pill__bg"
        style={{ borderRadius: radius, backgroundColor: fill }}
        variants={{ hover: { backgroundColor: hoverFill } }}
        transition={transition}
      />
      {children}
    </motion.a>
  );
}

/** "Header nav btn": the grey pills of the top navigation. */
export function HeaderNavButton({ label, href, onClick }: { label: string; href: string; onClick?: () => void }) {
  return (
    <Pill
      href={href}
      onClick={onClick}
      className="nav-btn"
      rim="rgba(56, 56, 56, 0)"
      fill="#393939"
      hoverFill="#0b0b0b"
      radius={120}
      duration={0.4}
    >
      <span className="pill__text t-small c-primary">{label}</span>
    </Pill>
  );
}

/** "Footer nav btn": the smaller pills under the footer call to action. */
export function FooterNavButton({ label, href }: { label: string; href: string }) {
  return (
    <Pill
      href={href}
      className="footer-btn bordered"
      rim="rgba(255, 255, 255, 0)"
      fill="#393939"
      hoverFill="#0b0b0b"
      radius={72}
      duration={0.4}
      newTab
    >
      <span className="pill__text t-small c-primary">{label}</span>
    </Pill>
  );
}

/** "Button secondary": the round ↗ button under "Get in touch". */
export function ButtonSecondary({ href }: { href: string }) {
  return (
    <Pill
      href={href}
      className="btn-secondary"
      rim="rgba(56, 56, 56, 0.05)"
      fill="#0b0b0b"
      hoverFill="#0b0b0b"
      radius={120}
      duration={0.4}
    >
      <svg className="btn-secondary__icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M1 13 13 1m0 0H3.25M13 1v9.75" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Pill>
  );
}

/** "Social Media": the round icon links in the footer. */
export function SocialButton({ href, icon, label }: { href: string; icon: string; label: string }) {
  const transition = { duration: 0.4, ease: EASE };
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label={label}
      className="pill social-btn"
      style={{
        borderRadius: "50%",
        backgroundImage: CLEAR("rgba(255, 255, 255, 0.05)"),
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(44px)",
        WebkitBackdropFilter: "blur(44px)",
      }}
      initial={false}
      whileHover="hover"
      variants={{ hover: { backgroundImage: HOT, backgroundColor: "rgba(0, 0, 0, 0)" } }}
      transition={transition}
    >
      <span className="pill__bg" style={{ borderRadius: "100%", backgroundColor: "#0b0b0b" }} />
      <motion.img
        className="social-btn__icon"
        src={icon}
        alt={label}
        style={{ opacity: 0.5 }}
        variants={{ hover: { opacity: 1 } }}
        transition={transition}
      />
    </motion.a>
  );
}

/** "Button primary": the white pill ("Get in touch", "Back to home"). No hover change on the site. */
export function ButtonPrimary({ label, href, onClick }: { label: string; href: string; onClick?: () => void }) {
  return (
    <a href={href} onClick={onClick} className="btn-primary">
      <span className="t-body-lg c-black">{label}</span>
    </a>
  );
}
