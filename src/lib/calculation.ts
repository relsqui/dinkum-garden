import { getFieldProfit } from "./app";
import { getSproutIndices, harvestAll } from "./field";
import { isCropState, type Plot } from "./plot";
import type { Settings } from "./settings";

interface WeightedResult<T> {
  result: T;
  weight: number;
}

// should be a primitive so it's easy to compare
// but naming a type ensures it's not just any old string
type CacheKey = string;

function getCacheKey(field: Plot[], settings: Settings): CacheKey {
  const fieldKey = field
    // for any given layout we could track only gourds and not sprouts
    // but including both lets us reuse the cache for different layouts
    .filter((p) => isCropState(p.state))
    // location, age, and gourd/sprout links affect the iteration options
    // (gourd.stem and sprout.children duplicate the same info so we
    // only need to include one, don't think it matters which)
    .map((p) => [p.i, p.age, p.stem ?? ""].map(String).join(","))
    .join(":");
  const wrapKey = (settings.wrapNS ? "NS" : "") + (settings.wrapWE ? "WE" : "");
  return `${fieldKey}/${wrapKey}`;
}

const resultCache: Record<CacheKey, WeightedResult<Plot[]>[]> = {};

function normalizeWeightedResults<T>(
  results: WeightedResult<T>[],
  hashFn: (r: T) => string = (r) => String(r)
): WeightedResult<T>[] {
  const resultsByHash: Record<string, { result: T; weight: number }> = {};
  for (const wr of results) {
    const key = hashFn(wr.result);
    if (Object.hasOwn(resultsByHash, key)) {
      resultsByHash[key].weight += wr.weight;
    } else {
      resultsByHash[key] = {
        result: wr.result,
        weight: wr.weight,
      };
    }
  }
  return Object.values(resultsByHash);
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
  field = clearField;
  harvests += newHarvests;
  const key = getCacheKey(field, settings);
  let weightedNextFields: WeightedResult<Plot[]>[];
  if (Object.hasOwn(resultCache, key)) {
    weightedNextFields = resultCache[key];
  } else {
    // TODO make this work lol, should live in field.ts probs
    // and call normalizeWeightedResults before returning
    // (then the current iterate can use it)
    weightedNextFields = []; // weightedIterate(field, settings);
    resultCache[key] = weightedNextFields;
  }
  const results = [];
  for (const nextField of weightedNextFields) {
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

export function getWeightedProfit(field: Plot[], settings: Settings) {
  const weightedResults = getWeightedResults(field, settings);
  const totalWeight = weightedResults
    .map((wr) => wr.weight)
    .reduce((acc, curr) => acc + curr, 0);
  const totalHarvests = weightedResults
    .map((wr) => (wr.result * wr.weight) / totalWeight)
    .reduce((acc, curr) => acc + curr, 0);
  const sproutCount = getSproutIndices(field).length;
  return getFieldProfit(totalHarvests, sproutCount);
}
