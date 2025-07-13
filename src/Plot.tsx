import { Emoji, getInfo, maxAge, stemClasses, stemFragment, type Plot } from "./plot";
import type { Settings } from "./settings";

export function FieldPlot({
  onClick,
  plot,
  field,
  settings,
}: {
  onClick: (e: React.MouseEvent, plot: Plot) => void;
  plot: Plot;
  field: Plot[];
  settings: Settings;
}) {
  return (
    <div
      className="plot"
      onClick={(e) => {
        onClick(e, plot);
      }}
    >
      <div className="plotInfo">
        {getInfo(plot, field, settings).map((info, i) => (
          <div key={i}>{info}</div>
        ))}
      </div>
      <div className="plotAge">
        {plot.age
          ? plot.age == maxAge[plot.state]
            ? Emoji.Star
            : plot.age
          : ""}
      </div>
      <div className="plotState">{plot.state}</div>
      {plot.stem === null ? (
        ""
      ) : (
        <>
          <div className={stemClasses[plot.i - plot.stem]} />
          {/* TODO: this in some less hacky way */}
          <div className={stemFragment[plot.i - plot.stem]} />
        </>
      )}
    </div>
  );
}
