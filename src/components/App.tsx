import { useEffect, useState } from "react";
import { ButtonPane } from "./ButtonPane";
import { Field } from "./Field";
import {
  fieldFromSearchParams,
  getEmptyField,
  harvestAll,
  iterate,
  togglePlot,
} from "../lib/field";
import { canHarvest, getEmptyPlot, PlotState, type Plot } from "../lib/plot";
import { Log } from "./Log";
import { appendLog, type LogLine } from "../lib/log";
import {
  defaultSettings,
  settingsFromSearchParams,
  type SettingKey,
  type Settings,
} from "../lib/settings";
import { stateToSearchParams } from "../lib/app";

function App() {
  const [settings, setSettings] = useState(settingsFromSearchParams);
  const [field, setField] = useState(fieldFromSearchParams);
  const [harvests, setHarvests] = useState(0);
  const [day, setDay] = useState(1);
  const [logContents, setLogContents] = useState<LogLine[]>([]);

  useEffect(() => {
    const stateParams = stateToSearchParams(field, settings);
    if (window.location.search != stateParams) {
      const newLocation =
        stateParams.length > 0 ? `?${stateParams}` : window.location.pathname;
      window.history.replaceState(null, "", newLocation);
    }
  }, [field, settings]);

  function log(message: string) {
    // The setter needs to be a function so it handles multiple
    // messages in one render properly.
    setLogContents((prevLogContents) => appendLog(message, prevLogContents));
  }

  // Shoutout to https://typeofnan.dev/how-to-make-one-function-argument-dependent-on-another-in-typescript/
  function updateSetting<K extends SettingKey>(setting: K, value: Settings[K]) {
    setSettings({ ...settings, [setting]: value });
  }

  function handleIterate(e: React.MouseEvent, iterationDays = 1) {
    e.stopPropagation();
    let nextField = field;
    let nextHarvests = harvests;
    const logMessages = [];
    let newGrowth;
    let newHarvests;
    let d = 1;
    for (; d <= iterationDays; d++) {
      [nextField, newGrowth] = iterate(nextField, settings);
      if (settings.autoHarvest) {
        [nextField, newHarvests] = harvestAll(nextField);
      }
      const logParts = [];
      if (newGrowth) logParts.push(`grew ${String(newGrowth)}`);
      if (newHarvests) {
        logParts.push(`harvested ${String(newHarvests)}`);
        nextHarvests += newHarvests;
      }
      if (logParts.length) {
        let summary = logParts.join(", ");
        summary = summary[0].toUpperCase() + summary.slice(1);
        logMessages.push(
          `Day ${String(day + d)}: ${summary} ${PlotState.Pumpkin}.`
        );
      }
    }
    logMessages.forEach(log);
    setField(nextField);
    setHarvests(nextHarvests);
    setDay(day + iterationDays);
  }

  function handleReset(e: React.MouseEvent) {
    e.stopPropagation();
    setLogContents([]);
    setHarvests(0);
    setDay(1);
    // If the field was already reset to newly-planted sprouts,
    // resetting again removes those sprouts.
    let doubleReset = true;
    const nextField = field.map((plot) => {
      const nextPlot = getEmptyPlot(plot.x, plot.y);
      if ([PlotState.Pumpkin, PlotState.Melon].includes(plot.state)) {
        doubleReset = false;
        nextPlot.state = PlotState.Empty;
      } else {
        if (plot.state == PlotState.Sprout) {
          if (plot.age > 1) {
            doubleReset = false;
          }
          nextPlot.age = 1;
        }
        nextPlot.state = plot.state;
      }
      return nextPlot;
    });
    // Uhhh typescript-eslint you're just wrong about this one.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (doubleReset) {
      setField(getEmptyField);
      setSettings(defaultSettings);
    } else {
      setField(nextField);
    }
  }

  function handlePlotClick(e: React.MouseEvent, plot: Plot) {
    e.stopPropagation();
    const [nextField, logMessages] = togglePlot(plot, field);
    if (canHarvest(plot)) {
      setHarvests(harvests + 1);
    }
    logMessages.forEach((message) => {
      log(`Day ${String(day)}: ${message}`);
    });
    setField(nextField);
  }

  return (
    <>
      <div id="app">
        <ButtonPane
          settings={settings}
          updateSetting={updateSetting}
          day={day}
          harvests={harvests}
          handleIterate={handleIterate}
          handleReset={handleReset}
        />
        <Field {...{ field, settings, handlePlotClick }} />
        <Log logContents={logContents} />
      </div>
      <div className="debug">
        {/* <p>{JSON.stringify(stateToSearchParams(field, settings))}</p>
        <p>{window.location.search}</p> */}
      </div>
    </>
  );
}

export default App;
