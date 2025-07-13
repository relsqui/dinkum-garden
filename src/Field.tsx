import { FieldPlot } from "./Plot";
import { type Plot } from "./plot";

export function Field({
  field,
  handlePlotClick,
}: {
  field: Plot[];
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
              debug={false}
            />
          ))}
        </div>
      </div>
    </>
  );
}
