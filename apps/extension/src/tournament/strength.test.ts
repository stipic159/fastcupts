import { describe, expect, it } from 'vitest';
import { averageElo, medianElo } from './strength';

describe('team ELO metrics', () => {
  it('does not invent an ELO for an unknown player', () => {
    expect(averageElo([2000, 2400])).toBe(2200);
    expect(averageElo([])).toBeUndefined();
  });
  it('calculates a median', () => expect(medianElo([3000, 1000, 2000])).toBe(2000));
});
