import { useState, type MouseEvent } from "react";
import { type StateString } from "./plot";

export function ButtonPane({
  day,
  harvests,
  handleIterate,
  handleReset,
}: {
  day: number;
  harvests: number;
  handleIterate: (event: MouseEvent, days?: number) => void;
  handleReset: (event: MouseEvent, state?: StateString) => void;
}) {
  const [iterationDays, setIterationDays] = useState(1);
  return (
    <div className="sidebar buttonBar">
      <div>Day: {day}</div>
      <div>Harvests: {harvests}</div>
      <div>
        <button
          onClick={(e) => {
            handleIterate(e, iterationDays);
          }}
        >
          Iterate
        </button>
        <input
          name="days"
          type="number"
          size={2}
          min="1"
          max="1000"
          value={iterationDays}
          onChange={(e) => {
            setIterationDays(Number(e.target.value));
          }}
        />{" "}
        days
      </div>
      <div>
        <button
          onClick={(e) => {
            setIterationDays(1);
            handleReset(e);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
