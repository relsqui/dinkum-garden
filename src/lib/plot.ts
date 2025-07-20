import type { Settings } from "./settings";

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
export type StateString = (typeof PlotState)[keyof typeof PlotState];

export const maxAge = {
  [Emoji.Sprout]: 11,
  [Emoji.Pumpkin]: 7,
  [Emoji.Melon]: 7,
};

export const seedPrice = {
  [PlotState.Pumpkin]: 780,
  [PlotState.Melon]: 770,
};

export interface Plot {
  x: number;
  y: number;
  i: number;
  state: StateString;
  age: number;
  children: number[];
  stem: number | null;
}

export function getEmptyPlot(x: number, y: number): Plot {
  return {
    x,
    y,
    i: y * 5 + x,
    state: PlotState.Empty,
    age: 0,
    children: [],
    stem: null,
  };
}

export function getEmptyNeighbors(
  { x, y, i }: Plot,
  field: Plot[],
  settings: Settings
) {
  return [
    ...new Set([
      x > 0 ? i - 1 : null,
      x < 4 ? i + 1 : null,
      y > 0 ? i - 5 : null,
      y < 4 ? i + 5 : null,
      ...(settings.wrapWE ? [[i + 4], [], [], [], [i - 4]][x % 5] : []),
      ...(settings.wrapNS ? [(i + 20) % 25, (i + 30) % 25] : []),
    ]),
  ].filter((n) => n !== null && field[n].state == PlotState.Empty);
}

export function copyPlot(plot: Plot) {
  const nextPlot = { ...plot };
  nextPlot.children = [...plot.children];
  return nextPlot;
}

export function isCropState(state: StateString) {
  return [PlotState.Pumpkin, PlotState.Melon, PlotState.Sprout].includes(state);
}

export function canHarvest(plot: Plot) {
  return (
    [PlotState.Pumpkin, PlotState.Melon].includes(plot.state) &&
    plot.age == maxAge[plot.state]
  );
}

export function canGrow(plot: Plot) {
  return isCropState(plot.state) && plot.age < maxAge[plot.state];
}

// The keys here are the diff between the stem index and gourd index.
export const stemClasses: string[] = [];
stemClasses[-5] = "stem stemDown";
stemClasses[20] = "stem stemWrapDown";
stemClasses[5] = "stem stemUp";
stemClasses[-20] = "stem stemWrapUp";
stemClasses[-1] = "stem stemRight";
stemClasses[4] = "stem stemWrapRight";
stemClasses[1] = "stem stemLeft";
stemClasses[-4] = "stem stemWrapLeft";

// These are the sprout-adjacent halves of the wrapping stems
export const stemFragment: string[] = [];
stemFragment[20] = "stem stemFragmentUp";
stemFragment[-20] = "stem stemFragmentDown";
stemFragment[4] = "stem stemFragmentLeft";
stemFragment[-4] = "stem stemFragmentRight";

export function getInfo(plot: Plot, field: Plot[], settings: Settings) {
  const info: string[] = [];
  if (settings.debug) {
    info.push(
      ...[
        `${String(plot.i)} (${String(plot.x)},${String(plot.y)})`,
        String(getEmptyNeighbors(plot, field, settings)),
        plot.stem,
      ].map(String)
    );
  }
  return info;
}
