import { getFieldProfit } from "./app";
import { getSproutIndices, harvestAll, iterate } from "./field";
import {
  copyPlot,
  getEmptyPlot,
  isCropState,
  maxAge,
  PlotState,
  type Plot,
} from "./plot";
import type { Settings } from "./settings";

export interface WeightedResult<T> {
  result: T;
  weight: number;
}

export function getCacheKey(field: Plot[], settings: Settings): string {
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

export function normalizeWeightedResults<T>(
  results: WeightedResult<T>[],
  stringify: (r: T) => string = String
): WeightedResult<T>[] {
  // Deduplicate a list of weighted results, adding the weights of like results
  // together. Takes an optional function to convert complex result types
  // into strings for comparison.
  const resultsByHash: Record<string, WeightedResult<T>> = {};
  for (const wr of results) {
    const key = stringify(wr.result);
    if (Object.hasOwn(resultsByHash, key)) {
      resultsByHash[key].weight += wr.weight;
    } else {
      resultsByHash[key] = wr;
    }
  }
  return Object.values(resultsByHash);
}

export function selectedWeightedResult<T>(
  weightedResults: WeightedResult<T>[]
): WeightedResult<T> {
  const totalWeight = sum(weightedResults.map((wr) => wr.weight));
  const selection = Math.random() * totalWeight;
  weightedResults.sort((a, b) => a.weight - b.weight);
  let cumulativeWeight = 0;
  for (const wr of weightedResults) {
    cumulativeWeight += wr.weight;
    if (selection < cumulativeWeight) {
      return wr;
    }
  }
  // We should never get here but it makes typescript feel better.
  return weightedResults.slice(-1)[0];
}

const nextFieldCache: Record<string, WeightedResult<Plot[]>[]> = {};

function getNextFieldsWithCache(
  field: Plot[],
  settings: Settings
): WeightedResult<Plot[]>[] {
  const key = getCacheKey(field, settings);
  if (!Object.hasOwn(nextFieldCache, key)) {
    const remainingSprouts = getSproutIndices(field, true);
    nextFieldCache[key] = iterate(field, settings, remainingSprouts, true).map(
      (weightedPossibleFuture) => {
        // Discard possibleFuture.newGrowth, that's only for interactive logging.
        return {
          result: weightedPossibleFuture.result.nextField,
          weight: weightedPossibleFuture.weight,
        };
      }
    );
  }
  return nextFieldCache[key];
}

const weightedHarvestCache: Record<string, WeightedResult<number>[]> = {};

function getWeightedHarvestsWithCache(field: Plot[], settings: Settings, harvests = 0) {
  // Iteration cache keys don't include days because they're only for one
  // step, but this one needs to because it's for the entire rest of the
  // simulation, and the duration affects the outcome.
  const key = getCacheKey(field, settings) + `/${settings.iterationDays}`;
  if (!Object.hasOwn(weightedHarvestCache, key)) {
    weightedHarvestCache[key] = getWeightedHarvests(field, settings, harvests);
  }
  return weightedHarvestCache[key];
}

function getWeightedHarvests(
  field: Plot[],
  settings: Settings,
  harvests = 0
): WeightedResult<number>[] {
  // Calculate the expected number of harvests for a given field and settings.
  const [clearField, newHarvests] = harvestAll(field);
  harvests += newHarvests;
  if (settings.iterationDays == 0) {
    return [
      {
        result: harvests,
        weight: 1,
      },
    ];
  }
  const results = [];
  for (const nextField of getNextFieldsWithCache(clearField, settings)) {
    results.push(
      ...getWeightedHarvestsWithCache(
        nextField.result,
        { ...settings, iterationDays: settings.iterationDays - 1 },
        harvests
      ).map((wr) => {
        // If the weighted chance of this next field is n, that's
        // equivalent to putting each of its results into the final
        // results array n times, so multiply the result weight by n.
        return { result: wr.result + harvests, weight: wr.weight * nextField.weight };
      })
    );
  }
  return normalizeWeightedResults(results);
}

function sum(numbers: number[]) {
  return numbers.reduce((acc, curr) => acc + curr, 0);
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
  const weightedHarvests = getWeightedHarvestsWithCache(field, settings);
  const totalWeight = sum(weightedHarvests.map((wr) => wr.weight));
  const expectedHarvests = Math.floor(
    sum(weightedHarvests.map((wr) => (wr.result * wr.weight) / totalWeight))
  );
  const sproutCount = getSproutIndices(field).length;
  return getFieldProfit(expectedHarvests, sproutCount);
}
