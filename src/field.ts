import { Emoji, getEmptyPlot, type Plot } from "./plot";

export function getEmptyField() {
  const field: Plot[] = [];
  let i = 0;
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      field.push(getEmptyPlot(x, y));
      i = i + 1;
    }
  }
  field[12].icon = "💧";
  return field;
}

export function scoreField(field: Plot[]) {
  // These values are for pumpkins
  const gourdPrice = 3120;
  const seedPrice = 780;
  const seeds = field.filter((plot) => plot.icon == Emoji.Sprout).length;
  const gourd = field.filter((plot) => plot.icon == Emoji.Pumpkin).length;
  const score = gourd * gourdPrice - seeds * seedPrice;
  return {
    seeds,
    gourd,
    score,
    summary: `${String(score)} points for ${String(gourd)} gourds from ${String(
      seeds
    )} seeds`,
  };
}

export function fullyGrown(testField: Plot[]) {
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

function getGrowDestination(testField: Plot[], i: number): number | null {
  const plot = testField[i];
  if (plot.icon != Emoji.Sprout) {
    return null;
  }
  const growChance = plot.children.length == 0 ? 1 : 0.1 / plot.children.length;
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

export function iterate(
  prevField: Plot[],
  appendLog: (message: string) => void
) {
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

export function removePlot(field: Plot[], i: number) {
  const plot = field[i];
  if (plot.icon == Emoji.Sprout) {
    plot.children.map((i) => {
      field[i].stem = null;
    });
  } else if (plot.icon == Emoji.Pumpkin) {
    const stem = plot.stem;
    if (stem !== null) {
      field[stem].children = field[stem].children.filter((c) => c != plot.i);
    }
  }
  field[i] = getEmptyPlot(plot.x, plot.y);
}
