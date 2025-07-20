import { getFieldProfit } from "./app";
import { getSproutIndices, harvestAll } from "./field";
import { isCropState, type Plot } from "./plot";
import type { Settings } from "./settings";

interface WeightedResult<T> {
  result: T;
  weight: number;
}

function getCacheKey(field: Plot[], settings: Settings): string {
  const fieldKey = field
    // For any given layout we could track only gourds and not sprouts,
    // but including both lets us reuse the cache for different layouts.
    .filter((p) => isCropState(p.state))
    // Location, age, and gourd/sprout links affect the iteration options.
    // (gourd.stem and sprout.children duplicate the same info so we
    // only need to include one, don't think it matters which.)
    .map((p) => [p.i, p.age, p.stem ?? ""].map(String).join(","))
    .join(":");
  const wrapKey = (settings.wrapNS ? "NS" : "") + (settings.wrapWE ? "WE" : "");
  return `${fieldKey}/${wrapKey}`;
}

function normalizeWeightedResults<T>(
  results: WeightedResult<T>[],
  hashFn: (r: T) => string = String
): WeightedResult<T>[] {
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

function getWeightedResults(
  field: Plot[],
  settings: Settings,
  harvests = 0
): WeightedResult<number>[] {
  if (settings.iterationDays == 0) {
    // Recursion base case.
    return [
      {
        result: harvests,
        weight: 1,
      },
    ];
  }
  const [clearField, newHarvests] = harvestAll(field);
  harvests += newHarvests;
  const results = [];
  for (const nextField of getNextFieldsWithCache(clearField, settings)) {
    results.push(
      ...getWeightedResults(
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

export function getWeightedProfit(field: Plot[], settings: Settings) {
  const weightedResults = getWeightedResults(field, settings);
  const totalWeight = sum(weightedResults.map((wr) => wr.weight));
  const weightedHarvests = sum(
    weightedResults.map((wr) => (wr.result * wr.weight) / totalWeight)
  );
  const sproutCount = getSproutIndices(field).length;
  return getFieldProfit(weightedHarvests, sproutCount);
}
