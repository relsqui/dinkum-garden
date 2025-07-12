import type { Plot, PlotClickHandler } from "./plot";

const stemClasses: string[] = [];
stemClasses[-5] = "stem stemDown";
stemClasses[5] = "stem stemUp";
stemClasses[-1] = "stem stemRight";
stemClasses[1] = "stem stemLeft";

function getStem(plot: Plot) {
  if (plot.stem === null) {
    return "";
  }
  return <div className={stemClasses[plot.i - plot.stem]} />;
}

function getInfo(plot: Plot, debug: boolean) {
  const info: (String | number)[] = [plot.i];
  if (debug) {
    info.push(plot.neighbors.length, String(plot.children));
  }
  return info.map(String).join(" / ");
}

export function FieldPlot({
  onClick,
  plot,
  debug,
}: {
  onClick: PlotClickHandler;
  plot: Plot;
  debug: boolean;
}) {
  return (
    <div
      className="plot"
      onClick={(e) => {
        onClick(e, plot);
      }}
    >
      <div className="plotInfo">{getInfo(plot, debug)}</div>
      <div className="icon">{plot.icon}</div>
      {getStem(plot)}
    </div>
  );
}
