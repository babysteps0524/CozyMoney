import { describe, expect, test } from 'bun:test';
import { calculateVat } from '../../src/features/calculators/vat/vat';

describe('VAT calculator', () => {
  test('derives supply, tax, and total from a supply amount', () => {
    expect(
      calculateVat({ mode: 'supply', amount: 100, ratePercent: 10 }),
    ).toEqual({ supply: 100, tax: 10, total: 110, payable: 0 });
  });
});
