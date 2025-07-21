export interface WeightedResult<T> {
  result: T;
  weight: number;
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

export function selectWeightedResult<T>(
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

export function sum(numbers: number[]) {
  return numbers.reduce((acc, curr) => acc + curr, 0);
}
