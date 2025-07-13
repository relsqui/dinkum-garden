import { FieldPlot } from "./Plot";
import { type Plot } from "./plot";
import type { Settings } from "./settings";

export function Field({
  field,
  settings,
  handlePlotClick,
}: {
  field: Plot[];
  settings: Settings;
  handlePlotClick: (e: React.MouseEvent, plot: Plot) => void;
}) {
  return (
    <>
      <div className="fieldContainer">
        <div className="field">
          {field.map((plot) => (
            <FieldPlot
              onClick={handlePlotClick}
              plot={plot}
              key={plot.i}
              field={field}
              settings={settings}
            />
          ))}
        </div>
      </div>
    </>
  );
}
