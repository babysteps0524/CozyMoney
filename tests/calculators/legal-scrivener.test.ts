import { describe, expect, test } from 'bun:test';
import {
  calculateLegalScrivenerFee,
  calculateRealEstateBasicFee,
  calculateStampTax,
} from '../../src/features/calculators/legal-scrivener/legal-scrivener';

describe('legal scrivener fee calculator', () => {
  test('calculates the progressive real estate registration fee', () => {
    expect(calculateRealEstateBasicFee('ownership', 400_000_000)).toBe(520_000);
    expect(calculateRealEstateBasicFee('ownership', 50_000_000)).toBe(210_000);
    expect(calculateRealEstateBasicFee('ownership', 100_000_000)).toBe(260_000);
  });

  test('uses the separate additional collateral fee table', () => {
    expect(
      calculateRealEstateBasicFee('additionalCollateral', 400_000_000),
    ).toBe(220_000);
  });

  test('calculates stamp tax with the housing 100 million won exemption', () => {
    expect(calculateStampTax('house', 100_000_000)).toBe(0);
    expect(calculateStampTax('building', 100_000_000)).toBe(70_000);
    expect(calculateStampTax('building', 600_000_000)).toBe(150_000);
  });

  test('calculates a typical house ownership transfer estimate', () => {
    const result = calculateLegalScrivenerFee({
      property: 'house',
      fees: [{ id: '1', type: 'ownership', taxableBase: 400_000_000 }],
      statedAmount: 600_000_000,
      includePublicCosts: true,
      includeVat: true,
    });

    expect(result.baseFee).toBe(520_000);
    expect(result.vat).toBe(52_000);
    expect(result.stampTax).toBe(150_000);
    expect(result.registrationFee).toBe(18_000);
    expect(result.total).toBe(740_000);
  });

  test('supports multiple registration items', () => {
    const result = calculateLegalScrivenerFee({
      property: 'house',
      fees: [
        { id: '1', type: 'ownership', taxableBase: 400_000_000 },
        { id: '2', type: 'additionalCollateral', taxableBase: 400_000_000 },
      ],
      statedAmount: 600_000_000,
      includePublicCosts: true,
      includeVat: false,
    });

    expect(result.baseFee).toBe(740_000);
    expect(result.total).toBe(908_000);
  });
});
