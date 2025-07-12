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
    summary: `${String(score)} points for ${String(gourd)} gourds from ${String(seeds)} seeds`,
  };
}
