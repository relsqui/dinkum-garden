import { FieldPlot } from "./Plot";
import { coordString, emptyPlot, type Plot } from "./plot";
import { emptyField } from "./field";
import { useState } from "react";

export interface fieldProps {
  appendLog: (message: string) => void;
  clearLog: () => void;
}

function getGrowDestination(plot: Plot, field: Plot[]): Plot | null {
  if (plot.icon != "🌱") {
    return null;
  }
  const growChance = plot.children.length == 0 ? 1 : 0.1 / plot.children.length;
  if (Math.random() > growChance) {
    return null;
  }
  const emptyNeighbors = [
    plot.x > 0 ? field[plot.i - 1] : null,
    plot.x < 4 ? field[plot.i + 1] : null,
    plot.y > 0 ? field[plot.i - 5] : null,
    plot.y < 4 ? field[plot.i + 5] : null,
  ].filter((n) => n?.icon == "") as Plot[];
  if (emptyNeighbors.length == 0) {
    return null;
  }
  return emptyNeighbors[Math.floor(Math.random() * emptyNeighbors.length)];
}

export function Field({ appendLog, clearLog }: fieldProps) {
  const [field, setField] = useState(emptyField);
  function handlePlotClick(e: React.MouseEvent, plot: Plot) {
    e.stopPropagation();
    if (plot.icon == "💧") {
      appendLog("Can't plant over the sprinkler.");
      return;
    }
    const newField = [...field];
    if (plot.icon) {
      appendLog(`Removing ${plot.icon} at ${coordString(plot)}.`);
      plot.children.map((i) => {
        newField[i].stem = null;
      });
      newField[plot.i] = emptyPlot(plot.x, plot.y);
    } else {
      newField[plot.i] = { ...plot };
      newField[plot.i].icon = "🌱";
      appendLog(`Adding ${newField[plot.i].icon} at ${coordString(plot)}.`);
    }
    setField(newField);
  }

  function handleIterate(e: React.MouseEvent) {
    e.stopPropagation();
    appendLog("Iterating ...");
    for (let i = 0; i < field.length; i++) {
      const growInto = getGrowDestination(field[i], field);
      if (growInto === null) {
        continue;
      }
      const plot = field[i];
      appendLog(`Growing 🎃 at ${coordString(plot)}.`);
      setField((field) =>
        field.map((prevPlot, i) => {
          if (i == plot.i) {
            const newPlot = { ...plot };
            // Unless we re-initialize, children still references the original.
            newPlot.children = [...plot.children, growInto.i];
            return newPlot;
          } else if (i == growInto.i) {
            const newNeighbor = { ...prevPlot };
            newNeighbor.icon = "🎃";
            newNeighbor.stem = plot.i;
            return newNeighbor;
          }
          return prevPlot;
        })
      );
    }
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    setField(emptyField());
    clearLog();
  }

  return (
    <>
      <div className="fieldContainer">
        <div className="field">
          {field.map((plot) => (
            <FieldPlot onClick={handlePlotClick} plot={plot} key={plot.i} />
          ))}
        </div>
        <div className="buttonBar">
          <button onClick={handleIterate}>Iterate</button>
          <button onClick={handleClear}>Clear</button>
        </div>
      </div>
    </>
  );
}
