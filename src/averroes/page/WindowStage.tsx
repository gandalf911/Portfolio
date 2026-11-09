import { MoveHorizontal } from "lucide-react";
import { AverroesWindow } from "../window/AverroesWindow";
import { STAGE } from "./copy";

export function WindowStage() {
  return (
    <section className="stage" id="window">
      <p className="hint">
        {STAGE.hintA}
        <b>{STAGE.hintB}</b>
        {STAGE.hintC}
      </p>
      <AverroesWindow />
      <p className="pan-hint">
        <MoveHorizontal size={14} aria-hidden /> Swipe sideways to explore the window
      </p>
    </section>
  );
}
