export const PlotState = {
  Empty: "",
  Pumpkin: "🎃",
  Melon: "🍈",
  Sprout: "🌱",
  Water: "💧",
  Star: "⭐",
} as const;

// Shoutout to https://stackoverflow.com/a/60148768
// I haven't totally wrapped my head around how this works
export type StateString = typeof PlotState[keyof typeof PlotState]

export interface Plot {
  x: number;
  y: number;
  i: number;
  state: StateString;
  neighbors: number[];
  children: number[];
  stem: number | null;
}

export function getEmptyPlot(x: number, y: number): Plot {
  const i = y * 5 + x;
  const neighbors = [
    x > 0 ? i - 1 : null,
    x < 4 ? i + 1 : null,
    y > 0 ? i - 5 : null,
    y < 4 ? i + 5 : null,
  ].filter((n) => n !== null);
  return {
    x,
    y,
    i,
    state: PlotState.Empty,
    neighbors,
    children: [],
    stem: null,
  };
}

export function copyPlot(plot: Plot) {
  const nextPlot = {...plot};
  nextPlot.children = [...plot.children];
  // Neighbors will never change for a given field size, but it's cheap
  // to copy for the sake of making the function actually pure.
  nextPlot.neighbors = [...plot.neighbors];
  return nextPlot;
}

export type PlotClickHandler = (e: React.MouseEvent, plot: Plot) => void;

export const stemClasses: string[] = [];
stemClasses[-5] = "stem stemDown";
stemClasses[5] = "stem stemUp";
stemClasses[-1] = "stem stemRight";
stemClasses[1] = "stem stemLeft";

export function getInfo(plot: Plot, debug: boolean) {
  const info: (String | number)[] = [plot.i];
  if (debug) {
    info.push(plot.neighbors.length, String(plot.children));
  }
  return info.map(String).join(" / ");
}
