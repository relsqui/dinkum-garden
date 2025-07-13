import type { MouseEvent, MouseEventHandler } from "react";
import { PlotState, type StateString } from "./plot";

export interface statusPaneProps {
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
    <div className="sidebar buttonBar">
      <div>Harvest: {harvest}</div>
      <button onClick={handleIterate}>Iterate</button>
      <button onClick={handleIterateUntilGrown}>Until fully grown</button>
      <div>
        <button
          onClick={(e) => {
            handleClear(e, PlotState.Pumpkin);
          }}
        >
          Clear {PlotState.Pumpkin}
        </button>
        <button onClick={handleClear}>Reset</button>
      </div>
    </div>
  );
}
