export interface Plot {
  x: number;
  y: number;
  i: number;
  icon: string;
  children: number[];
  stem: number | null;
}

export function emptyPlot(x: number, y: number): Plot {
  return {
    x,
    y,
    i: y * 5 + x,
    icon: "",
    children: [],
    stem: null,
  };
}

// TODO: icon enum

export type PlotClickHandler = (e: React.MouseEvent, plot: Plot) => void;
