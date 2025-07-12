import React from "react";

export interface Plot {
  x: number;
  y: number;
  i: number;
  icon: string;
  children: number[];
  stem?: number;
}

export function emptyPlot(x: number, y: number): Plot {
  return {
    x,
    y,
    i: y * 5 + x,
    icon: "",
    children: [],
  };
}

// TODO: icon enum

const stemClasses: string[] = [];
stemClasses[-5] = "stem stemDown";
stemClasses[5] = "stem stemUp";
stemClasses[-1] = "stem stemRight";
stemClasses[1] = "stem stemLeft";

function getInfo(plot: Plot) {
  return [plot.i, plot.children].map(String).join(": ");
}

export type PlotClickHandler = (e: React.MouseEvent, plot: Plot) => void;

export function FieldPlot({
  onClick,
  plot,
}: {
  onClick: PlotClickHandler;
  plot: Plot;
}) {
  return (
    <div
      className="plot"
      onClick={(e) => {
        onClick(e, plot);
      }}
    >
      <div className="plotInfo">{getInfo(plot)}</div>
      <div className="icon">{plot.icon}</div>
      {typeof plot.stem !== "undefined" ? (
        <div className={stemClasses[plot.i - plot.stem]} />
      ) : (
        ""
      )}
    </div>
  );
}
