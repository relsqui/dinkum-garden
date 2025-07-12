import { FieldPlot } from "./Plot";
import { Emoji, coordString, getEmptyPlot, type Plot } from "./plot";
import { getEmptyField, scoreField } from "./field";
import { useState } from "react";

export interface fieldProps {
  appendLog: (message: string) => void;
  clearLog: () => void;
}

export function Field({ appendLog, clearLog }: fieldProps) {
  const [field, setField] = useState(getEmptyField);

  function removePlot(tempField: Plot[], i: number) {
    const plot = tempField[i];
    if (plot.icon == Emoji.Sprout) {
      plot.children.map((i) => {
        tempField[i].stem = null;
      });
    } else if (plot.icon == Emoji.Pumpkin) {
      const stem = plot.stem;
      if (stem !== null) {
        tempField[stem].children = field[stem].children.filter(
          (c) => c != plot.i
        );
      }
    }
    tempField[i] = getEmptyPlot(plot.x, plot.y);
  }

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

  function getGrowDestination(testField: Plot[], i: number): number | null {
    const plot = testField[i];
    if (plot.icon != Emoji.Sprout) {
      return null;
    }
    const growChance =
      plot.children.length == 0 ? 1 : 0.1 / plot.children.length;
    if (Math.random() > growChance) {
      return null;
    }
    const emptyNeighbors = plot.neighbors.filter(
      (j) => testField[j].icon == Emoji.Empty
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
      appendLog(
        `Growing ${Emoji.Pumpkin} at ${String(growInto)} (from ${String(i)}).`
      );
      nextField = prevField.map((prevPlot, j) => {
        const newPlot = { ...prevPlot };
        newPlot.children = [...prevPlot.children];
        newPlot.neighbors = [...prevPlot.neighbors];
        if (j == i) {
          newPlot.children.push(growInto);
        } else if (j == growInto) {
          newPlot.icon = Emoji.Pumpkin;
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
      if (plot.icon == Emoji.Sprout) {
        for (const n of plot.neighbors) {
          if (testField[n].icon == Emoji.Empty) {
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
