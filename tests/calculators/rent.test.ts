import { describe, expect, test } from 'bun:test';
import {
  calculateJeonseToWolse,
  calculateRentCost,
  calculateWolseToJeonse,
} from '../../src/features/calculators/rent/rent';

describe('rent calculator', () => {
  test('combines annual rent and deposit return', () => {
    expect(
      calculateRentCost({ deposit: 1000, depositRate: 5, monthlyRent: 50 }),
    ).toEqual({
      annualizedMonthlyRent: 600,
      annualDepositReturn: 50,
      annualCost: 650,
      monthlyDepositReturn: 50 / 12,
      monthlyEquivalentCost: 650 / 12,
    });
  });

  test('converts jeonse deposit difference to monthly rent', () => {
    expect(
      calculateJeonseToWolse({
        jeonseDeposit: 200_000_000,
        monthlyDeposit: 100_000_000,
        conversionRate: 5,
      }),
    ).toBeCloseTo(416_666.6667, 3);
  });

  test('rejects a monthly deposit higher than the original jeonse deposit', () => {
    expect(
      calculateJeonseToWolse({
        jeonseDeposit: 100_000_000,
        monthlyDeposit: 120_000_000,
        conversionRate: 5,
      }),
    ).toBeNull();
  });

  test('converts monthly rent to an estimated jeonse deposit', () => {
    expect(
      calculateWolseToJeonse({
        deposit: 50_000_000,
        monthlyRent: 500_000,
        conversionRate: 5,
      }),
    ).toBe(170_000_000);
  });

  test('requires a positive rate for monthly-rent-to-jeonse conversion', () => {
    expect(
      calculateWolseToJeonse({
        deposit: 50_000_000,
        monthlyRent: 500_000,
        conversionRate: 0,
      }),
    ).toBeNull();
  });
});
