import { describe, expect, test } from 'bun:test';
import { calculatePercent } from '../../src/features/tools/percent/percent';

describe('percent tool', () => {
  test('calculates percent, change, discount, and increase', () => {
    expect(calculatePercent(200, 10, 'of')).toBe(20);
    expect(calculatePercent(100, 125, 'change')).toBe(25);
    expect(calculatePercent(200, 25, 'discount')).toBe(150);
    expect(calculatePercent(200, 25, 'increase')).toBe(250);
  });
});
