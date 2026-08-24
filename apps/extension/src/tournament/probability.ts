export function winProbability(eloA: number, eloB: number, d = 400): number {
  return 1 / (1 + 10 ** ((eloB - eloA) / d));
}

export function seriesWinProbability(singleMapProbability: number, bestOf: 1 | 3 | 5): number {
  if (bestOf === 1) return singleMapProbability;
  const winsNeeded = (bestOf + 1) / 2;
  let result = 0;
  for (let wins = winsNeeded; wins <= bestOf; wins += 1) {
    result += combination(bestOf, wins) * singleMapProbability ** wins * (1 - singleMapProbability) ** (bestOf - wins);
  }
  return result;
}

function combination(n: number, k: number): number {
  let result = 1;
  for (let i = 1; i <= k; i += 1) result = (result * (n - k + i)) / i;
  return result;
}
