import { useState } from "react";
import { Field } from "./Field";
import { Log } from "./Log";
import { StatusPane } from "./StatusPane";
import { appendLog, type LogLine } from "./log";
import {
  fullyGrown,
  getEmptyField,
  iterate,
  iterateUntil,
  removePlot,
  togglePlot,
} from "./field";
import { isHarvestable, type Plot, type StateString } from "./plot";

function App() {
  const [field, setField] = useState(getEmptyField);
  const [harvest, setHarvest] = useState(0);
  const [logContents, setLogContents] = useState<LogLine[]>([]);

  function log(message: string) {
    // The setter needs to be a function so it handles multiple
    // messages in one render properly.
    setLogContents((prevLogContents) => appendLog(message, prevLogContents));
  }

  function handleIterate(e: React.MouseEvent) {
    e.stopPropagation();
    log("Iterating ...");
    const [nextField, logMessages] = iterate(field);
    logMessages.map(log);
    setField(nextField);
  }

  function handleIterateUntilGrown(e: React.MouseEvent) {
    e.stopPropagation();
    log("Iterating until fully grown ...");
    const [nextField, logMessages, steps] = iterateUntil(field, fullyGrown);
    if (steps == 1000) {
      logMessages.push("Timed out after 1000 steps.");
    } else {
      logMessages.push(`Done growing after ${String(steps)} steps.`);
    }
    logMessages.map(log);
    setField(nextField);
  }

  function handleClear(e: React.MouseEvent, state: StateString | null = null) {
    e.stopPropagation();
    if (state === null) {
      setLogContents([]);
    } else {
      let nextField = field;
      for (const plot of field.filter((plot) => plot.state == state)) {
        nextField = removePlot(nextField, plot.i);
      }
      setField(nextField);
    }
  }

  function handlePlotClick(e: React.MouseEvent, plot: Plot) {
    e.stopPropagation();
    const [nextField, logMessages] = togglePlot(plot, field);
    if (isHarvestable(plot)) {
      setHarvest(harvest + 1);
    }
    logMessages.map(log);
    setField(nextField);
  }

  return (
    <>
      <StatusPane
        {...{
          harvest,
          handleIterate,
          handleIterateUntilGrown,
          handleClear,
        }}
      />
      <Field field={field} handlePlotClick={handlePlotClick} />
      <Log logContents={logContents} />
    </>
  );
}

export default App;
