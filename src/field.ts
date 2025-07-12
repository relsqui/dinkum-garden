import { emptyPlot, type Plot } from "./plot";

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
