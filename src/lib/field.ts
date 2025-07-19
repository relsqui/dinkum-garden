import {
  PlotState,
  getEmptyPlot,
  copyPlot,
  type Plot,
  type StateString,
  isCropState,
  maxAge,
  canHarvest,
  canGrow,
  getEmptyNeighbors,
} from "./plot";
import { type Settings } from "./settings";

export function getEmptyField() {
  const field: Plot[] = [];
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      field.push(getEmptyPlot(x, y));
    }
  }
  field[12].state = "💧";
  return field;
}

export function copyField(field: Plot[]) {
  return field.map((plot) => copyPlot(plot));
}

export function getSproutIndices(field: Plot[]) {
  return field.filter((p) => p.state == PlotState.Sprout).map((p) => p.i);
}

export function fieldFromSearchParams() {
  let newField = getEmptyField();
  const sproutParam =
    new URLSearchParams(window.location.search).get("sprouts") || "";
  for (const i of sproutParam.split(".").map(Number)) {
    newField = addPlot(newField, i, PlotState.Sprout);
  }
  return newField;
}

function getGrowDestination(
  field: Plot[],
  i: number,
  settings: Settings
): number | null {
  const plot = field[i];
  if (plot.state != PlotState.Sprout) return null;
  if (plot.age < maxAge[plot.state]) return null;
  const growChance = plot.children.length == 0 ? 1 : 0.1 / plot.children.length;
  if (Math.random() > growChance) return null;
  const emptyNeighbors = getEmptyNeighbors(plot, field, settings);
  if (emptyNeighbors.length == 0) return null;
  return emptyNeighbors[Math.floor(Math.random() * emptyNeighbors.length)];
}

export function iterate(field: Plot[], settings: Settings): [Plot[], number] {
  const nextField = copyField(field);
  let newGrowth = 0;
  for (const plot of nextField) {
    const nextPlot = copyPlot(plot);
    const growDestination = getGrowDestination(nextField, nextPlot.i, settings);
    if (growDestination !== null) {
      const child = copyPlot(nextField[growDestination]);
      nextPlot.children.push(child.i);
      child.state = PlotState.Pumpkin;
      child.stem = nextPlot.i;
      child.age = 1;
      nextField[child.i] = child;
      newGrowth++;
    } else if (canGrow(nextPlot)) {
      nextPlot.age++;
    }
    nextField[nextPlot.i] = nextPlot;
  }
  return [nextField, newGrowth];
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

export function togglePlot(plot: Plot, field: Plot[]): [Plot[], string[]] {
  let nextField = copyField(field);
  const logMessages = [];
  if (plot.state == PlotState.Water) {
    logMessages.push("Can't plant over the sprinkler.");
  } else if (plot.state == PlotState.Empty) {
    logMessages.push(`Adding ${PlotState.Sprout}.`);
    nextField = addPlot(field, plot.i, PlotState.Sprout);
  } else if (isCropState(plot.state)) {
    if (plot.state == PlotState.Sprout) {
      logMessages.push(`Removing ${plot.state}.`);
    } else if (canHarvest(plot)) {
      logMessages.push(`Harvesting ${plot.state}.`);
    } else {
      logMessages.push(`Removing partly-grown ${plot.state}.`);
    }
    nextField = removePlot(field, plot.i);
  }
  return [nextField, logMessages];
}

export function harvestAll(field: Plot[]): [Plot[], number] {
  let harvests = 0;
  let nextField = copyField(field);
  for (const plot of nextField) {
    if (canHarvest(plot)) {
      nextField = removePlot(nextField, plot.i);
      harvests++;
    }
  }
  return [nextField, harvests];
}
