import { useState, type MouseEvent } from "react";
import { PlotState, type StateString } from "./plot";
import type { SettingName, Settings } from "./settings";

export function ButtonPane({
  settings,
  updateSetting,
  day,
  harvests,
  handleIterate,
  handleReset,
}: {
  settings: Settings;
  updateSetting: (setting: SettingName, value: boolean) => void;
  day: number;
  harvests: number;
  handleIterate: (event: MouseEvent, days?: number) => void;
  handleReset: (event: MouseEvent, state?: StateString) => void;
}) {
  const [iterationDays, setIterationDays] = useState(1);
  return (
    <div className="sidebar buttonBar">
      <div className="stats">
        <div>Day: {day}</div>
        <div>Harvests: {harvests}</div>
      </div>
      <div>
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
        <div className="autoHarvest">
          <input
            type="checkbox"
            name="autoHarvest"
            value={String(settings.autoHarvest)}
            onChange={(e) => {
              updateSetting("autoHarvest", e.target.checked);
            }}
          />{" "}
          Harvest full-grown {PlotState.Pumpkin}
        </div>
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
