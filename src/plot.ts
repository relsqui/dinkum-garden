export const Emoji = {
  Pumpkin: "🎃",
  Melon: "🍈",
  Sprout: "🌱",
  Water: "💧",
  Star: "⭐",
};

export const PlotState = {
  Empty: "",
  Pumpkin: Emoji.Pumpkin,
  Melon: Emoji.Melon,
  Sprout: Emoji.Sprout,
  Water: Emoji.Water,
} as const;

// Shoutout to https://stackoverflow.com/a/60148768
// The "as const" assertion means that typeof Plotstate isn't {[string]: string},
// it's a map of the union of specific keys to the union of specific values.
// So keyof typeof PlotState is the set of keys, and typeof PlotState[all keys]
// is the set of values.
// All this is a workaround to get the features of a typescript Enum while
// the erasableSyntaxOnly setting is on.
export type StateString = (typeof PlotState)[keyof typeof PlotState];

export const maxAge = {
  [Emoji.Sprout]: 11,
  [Emoji.Pumpkin]: 7,
  [Emoji.Melon]: 7,
};

export interface Plot {
  x: number;
  y: number;
  i: number;
  state: StateString;
  age: number;
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
    age: 0,
    neighbors,
    children: [],
    stem: null,
  };
}

export function copyPlot(plot: Plot) {
  const nextPlot = { ...plot };
  nextPlot.children = [...plot.children];
  // Neighbors will never change for a given field size, but it's cheap
  // to copy for the sake of making the function actually pure.
  nextPlot.neighbors = [...plot.neighbors];
  return nextPlot;
}

export function isCropState(state: StateString) {
  return [PlotState.Pumpkin, PlotState.Melon, PlotState.Sprout].includes(state);
}

export function isHarvestable(plot: Plot) {
  return (
    [PlotState.Pumpkin, PlotState.Melon].includes(plot.state) &&
    plot.age == maxAge[plot.state]
  );
}

// The keys here are the diff between the stem index and gourd index.
export const stemClasses: string[] = [];
stemClasses[-5] = "stem stemDown";
stemClasses[5] = "stem stemUp";
stemClasses[-1] = "stem stemRight";
stemClasses[1] = "stem stemLeft";

export function getInfo(plot: Plot, debug: boolean) {
  const info: (string | number)[] = [plot.i];
  if (debug && import.meta.env.MODE != "production") {
    info.push(plot.children.length);
  }
  return info.map(String).join(" / ");
}
