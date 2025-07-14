import { type MouseEvent } from "react";
import { PlotState, type StateString } from "./plot";
import type { SettingKey, Settings, SettingWithType } from "./settings";

function SettingCheckbox({
  label,
  description,
  settings,
  updateSetting,
}: {
  label: SettingWithType<boolean>;
  description: string;
  settings: Settings;
  updateSetting: (setting: SettingKey, value: boolean) => void;
}) {
  return (
    <>
      <input
        type="checkbox"
        name={label}
        id={label}
        defaultChecked={settings[label]}
        value={String(settings[label])}
        onChange={(e) => {
          updateSetting(label, e.target.checked);
        }}
      />
      <label htmlFor={label}>{description}</label>
    </>
  );
}

export function ButtonPane({
  settings,
  updateSetting,
  day,
  harvests,
  handleIterate,
  handleReset,
}: {
  settings: Settings;
  updateSetting: <K extends SettingKey>(setting: K, value: Settings[K]) => void;
  day: number;
  harvests: number;
  handleIterate: (event: MouseEvent, days?: number) => void;
  handleReset: (event: MouseEvent, state?: StateString) => void;
}) {
  const checkboxes: [SettingWithType<boolean>, string][] = [
    ["autoHarvest", `Harvest full-grown ${PlotState.Pumpkin}`],
    ["wrapWE", "Wrap field left-to-right"],
    ["wrapNS", "Wrap field up-to-down"],
  ];
  return (
    <div className="sidebar buttonPane">
      <div className="stats">
        <div>Day: {day}</div>
        <div>Harvests: {harvests} {PlotState.Pumpkin}</div>
      </div>
      <div>
        <div>
          <button
            onClick={(e) => {
              handleIterate(e, settings.iterationDays);
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
            value={settings.iterationDays}
            onChange={(e) => {
              updateSetting("iterationDays", Number(e.target.value));
            }}
          />{" "}
          days
        </div>
        {checkboxes.map(([label, description]) => {
          return (
            <div key={label}>
              <SettingCheckbox
                {...{ label, description, settings, updateSetting }}
              />
            </div>
          );
        })}
      </div>
      <div>
        <button
          onClick={(e) => {
            // setIterationDays(1);
            handleReset(e);
          }}
        >
          Reset
        </button>
        {import.meta.env.MODE == "development" ? (
          <SettingCheckbox
            {...{
              label: "debug",
              description: "Debug view",
              settings,
              updateSetting,
            }}
          />
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
