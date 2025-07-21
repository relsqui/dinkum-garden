import {
  getCacheKey,
  normalizeWeightedResults,
  selectedWeightedResult,
  type WeightedResult,
} from "./calculation";
import {
  PlotState,
  getEmptyPlot,
  copyPlot,
  type Plot,
  type StateString,
  isCropState,
  canHarvest,
  getEmptyNeighbors,
  canGrow,
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

export function getSproutIndices(field: Plot[], onlyFullGrown = false) {
  let sprouts = field.filter((p) => p.state == PlotState.Sprout).map((p) => p.i);
  if (onlyFullGrown) {
    sprouts = sprouts.filter(i => !canGrow(field[i]));
  }
  return sprouts;
}

export function fieldFromSearchParams() {
  let newField = getEmptyField();
  const sproutParam = new URLSearchParams(window.location.search).get(
    "sprouts"
  );
  if (sproutParam !== null) {
    for (const i of sproutParam.split(".").map(Number)) {
      newField = addPlot(newField, i, PlotState.Sprout);
    }
  }
  return newField;
}

function getGrowDestinations(
  field: Plot[],
  settings: Settings,
  i: number
): WeightedResult<number | null>[] {
  const plot = field[i];
  const emptyNeighbors = getEmptyNeighbors(plot, field, settings);
  const growChance =
    emptyNeighbors.length == 0
      ? 0
      : plot.children.length == 0
      ? 1
      : 0.1 / plot.children.length;
  return [
    {
      result: null,
      weight: 1 - growChance,
    },
    ...emptyNeighbors.map((i) => {
      return {
        result: i,
        weight: growChance / emptyNeighbors.length,
      };
    }),
  ];
}

type possibleFuture = { nextField: Plot[]; newGrowth: number };

export function iterate(
  field: Plot[],
  settings: Settings,
  remainingSprouts: number[],
  returnAll = false,
  growFirst = true
): WeightedResult<possibleFuture>[] {
  let nextField = copyField(field);
  if (growFirst) {
    // TODO: there has to be a better place for this logic
    // (also it's not working, sprouts grow but pumpkins don't)
    nextField = nextField.map((plot) =>
      canGrow(plot) ? { ...plot, age: plot.age + 1 } : copyPlot(plot)
    );
  }
  const sprout = remainingSprouts.shift();
  if (typeof sprout === "undefined") {
    return [
      {
        result: {
          nextField,
          newGrowth: 0,
        },
        weight: 1,
      },
    ];
  }
  let growDestinations = getGrowDestinations(field, settings, sprout);
  if (!returnAll) {
    growDestinations = [selectedWeightedResult(growDestinations)];
  }
  const possibleFutures: WeightedResult<possibleFuture>[] = [];
  let newGrowth = 0;
  for (const growDestination of growDestinations) {
    const possibleNextField = copyField(nextField);
    if (growDestination.result !== null) {
      const child = possibleNextField[growDestination.result];
      child.state = PlotState.Pumpkin;
      child.stem = sprout;
      child.age = 1;
      possibleNextField[sprout].children.push(child.i);
      newGrowth++;
    }
    if (remainingSprouts.length == 0) {
      possibleFutures.push({
        result: { nextField: possibleNextField, newGrowth },
        weight: growDestination.weight,
      });
    } else {
      for (let s = 0; s < remainingSprouts.length; s++) {
        possibleFutures.push(
          ...iterate(
            possibleNextField,
            settings,
            remainingSprouts.slice(s),
            returnAll,
            false
          ).map((weightedFuture) => {
            return {
              result: {
                nextField: weightedFuture.result.nextField,
                newGrowth: weightedFuture.result.newGrowth + newGrowth,
              },
              weight: weightedFuture.weight * growDestination.weight,
            };
          })
        );
      }
    }
  }
  return normalizeWeightedResults(
    possibleFutures,
    (pf) => getCacheKey(pf.nextField, settings) + `/${pf.newGrowth}`
  );
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
