import { FieldPlot } from "./Plot";
import { PlotState, type StateString, type Plot } from "./plot";
import {
  addPlot,
  fullyGrown,
  getEmptyField,
  iterate,
  iterateUntil,
  removePlot,
  scoreField,
} from "./field";
import { useState } from "react";

export function Field({
  appendLog,
  clearLog,
}: {
  appendLog: (message: string) => void;
  clearLog: () => void;
}) {
  const [field, setField] = useState(getEmptyField);

  function handlePlotClick(e: React.MouseEvent, plot: Plot) {
    e.stopPropagation();
    let nextField;
    if (plot.state == PlotState.Water) {
      appendLog("Can't plant over the sprinkler.");
    } else if (plot.state == PlotState.Empty) {
      appendLog(`Adding ${PlotState.Sprout} at ${String(plot.i)}.`);
      nextField = addPlot(field, plot.i, PlotState.Sprout);
    } else if (
      ([PlotState.Sprout, PlotState.Pumpkin] as StateString[]).includes(
        plot.state
      )
    ) {
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

  function handleIterateUntilGrown(e: React.MouseEvent) {
    e.stopPropagation();
    appendLog("Iterating until fully grown ...");
    const [nextField, logMessages, steps] = iterateUntil(field, fullyGrown);
    if (steps == 1000) {
      logMessages.push("Timed out after 1000 steps.");
    } else {
      logMessages.push(`Done growing after ${String(steps)} steps.`);
      logMessages.push(`Score: ${scoreField(nextField).summary}.`);
    }
    logMessages.map(appendLog);
    setField(nextField);
  }

  function handleClear(e: React.MouseEvent, state: StateString | null = null) {
    e.stopPropagation();
    if (state === null) {
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
            <button onClick={handleIterateUntilGrown}>Until fully grown</button>
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
