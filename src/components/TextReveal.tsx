import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

/**
 * The site's "TextReveal" code override, unchanged: every character starts at 0.1
 * opacity and lights up one after the other while the block scrolls from 70 % to
 * 40 % of the viewport (scrubbed).
 */
export function TextReveal({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const splits: SplitType[] = [];
    const characters: HTMLElement[] = [];
    el.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6, p").forEach((sentence) => {
      const split = new SplitType(sentence, { types: "chars" });
      splits.push(split);
      characters.push(...(split.chars ?? []));
    });

    gsap.set(characters, { opacity: 0.1 });
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: "top 70%", end: "bottom 40%", scrub: true },
    });
    characters.forEach((char) => {
      tl.to(char, { opacity: 1, duration: 2, ease: "ease-in-out" });
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      splits.forEach((s) => s.revert());
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
