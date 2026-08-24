import { describe, expect, it } from 'vitest';
import { seriesWinProbability, winProbability } from './probability';

describe('match probability', () => {
  it('returns 50% for equal teams', () => expect(winProbability(2000, 2000)).toBe(0.5));
  it('makes BO3 more decisive than BO1', () => expect(seriesWinProbability(0.6, 3)).toBeGreaterThan(0.6));
});
