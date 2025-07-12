import {
  PlotState,
  getEmptyPlot,
  copyPlot,
  type Plot,
  type StateString,
  isCropState,
  maxAge,
} from "./plot";

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
  return field.map((plot) => copyPlot(plot));
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
  if (plot.state != PlotState.Sprout) return null;
  if (plot.age < maxAge[plot.state]) return null;
  const growChance = plot.children.length == 0 ? 1 : 0.1 / plot.children.length;
  if (Math.random() > growChance) return null;
  const emptyNeighbors = plot.neighbors.filter(
    (j) => field[j].state == PlotState.Empty
  );
  if (emptyNeighbors.length == 0) return null;
  return emptyNeighbors[Math.floor(Math.random() * emptyNeighbors.length)];
}

function growMessage(plot: Plot) {
  const [i, stem] = [plot.i, plot.stem].map(String);
  return `Growing ${plot.state} at ${i} (from ${stem}).`;
}

export function iterate(field: Plot[]): [Plot[], string[]] {
  const logMessages = [];
  let nextField = copyField(field);
  for (const plot of nextField) {
    const nextPlot = copyPlot(plot);
    const growDestination = getGrowDestination(nextField, nextPlot.i);
    if (growDestination !== null) {
      const child = copyPlot(nextField[growDestination]);
      nextPlot.children.push(child.i);
      child.state = PlotState.Pumpkin;
      child.stem = nextPlot.i;
      child.age = 1;
      nextField[child.i] = child;
      logMessages.push(growMessage(nextField[child.i]));
    } else if (
      isCropState(nextPlot.state) &&
      nextPlot.age < maxAge[nextPlot.state]
    ) {
      nextPlot.age++;
    }
    nextField[nextPlot.i] = nextPlot;
  }
  return [nextField, logMessages];
}

export function iterateUntil(
  field: Plot[],
  doneIterating: (field: Plot[], t: number) => boolean,
  maxSteps: number = 1000
): [Plot[], string[], number] {
  let t = 0;
  let testField = copyField(field);
  let logMessages = [];
  let newMessages;
  for (t = 0; t < maxSteps; t++) {
    [testField, newMessages] = iterate(testField);
    logMessages.push(...newMessages);
    if (doneIterating(testField, t)) {
      break;
    }
  }
  return [testField, logMessages, t];
}

export function removePlot(field: Plot[], i: number) {
  const nextField = copyField(field);
  const plot = nextField[i];
  if (plot.state == PlotState.Sprout) {
    plot.children.map((c) => {
      nextField[c].stem = null;
    });
  } else if (plot.state == PlotState.Pumpkin) {
    const stem = plot.stem;
    if (stem !== null) {
      nextField[stem].children = nextField[stem].children.filter(
        (c) => c != plot.i
      );
    }
  }
  nextField[i] = getEmptyPlot(plot.x, plot.y);
  return nextField;
}

export function addPlot(field: Plot[], i: number, state: StateString) {
  const nextField = copyField(field);
  nextField[i].state = state;
  if (isCropState(state)) {
    nextField[i].age = 1;
  }
  return nextField;
}
