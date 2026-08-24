export function powerRanking<T extends { averageElo?: number }>(teams: readonly T[]): T[] {
  return [...teams].sort((a, b) => (b.averageElo ?? -Infinity) - (a.averageElo ?? -Infinity));
}
