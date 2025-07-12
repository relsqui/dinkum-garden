import { FieldPlot } from "./Plot";
import { Emoji, coordString, type Plot } from "./plot";
import {
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
    if (plot.icon == Emoji.Water) {
      appendLog("Can't plant over the sprinkler.");
      return;
    }
    const newField = [...field];
    if ([Emoji.Sprout, Emoji.Pumpkin].includes(plot.icon)) {
      appendLog(`Removing ${plot.icon} at ${coordString(plot)}.`);
      removePlot(newField, plot.i);
    } else if (plot.icon == Emoji.Empty) {
      newField[plot.i] = { ...plot };
      newField[plot.i].icon = Emoji.Sprout;
      appendLog(`Adding ${newField[plot.i].icon} at ${coordString(plot)}.`);
    }
    setField(newField);
  }

  function handleIterate(e: React.MouseEvent) {
    e.stopPropagation();
    appendLog("Iterating ...");
    setField(iterate(field, appendLog));
  }

  function handleIterateUntilFull(e: React.MouseEvent) {
    e.stopPropagation();
    appendLog("Iterating until fully grown ...");
    let t;
    let testField = field;
    for (t = 0; t < 1000; t++) {
      testField = iterate(testField, appendLog);
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

  function handleClear(e: React.MouseEvent, icon?: string) {
    e.stopPropagation();
    if (typeof icon === "undefined") {
      clearLog();
    } else {
      const nextField = [...field];
      for (const plot of field.filter((plot) => plot.icon == icon)) {
        removePlot(nextField, plot.i);
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
            {fullyGrown(field) ? Emoji.Star : ""}
          </div>
          {[Emoji.Pumpkin, Emoji.Sprout].map((emoji) => (
            <button
              onClick={(e) => {
                handleClear(e, emoji);
              }}
              key={emoji}
            >
              Clear {emoji}
            </button>
          ))}
          <button onClick={handleClear}>Clear log</button>
        </div>
      </div>
    </>
  );
}
