export interface Plot {
  x: number;
  y: number;
  i: number;
  icon: string;
  neighbors: number[];
  children: number[];
  stem: number | null;
}

export const Emoji = {
  Empty: "",
  Pumpkin: "🎃",
  Melon: "🍈",
  Sprout: "🌱",
  Water: "💧",
  Star: "⭐"
}

// TODO: icon enum

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
    icon: Emoji.Empty,
    neighbors,
    children: [],
    stem: null,
  };
}

export function coordString(plot: Plot): string {
  return [plot.x, plot.y].map(String).join(",");
}

export type PlotClickHandler = (e: React.MouseEvent, plot: Plot) => void;
