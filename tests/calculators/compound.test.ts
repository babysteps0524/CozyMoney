import { describe, expect, test } from 'bun:test';
import { calculateCompound } from '../../src/features/calculators/compound/compound';

describe('compound calculator', () => {
  test('handles zero interest with annual contributions', () => {
    expect(
      calculateCompound({
        principal: 100,
        annualRate: 0,
        years: 3,
        annualContribution: 20,
      }),
    ).toBe(160);
  });
});
