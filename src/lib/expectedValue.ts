import { getFieldProfit } from "./app";
import { getSproutIndices, harvestAll, iterate } from "./field";
import { Memo } from "./memo";
import {
  copyPlot,
  getEmptyPlot,
  isCropState,
  maxAge,
  PlotState,
  type Plot,
} from "./plot";
import type { Settings } from "./settings";
import {
  normalizeWeightedResults,
  sum,
  type WeightedResult,
} from "./weightedResult";

export function fieldToKey([field, settings]: [Plot[], Settings]): string {
  // Transform the parts of the game state that affect possible next
  // states into a string we can use as an object key in the cache.
  // Those parts are crop locations, crop relations, and gourd ages.
  // For any given layout we could track only gourds and not sprouts,
  // but including both lets us reuse the cache for different layouts.
  const fieldKey = field
    .filter((p) => isCropState(p.state))
    .map((p) => [p.i, p.age, p.stem ?? ""].map(String).join(","))
    .join(":");
  const wrapKey = (settings.wrapNS ? "NS" : "") + (settings.wrapWE ? "WE" : "");
  return `${fieldKey}/${wrapKey}`;
}

const nextFieldMemo = new Memo<
  [field: Plot[], settings: Settings],
  WeightedResult<Plot[]>[]
>(fieldToKey, ([field, settings]) => {
  const remainingSprouts = getSproutIndices(field, true);
  return iterate(field, settings, remainingSprouts, true).map(
    (weightedPossibleFuture) => {
      // Discard possibleFuture.newGrowth, that's only for interactive logging.
      return {
        result: weightedPossibleFuture.result.nextField,
        weight: weightedPossibleFuture.weight,
      };
    }
  );
});

const weightedHarvestMemo = new Memo<
  [field: Plot[], settings: Settings, harvests: number],
  WeightedResult<number>[]
>(
  ([field, settings]) =>
    [fieldToKey([field, settings]), settings.iterationDays].join("/"),
  ([field, settings, harvests]) =>
    getWeightedHarvests(field, settings, harvests)
);

function harvestBaseCase(harvests: number) {
  return [
    {
      result: harvests,
      weight: 1,
    },
  ];
}

function getWeightedHarvests(
  field: Plot[],
  settings: Settings,
  harvests = 0
): WeightedResult<number>[] {
  // Calculate the expected number of harvests for a given field and settings.
  const [clearField, newHarvests] = harvestAll(field);
  harvests += newHarvests;
  if (settings.iterationDays == 0) return harvestBaseCase(harvests);
  const results = [];
  for (const nextField of nextFieldMemo.get([clearField, settings])) {
    results.push(
      ...weightedHarvestMemo
        .get([
          nextField.result,
          { ...settings, iterationDays: settings.iterationDays - 1 },
          harvests,
        ])
        .map((wr) => {
          // If the weighted chance of this next field is n, that's
          // equivalent to putting each of its results into the final
          // results array n times, so multiply the result weight by n.
          return {
            result: wr.result + harvests,
            weight: wr.weight * nextField.weight,
          };
        })
    );
  }
  return normalizeWeightedResults(results);
}

export function getExpectedProfit(field: Plot[], settings: Settings) {
  field = field.map((plot) => {
    // Skip sprout growth and ignore existing gourds,
    // calculate for a freshly-grown field.
    const newPlot = copyPlot(plot);
    if (plot.state == PlotState.Sprout) {
      newPlot.age = maxAge[PlotState.Sprout];
    } else if (plot.state != PlotState.Water) {
      return getEmptyPlot(plot.x, plot.y);
    }
    return newPlot;
  });
  const weightedHarvests = weightedHarvestMemo.get([field, settings, 0]);
  const totalWeight = sum(weightedHarvests.map((wr) => wr.weight));
  const expectedHarvests = Math.floor(
    sum(weightedHarvests.map((wr) => (wr.result * wr.weight) / totalWeight))
  );
  const sproutCount = getSproutIndices(field).length;
  return getFieldProfit(expectedHarvests, sproutCount);
}
