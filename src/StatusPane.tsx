import type { MouseEvent, MouseEventHandler } from "react";
import { PlotState, type StateString } from "./plot";

export type statusPaneProps = {
  harvest: number;
  handleIterate: MouseEventHandler<HTMLButtonElement>;
  handleIterateUntilGrown: MouseEventHandler<HTMLButtonElement>;
  handleClear: (event: MouseEvent, state?: StateString) => void;
};

export function StatusPane({
  harvest,
  handleIterate,
  handleIterateUntilGrown,
  handleClear,
}: statusPaneProps) {
  return (
    <div className="sidebar">
      <div>Harvest: {harvest}</div>
      <div className="buttonBar">
        <div>
          <button onClick={handleIterate}>Iterate</button>
          <button onClick={handleIterateUntilGrown}>Until fully grown</button>
        </div>
        {[PlotState.Pumpkin, PlotState.Sprout].map((state) => (
          <button
            onClick={(e) => {
              handleClear(e, state);
            }}
            key={state}
          >
            Clear {state}
          </button>
        ))}
        <button onClick={handleClear}>Clear log</button>
      </div>
    </div>
  );
}
