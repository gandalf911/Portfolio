import { HERO } from "./copy";
import { Stats } from "./Stats";

export function Hero() {
  return (
    <section className="hero">
      <span className="eyebrow">
        <i aria-hidden />
        {HERO.eyebrow}
      </span>
      <h1 className="serif">{HERO.title}</h1>
      <p className="lede">
        {HERO.lede.map((p, i) => (p.strong ? <b key={i}>{p.text}</b> : <span key={i}>{p.text}</span>))}
      </p>
      <Stats items={HERO.stats} />
    </section>
  );
}
