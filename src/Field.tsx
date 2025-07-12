import { FieldPlot } from "./Plot";
import { coordString, emptyPlot, type Plot } from "./plot";
import { emptyField } from "./field";
import { useState } from "react";

export interface fieldProps {
  appendLog: (message: string) => void;
  clearLog: () => void;
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
    if (plot.icon == "🌱") {
      appendLog(`Removing ${plot.icon} at ${coordString(plot)}.`);
      plot.children.map((i) => {
        newField[i].stem = null;
      });
      newField[plot.i] = emptyPlot(plot.x, plot.y);
    } else if (plot.icon == "🎃") {
      const stem = plot.stem;
      if (stem !== null) {
        newField[stem].children = field[stem].children.filter(
          (c) => c != plot.i
        );
      }
      newField[plot.i] = emptyPlot(plot.x, plot.y);
    } else {
      newField[plot.i] = { ...plot };
      newField[plot.i].icon = "🌱";
      appendLog(`Adding ${newField[plot.i].icon} at ${coordString(plot)}.`);
    }
    setField(newField);
  }

  function getGrowDestination(testField: Plot[], i: number): number | null {
    const plot = testField[i];
    if (plot.icon != "🌱") {
      return null;
    }
    const growChance =
      plot.children.length == 0 ? 1 : 0.1 / plot.children.length;
    if (Math.random() > growChance) {
      return null;
    }
    const emptyNeighbors = plot.neighbors.filter(
      (j) => testField[j].icon == ""
    );
    if (emptyNeighbors.length == 0) {
      return null;
    }
    return emptyNeighbors[Math.floor(Math.random() * emptyNeighbors.length)];
  }

  function iterate(prevField: Plot[]) {
    // nextField needs a returnable value even if nothing grows.
    let nextField = prevField;
    for (let i = 0; i < prevField.length; i++) {
      const growInto = getGrowDestination(prevField, i);
      if (growInto === null) {
        continue;
      }
      appendLog(`Growing 🎃 at ${coordString(prevField[i])}.`);
      nextField = prevField.map((prevPlot, j) => {
        const newPlot = { ...prevPlot };
        newPlot.children = [...prevPlot.children];
        newPlot.neighbors = [...prevPlot.neighbors];
        if (j == i) {
          newPlot.children.push(growInto);
        } else if (j == growInto) {
          newPlot.icon = "🎃";
          newPlot.stem = i;
        }
        return newPlot;
      });
      prevField = nextField;
    }
    return nextField;
  }

  function handleIterate(e: React.MouseEvent) {
    e.stopPropagation();
    appendLog("Iterating ...");
    setField(iterate(field));
  }

  function fullyGrown(testField: Plot[]) {
    for (const plot of testField) {
      if (plot.icon == "🌱") {
        for (const n of plot.neighbors) {
          if (testField[n].icon == "") {
            return false;
          }
        }
      }
    }
    return true;
  }

  function handleIterateUntilFull(e: React.MouseEvent) {
    e.stopPropagation();
    appendLog("Iterating until fully grown ...");
    let t;
    let testField = field;
    for (t = 0; t < 1000; t++) {
      // if (t > 0 && t / 100 == Math.floor(t / 100)) {
      //   console.log(`Step ${t} ...`);
      // }
      testField = iterate(testField);
      if (fullyGrown(testField)) {
        break;
      }
    }
    setField(testField);
    if (t == 1000) {
      appendLog("Timed out after 1000 steps.");
    } else {
      appendLog(`Done growing after ${String(t)} steps.`);
    }
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    setField(emptyField());
    clearLog();
  }

  return (
    <>
      {/* <textarea
        cols={60}
        style={{ margin: "0 10px" }}
        defaultValue={JSON.stringify(field, null, 2)}
      ></textarea> */}
      <div className="fieldContainer">
        <div className="field">
          {field.map((plot) => (
            <FieldPlot onClick={handlePlotClick} plot={plot} key={plot.i} />
          ))}
        </div>
        <div className="buttonBar">
          <button onClick={handleIterate}>Iterate</button>
          <button onClick={handleIterateUntilFull}>Until fully grown</button>
          <button onClick={handleClear}>Clear</button>
          {fullyGrown(field) ? "⭐" : ""}
        </div>
      </div>
    </>
  );
}
