import { FieldPlot } from "./Plot";
import { PlotState, type StateString, type Plot } from "./plot";
import {
  addPlot,
  fullyGrown,
  getEmptyField,
  iterate,
  removePlot,
  scoreField,
} from "./field";
import { useState } from "react";

export interface fieldProps {
  appendLog: (message: string) => void;
  clearLog: () => void;
}

export function Field({ appendLog, clearLog }: fieldProps) {
  const [field, setField] = useState(getEmptyField);

  function handlePlotClick(e: React.MouseEvent, plot: Plot) {
    e.stopPropagation();
    let nextField;
    if (plot.state == PlotState.Water) {
      appendLog("Can't plant over the sprinkler.");
    } else if (plot.state == PlotState.Empty) {
      appendLog(`Adding ${PlotState.Sprout} at ${String(plot.i)}.`);
      nextField = addPlot(field, plot.i, PlotState.Sprout);
    } else if (([PlotState.Sprout, PlotState.Pumpkin] as StateString[]).includes(plot.state)) {
      appendLog(`Removing ${plot.state} at ${String(plot.i)}.`);
      nextField = removePlot(field, plot.i);
    }
    if (nextField) {
      setField(nextField);
    }
  }

  function handleIterate(e: React.MouseEvent) {
    e.stopPropagation();
    appendLog("Iterating ...");
    const [nextField, logMessages] = iterate(field);
    logMessages.map(appendLog);
    setField(nextField);
  }

  function handleIterateUntilFull(e: React.MouseEvent) {
    e.stopPropagation();
    appendLog("Iterating until fully grown ...");
    let t;
    let testField = field;
    let logMessages;
    for (t = 0; t < 1000; t++) {
      [testField, logMessages] = iterate(testField);
      logMessages.map(appendLog);
      if (fullyGrown(testField)) {
        break;
      }
    }
    setField(testField);
    if (t == 1000) {
      appendLog("Timed out after 1000 steps.");
    } else {
      appendLog(`Done growing after ${String(t)} steps.`);
      appendLog(`Score: ${scoreField(testField).summary}.`);
    }
  }

  function handleClear(e: React.MouseEvent, state?: StateString) {
    e.stopPropagation();
    if (typeof state === "undefined") {
      clearLog();
    } else {
      let nextField = field;
      for (const plot of field.filter((plot) => plot.state == state)) {
        nextField = removePlot(nextField, plot.i);
      }
      setField(nextField);
    }
  }

  return (
    <>
      <div className="fieldContainer">
        <div className="field">
          {field.map((plot) => (
            <FieldPlot
              onClick={handlePlotClick}
              plot={plot}
              key={plot.i}
              debug={false}
            />
          ))}
        </div>
        <div className="buttonBar">
          <div>
            <button onClick={handleIterate}>Iterate</button>
            <button onClick={handleIterateUntilFull}>Until fully grown</button>
            {fullyGrown(field) ? PlotState.Star : ""}
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
    </>
  );
}
