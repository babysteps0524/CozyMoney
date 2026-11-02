import { describe, expect, test } from 'bun:test';
import { calculateDsr } from '../../src/features/calculators/dsr/dsr';

describe('DSR calculator', () => {
  test('calculates current and total annual debt ratios', () => {
    expect(
      calculateDsr({
        annualIncome: 100,
        existingAnnualDebt: 20,
        newAnnualDebt: 10,
      }),
    ).toEqual({ currentDsr: 20, totalDsr: 30 });
  });
});
