import { describe, expect, test } from 'bun:test';
import { calculateCapitalGain } from '../../src/features/calculators/capital-gain/capital-gain';

const base = {
  salePrice: 700_000_000,
  purchasePrice: 500_000_000,
  costs: 10_000_000,
  acquisitionDate: '2018-01-01',
  saleDate: '2026-10-16',
  residenceYears: 2,
  householdHomeCount: 1,
  isDomesticHome: true,
  isRegulatedArea: false,
  acquiredInRegulatedAreaAfter2017: false,
  isSingleHouseholdHome: true,
  hasSpecialExemption: false,
};

describe('capital gains tax calculator', () => {
  test('applies estimated one-household home exemption for a qualifying home below the threshold', () => {
    const result = calculateCapitalGain(base);
    expect(result.exemptAsSingleHome).toBe(true);
    expect(result.totalEstimatedTax).toBe(0);
    expect(result.ruleVersion).toBe('kr-2026');
  });

  test('shows loss and does not calculate positive tax for a loss transaction', () => {
    const result = calculateCapitalGain({
      ...base,
      salePrice: 300_000_000,
      purchasePrice: 320_000_000,
      costs: 10_000_000,
    });
    expect(result.gain).toBe(-30_000_000);
    expect(result.totalEstimatedTax).toBe(0);
  });

  test('calculates ordinary progressive tax and long-term deduction for a non-exempt sale', () => {
    const result = calculateCapitalGain({
      ...base,
      isSingleHouseholdHome: false,
    });
    expect(result.exemptAsSingleHome).toBe(false);
    expect(result.longTermDeductionRate).toBeCloseTo(0.16);
    expect(result.taxableIncome).toBeGreaterThan(0);
    expect(result.capitalGainsTax).toBeGreaterThan(0);
    expect(result.localIncomeTax).toBeCloseTo(result.capitalGainsTax * 0.1);
    expect(result.totalEstimatedTax).toBeCloseTo(
      result.capitalGainsTax + result.localIncomeTax,
    );
  });

  test('flags multi-home surcharge for a regulated-area sale after its effective date', () => {
    const result = calculateCapitalGain({
      ...base,
      householdHomeCount: 2,
      isSingleHouseholdHome: false,
      isRegulatedArea: true,
    });
    expect(result.multiHomeSurchargeApplied).toBe(true);
    expect(result.longTermDeductionRate).toBe(0);
    expect(
      result.warnings.some((warning) => warning.includes('다주택 중과')),
    ).toBe(true);
  });

  test('selects the 2026 rule version for a spring sale date', () => {
    expect(
      calculateCapitalGain({ ...base, saleDate: '2026-03-01' }).ruleVersion,
    ).toBe('kr-2026');
  });

  test('does not silently reuse 2026 rules for a future tax year', () => {
    expect(() =>
      calculateCapitalGain({ ...base, saleDate: '2027-01-01' }),
    ).toThrow();
  });
});
