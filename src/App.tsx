import { useState } from "react";
import { Field } from "./Field";
import { Log } from "./Log";
import { ButtonPane } from "./ButtonPane";
import { appendLog, type LogLine } from "./log";
import { getEmptyField, harvestAll, iterate, togglePlot } from "./field";
import {
  canHarvest,
  copyPlot,
  getEmptyPlot,
  PlotState,
  type Plot,
} from "./plot";

function App() {
  const [field, setField] = useState(getEmptyField);
  const [harvests, setHarvests] = useState(0);
  const [day, setDay] = useState(1);
  const [logContents, setLogContents] = useState<LogLine[]>([]);

  function log(message: string) {
    // The setter needs to be a function so it handles multiple
    // messages in one render properly.
    setLogContents((prevLogContents) => appendLog(message, prevLogContents));
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
      [nextField, newGrowth] = iterate(nextField);
      [nextField, newHarvests] = harvestAll(nextField);
      const logParts = [];
      if (newGrowth) logParts.push(`grew ${newGrowth}`);
      if (newHarvests) {
        logParts.push(`harvested ${newHarvests}`);
        nextHarvests += newHarvests;
      }
      if (logParts.length) {
        let summary = logParts.join(", ");
        summary = summary[0].toUpperCase() + summary.slice(1);
        logMessages.push(`Day ${day + d}: ${summary} ${PlotState.Pumpkin}.`);
      }
    }
    logMessages.map(log);
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
      if ([PlotState.Pumpkin, PlotState.Melon].includes(plot.state)) {
        doubleReset = false;
        return getEmptyPlot(plot.x, plot.y);
      }
      const nextPlot = copyPlot(plot);
      if (plot.state == PlotState.Sprout && plot.age > 1) {
        doubleReset = false;
        nextPlot.age = 1;
      }
      return nextPlot;
    });
    if (doubleReset) {
      setField(getEmptyField);
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
    logMessages.map((message) => log(`Day ${day}: ${message}`));
    setField(nextField);
  }

  return (
    <>
      <ButtonPane
        {...{
          day: day,
          harvests,
          handleIterate,
          handleReset,
        }}
      />
      <Field field={field} handlePlotClick={handlePlotClick} />
      <Log logContents={logContents} />
    </>
  );
}

export default App;
