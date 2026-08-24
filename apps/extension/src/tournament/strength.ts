export function averageElo(elos: readonly number[]): number | undefined {
  if (!elos.length) return undefined;
  return elos.reduce((sum, elo) => sum + elo, 0) / elos.length;
}

export function medianElo(elos: readonly number[]): number | undefined {
  if (!elos.length) return undefined;
  const sorted = [...elos].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1]! + sorted[middle]!) / 2;
}
