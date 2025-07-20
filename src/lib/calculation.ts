import { getFieldProfit } from "./app";
import { getSproutIndices, harvestAll } from "./field";
import { isCropState, type Plot } from "./plot";
import type { Settings } from "./settings";

interface WeightedResult<T> {
  result: T;
  weight: number;
}

function getCacheKey(field: Plot[], settings: Settings): string {
  // For any given layout we could track only gourds and not sprouts,
  // but including both lets us reuse the cache for different layouts.
  // Location, age, and gourd/sprout links affect the iteration options.
  const fieldKey = field
    .filter((p) => isCropState(p.state))
    .map((p) => [p.i, p.age, p.stem ?? ""].map(String).join(","))
    .join(":");
  const wrapKey = (settings.wrapNS ? "NS" : "") + (settings.wrapWE ? "WE" : "");
  return `${fieldKey}/${wrapKey}`;
}

function normalizeWeightedResults<T>(
  results: WeightedResult<T>[],
  hashFn: (r: T) => string = String
): WeightedResult<T>[] {
  // Takes a list of weighted results and deduplicates them by a
  // string hash of the result, adding the weights together.
  const resultsByHash: Record<string, WeightedResult<T>> = {};
  for (const wr of results) {
    const key = hashFn(wr.result);
    if (Object.hasOwn(resultsByHash, key)) {
      resultsByHash[key].weight += wr.weight;
    } else {
      resultsByHash[key] = wr;
    }
  }
  return Object.values(resultsByHash);
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
    //   resultCache[key] = weightedIterate(field, settings)
    nextFieldCache[key] = [];
  }
  return nextFieldCache[key];
}

function getWeightedHarvests(
  field: Plot[],
  settings: Settings,
  harvests = 0
): WeightedResult<number>[] {
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
