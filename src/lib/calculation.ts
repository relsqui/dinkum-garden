import { getFieldProfit } from "./app";
import { getSproutIndices, harvestAll } from "./field";
import { isCropState, type Plot } from "./plot";
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
    // TODO make this work lol, should live in field.ts probs
    // and call normalizeWeightedResults before returning
    // (then the current iterate can use it)
    //   resultCache[key] = getWeightedNextFields(field, settings)
    nextFieldCache[key] = [];
  }
  return nextFieldCache[key];
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
      ...getWeightedHarvests(
        nextField.result,
        { ...settings, iterationDays: settings.iterationDays - 1 },
        harvests
      ).map((wr) => {
        // If the weighted chance of this next field is n, that's
        // equivalent to putting each of its results into the final
        // results array n times, so multiply the result weight by n.
        return { ...wr, weight: wr.weight * nextField.weight };
      })
    );
  }
  return normalizeWeightedResults(results);
}

function sum(numbers: number[]) {
  return numbers.reduce((acc, curr) => acc + curr, 0);
}

export function getExpectedProfit(field: Plot[], settings: Settings) {
  const weightedHarvests = getWeightedHarvests(field, settings);
  const totalWeight = sum(weightedHarvests.map((wr) => wr.weight));
  const expectedHarvests = sum(
    weightedHarvests.map((wr) => (wr.result * wr.weight) / totalWeight)
  );
  const sproutCount = getSproutIndices(field).length;
  return getFieldProfit(expectedHarvests, sproutCount);
}
