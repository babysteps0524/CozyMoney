import { describe, expect, test } from 'bun:test';
import { calculateCarTax } from '../../src/features/calculators/car-tax/car-tax';

describe('car tax calculator', () => {
  test('calculates non-business passenger car tax and education tax', () => {
    const result = calculateCarTax({
      displacementCc: 2000,
      firstRegistrationYear: null,
      taxYear: 2026,
      fuel: 'combustion',
      use: 'private',
    });

    expect(result.vehicleTax).toBe(400000);
    expect(result.educationTax).toBe(120000);
    expect(result.annualTotal).toBe(520000);
    expect(result.firstHalfTotal).toBe(260000);
    expect(result.secondHalfTotal).toBe(260000);
  });

  test('applies 15 percent age reduction in the fifth registration year', () => {
    const result = calculateCarTax({
      displacementCc: 2000,
      firstRegistrationYear: 2022,
      taxYear: 2026,
      fuel: 'combustion',
      use: 'private',
    });

    expect(result.vehicleAge).toBe(5);
    expect(result.ageReductionRate).toBe(15);
    expect(result.ageReductionAmount).toBe(60000);
    expect(result.annualTotal).toBe(442000);
  });

  test('uses fixed annual tax for a private electric passenger car', () => {
    const result = calculateCarTax({
      displacementCc: 0,
      firstRegistrationYear: 2018,
      taxYear: 2026,
      fuel: 'electric',
      use: 'private',
    });

    expect(result.vehicleTax).toBe(100000);
    expect(result.ageReductionRate).toBe(0);
    expect(result.educationTax).toBe(30000);
    expect(result.annualTotal).toBe(130000);
  });

  test('uses business passenger-car rates without age reduction', () => {
    const result = calculateCarTax({
      displacementCc: 2000,
      firstRegistrationYear: 2015,
      taxYear: 2026,
      fuel: 'combustion',
      use: 'business',
    });

    expect(result.ratePerCc).toBe(19);
    expect(result.ageReductionRate).toBe(0);
    expect(result.vehicleTax).toBe(38000);
    expect(result.annualTotal).toBe(38000);
  });

  test('rejects an invalid registration year', () => {
    expect(() =>
      calculateCarTax({
        displacementCc: 2000,
        firstRegistrationYear: 2027,
        taxYear: 2026,
        fuel: 'combustion',
        use: 'private',
      }),
    ).toThrow();
  });
});
