import { getInfo, stemClasses, type Plot, type PlotClickHandler } from "./plot";

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
      <div className="plotState">{plot.state}</div>
      {plot.stem === null ? (
        ""
      ) : (
        <div className={stemClasses[plot.i - plot.stem]} />
      )}
    </div>
  );
}
