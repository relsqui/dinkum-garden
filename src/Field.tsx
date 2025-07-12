import { FieldPlot, emptyPlot, type Plot } from "./Plot";

export function emptyField() {
  const field: Plot[] = [];
  let i = 0;
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      field.push(emptyPlot(x, y));
      i = i + 1;
    }
  }
  field[12].icon = "💧";
  return field;
}

export function Field({
  field,
  setField,
  appendLog,
  clearLog,
}: {
  field: Plot[],
  setField: any,
  appendLog: (message: string) => void;
  clearLog: () => void;
}) {

  function handlePlotClick(e: React.MouseEvent, plot: Plot) {
    e.stopPropagation();
    if (plot.x == plot.y && plot.x == 2) {
      appendLog("Can't plant over the sprinkler.");
      return;
    }
    const newField = [...field];
    if (plot.icon) {
      appendLog(
        `Removing ${plot.icon} at ${String(plot.x)},${String(plot.y)}.`,
      );
      plot.children.map((i) => {
        delete newField[i].stem;
      });
      newField[plot.i] = emptyPlot(plot.x, plot.y);
    } else {
      newField[plot.i] = { ...plot };
      newField[plot.i].icon = "🌱";
      appendLog(
        `Adding ${newField[plot.i].icon} at ${String(plot.x)},${String(plot.y)}.`,
      );
    }
    setField(newField);
  }

  function handleIterate(e: React.MouseEvent) {
    e.stopPropagation();
    appendLog("Iterating ...");
    for (let i = 0; i < field.length; i++) {
      // Update the state for each plot so they can see each other's changes
      // Otherwise, they can both try to grow into a shared adjacent plot
      setField((field: Plot[]) => {
        const plot = field[i];
        if (plot.icon != "🌱") {
          return field;
        }
        const newField = [...field];
        const neighbors = [
          plot.x > 0 ? field[i - 1] : null,
          plot.x < 4 ? field[i + 1] : null,
          plot.y > 0 ? field[i - 5] : null,
          plot.y < 4 ? field[i + 5] : null,
        ];
        neighbors.map((neighbor: Plot | null) => {
          if (neighbor?.icon == "") {
            // TODO: Randomize this
            newField[neighbor.i].icon = "🎃";
            newField[neighbor.i].stem = plot.i;
            newField[i].children.push(neighbor.i);
            appendLog(
              `Growing ${newField[neighbor.i].icon} at ${String(
                neighbor.x,
              )},${String(neighbor.y)}.`,
            );
          }
        });
        return newField;
      });
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
