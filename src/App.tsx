import { useState } from "react";
import { Field } from "./Field";
import { Log } from "./Log";
import { ButtonPane } from "./ButtonPane";
import { appendLog, type LogLine } from "./log";
import { getEmptyField, iterate, removePlot, togglePlot } from "./field";
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

  function handleIterate(e: React.MouseEvent, days: number = 1) {
    e.stopPropagation();
    log("Iterating ...");
    let nextField = field;
    const logMessages = [];
    let newMessages;
    let d = 0;
    for (; d < days; d++) {
      [nextField, newMessages] = iterate(nextField);
      logMessages.push(...newMessages);
    }
    logMessages.push(`Iterated for ${d} days.`);
    logMessages.map(log);
    setField(nextField);
  }

  function handleClear(e: React.MouseEvent, state: StateString | null = null) {
    e.stopPropagation();
    if (state === null) {
      setLogContents([]);
      setHarvest(0);
      setField(getEmptyField);
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
      <ButtonPane
        {...{
          harvest,
          handleIterate,
          handleClear,
        }}
      />
      <Field field={field} handlePlotClick={handlePlotClick} />
      <Log logContents={logContents} />
    </>
  );
}

export default App;
