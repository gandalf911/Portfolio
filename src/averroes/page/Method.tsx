import { Bot, Database, Layers, Rocket, Split, Users, type LucideIcon } from "lucide-react";
import { METHOD } from "./copy";
import { useInView } from "./useInView";

const ICONS: LucideIcon[] = [Users, Database, Split, Layers, Bot, Rocket];

/** La méthode en six étapes ; l'IA n'arrive qu'à la cinquième, et c'est voulu. */
export function Method() {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);
  return (
    <section className="section" id="craft">
      <h2 className="section-title serif">{METHOD.title}</h2>
      <p className="section-sub">{METHOD.sub}</p>
      <div ref={ref} className="steps" data-on={inView || undefined}>
        <div className="steps-rail" aria-hidden>
          <i />
        </div>
        {METHOD.steps.map((s, i) => {
          const Icon = ICONS[i];
          return (
            <article key={s.title} className="step" data-ai={i === 4 || undefined} style={{ transitionDelay: `${i * 110}ms` }}>
              <div className="step-top">
                <span className="step-n serif">{String(i + 1).padStart(2, "0")}</span>
                <span className="step-icon">
                  <Icon size={18} aria-hidden />
                </span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              {i === 4 && <span className="step-chip">AI enters here</span>}
            </article>
          );
        })}
      </div>
    </section>
  );
}
