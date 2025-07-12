import { PlotState, getEmptyPlot, copyPlot, type Plot, type StateString } from "./plot";

export function getEmptyField() {
  const field: Plot[] = [];
  let i = 0;
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      field.push(getEmptyPlot(x, y));
      i = i + 1;
    }
  }
  field[12].state = "💧";
  return field;
}

function copyField(field: Plot[]) {
  return field.map(plot => copyPlot(plot));
}

export function scoreField(field: Plot[]) {
  // These values are for pumpkins
  const gourdPrice = 3120;
  const seedPrice = 780;
  const seeds = field.filter((plot) => plot.state == PlotState.Sprout).length;
  const gourds = field.filter((plot) => plot.state == PlotState.Pumpkin).length;
  const score = gourds * gourdPrice - seeds * seedPrice;
  const summary = [
    score,
    "points for",
    gourds,
    "gourds from",
    seeds,
    "seeds",
  ].join(" ");
  return {
    seeds,
    gourd: gourds,
    score,
    summary,
  };
}

export function fullyGrown(field: Plot[]) {
  for (const plot of field) {
    if (plot.state == PlotState.Sprout) {
      for (const n of plot.neighbors) {
        if (field[n].state == PlotState.Empty) {
          return false;
        }
      }
    }
  }
  return true;
}

function getGrowDestination(field: Plot[], i: number): number | null {
  const plot = field[i];
  if (plot.state != PlotState.Sprout) {
    return null;
  }
  const growChance = plot.children.length == 0 ? 1 : 0.1 / plot.children.length;
  if (Math.random() > growChance) {
    return null;
  }
  const emptyNeighbors = plot.neighbors.filter(
    (j) => field[j].state == PlotState.Empty
  );
  if (emptyNeighbors.length == 0) {
    return null;
  }
  return emptyNeighbors[Math.floor(Math.random() * emptyNeighbors.length)];
}

export function iterate(
  prevField: Plot[]
): [Plot[], string[]] {
  const logMessages = []
  // nextField needs a returnable value even if nothing grows.
  let nextField = copyField(prevField);
  for (let i = 0; i < prevField.length; i++) {
    const growInto = getGrowDestination(prevField, i);
    if (growInto === null) {
      continue;
    }
    logMessages.push(
      `Growing ${PlotState.Pumpkin} at ${String(growInto)} (from ${String(i)}).`
    );
    nextField = prevField.map((prevPlot, j) => {
      const nextPlot = copyPlot(prevPlot);
      if (j == i) {
        nextPlot.children.push(growInto);
      } else if (j == growInto) {
        nextPlot.state = PlotState.Pumpkin;
        nextPlot.stem = i;
      }
      return nextPlot;
    });
    prevField = nextField;
  }
  return [nextField, logMessages];
}

export function removePlot(field: Plot[], i: number) {
  const nextField = copyField(field);
  const plot = nextField[i];
  if (plot.state == PlotState.Sprout) {
    plot.children.map((i) => {
      nextField[i].stem = null;
    });
  } else if (plot.state == PlotState.Pumpkin) {
    const stem = plot.stem;
    if (stem !== null) {
      nextField[stem].children = nextField[stem].children.filter((c) => c != plot.i);
    }
  }
  nextField[i] = getEmptyPlot(plot.x, plot.y);
  return nextField;
}

export function addPlot(field: Plot[], i: number, icon: StateString) {
  const nextField = copyField(field);
  nextField[i].state = icon;
  return nextField;
}
