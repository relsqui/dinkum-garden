import { useState, type MouseEvent } from "react";
import { PlotState, type StateString } from "./plot";

export function ButtonPane({
  harvest,
  handleIterate,
  handleClear,
}: {
  harvest: number;
  handleIterate: (event: MouseEvent, days?: number) => void;
  handleClear: (event: MouseEvent, state?: StateString) => void;
}) {
  const [days, setDays] = useState(1);
  return (
    <div className="sidebar buttonBar">
      <div>Harvest: {harvest}</div>
      <div>
        <button onClick={(e) => handleIterate(e, days)}>Iterate</button>
        <select
          name="days"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          {[...Array(56).keys()].map((n) => {
            n++; // 1-based instead of 0-based
            return <option value={n}>{n}</option>;
          })}
        </select>{" "}
        days
      </div>
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
