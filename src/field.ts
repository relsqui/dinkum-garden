import { getEmptyPlot, type Plot } from "./plot";

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
  const squashPrice = 3120;
  const seedPrice = 780;
  const seeds = field.filter((plot) => plot.icon == "🌱").length;
  const squash = field.filter((plot) => plot.icon == "🎃").length;
  const score = squash * squashPrice - seeds * seedPrice;
  return {
    seeds,
    squash,
    score,
    summary: `${String(score)} points for ${String(squash)} squash from ${String(seeds)} seeds`,
  };
}
