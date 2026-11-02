import { describe, expect, test } from 'bun:test';
import { calculateAcquisitionTax } from '../../src/features/calculators/acquisition/acquisition';

describe('acquisition tax calculations', () => {
  test('calculates a non-heavy-tax 500 million won house purchase', () => {
    const result = calculateAcquisitionTax({
      price: 500_000_000,
      cause: 'purchase',
      asset: 'house',
      houseCount: 1,
      regulatedArea: false,
      areaOver85: false,
      corporation: false,
      firstHome: false,
      firstHomePopulationDecline: false,
    });

    expect(result.acquisitionRate).toBe(0.01);
    expect(result.acquisitionTax).toBe(5_000_000);
    expect(result.localEducationTax).toBe(500_000);
    expect(result.totalTax).toBe(5_500_000);
  });

  test('calculates 8 percent heavy tax for a second home in a regulated area', () => {
    const result = calculateAcquisitionTax({
      price: 700_000_000,
      cause: 'purchase',
      asset: 'house',
      houseCount: 2,
      regulatedArea: true,
      areaOver85: true,
      corporation: false,
      firstHome: false,
      firstHomePopulationDecline: false,
    });

    expect(result.acquisitionRate).toBe(0.08);
    expect(result.acquisitionTax).toBe(56_000_000);
    expect(result.localEducationTax).toBe(2_800_000);
    expect(result.ruralSpecialTax).toBe(4_200_000);
    expect(result.totalTax).toBe(63_000_000);
  });

  test('calculates the 6 to 9 hundred million won progressive rate', () => {
    const result = calculateAcquisitionTax({
      price: 750_000_000,
      cause: 'purchase',
      asset: 'house',
      houseCount: 1,
      regulatedArea: false,
      areaOver85: false,
      corporation: false,
      firstHome: false,
      firstHomePopulationDecline: false,
    });

    expect(result.acquisitionRate).toBe(0.02);
    expect(result.acquisitionTax).toBe(15_000_000);
  });

  test('applies the first-home reduction limit', () => {
    const result = calculateAcquisitionTax({
      price: 500_000_000,
      cause: 'purchase',
      asset: 'house',
      houseCount: 1,
      regulatedArea: false,
      areaOver85: false,
      corporation: false,
      firstHome: true,
      firstHomePopulationDecline: false,
    });

    expect(result.firstHomeReduction).toBe(2_000_000);
    expect(result.acquisitionTax).toBe(3_000_000);
  });

  test('uses standard gift tax for non-heavy-tax gift input', () => {
    const result = calculateAcquisitionTax({
      price: 500_000_000,
      cause: 'gift',
      asset: 'house',
      houseCount: 1,
      regulatedArea: false,
      areaOver85: false,
      corporation: false,
      firstHome: false,
      firstHomePopulationDecline: false,
    });

    expect(result.acquisitionRate).toBe(0.035);
    expect(result.acquisitionTax).toBe(17_500_000);
    expect(result.localEducationTax).toBe(1_500_000);
  });

  test('uses the 4 percent base rate for non-house property purchases', () => {
    const result = calculateAcquisitionTax({
      price: 300_000_000,
      cause: 'purchase',
      asset: 'officetel',
      houseCount: 1,
      regulatedArea: false,
      areaOver85: false,
      corporation: false,
      firstHome: false,
      firstHomePopulationDecline: false,
    });

    expect(result.acquisitionRate).toBe(0.04);
    expect(result.acquisitionTax).toBe(12_000_000);
  });
});
