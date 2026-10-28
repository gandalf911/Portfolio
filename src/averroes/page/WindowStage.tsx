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
    </section>
  );
}
