import { describe, expect, test } from 'bun:test';
import { calculateLeaseLoan } from '../../src/features/calculators/lease-loan/lease-loan';

describe('lease loan calculator', () => {
  test('calculates interest-only repayment and returns the monthly schedule', () => {
    const estimate = calculateLeaseLoan({
      deposit: 200_000_000,
      loanRatio: 80,
      annualRate: 3.5,
      termMonths: 24,
      repaymentType: 'interest-only',
    });

    expect(estimate).toMatchObject({
      loanAmount: 160_000_000,
      ownFunds: 40_000_000,
      monthlyInterest: 466667,
      monthlyPayment: 466667,
      annualInterest: 5_600_000,
      totalInterest: 11_200_008,
      totalPayment: 171_200_008,
      estimatedGuaranteeFee: 0,
      totalEstimatedOutflow: 171_200_008,
      repaymentType: 'interest-only',
    });
    expect(estimate.schedule).toHaveLength(24);
    expect(estimate.schedule[0]).toEqual({
      month: 1,
      principalPayment: 0,
      interestPayment: 466667,
      totalPayment: 466667,
      remainingPrincipal: 160_000_000,
    });
    expect(estimate.schedule[23]?.principalPayment).toBe(160_000_000);
    expect(estimate.schedule[23]?.remainingPrincipal).toBe(0);
  });

  test('calculates equal payments and reduces the outstanding principal', () => {
    const estimate = calculateLeaseLoan({
      deposit: 1_000_000,
      loanRatio: 100,
      annualRate: 12,
      termMonths: 12,
      repaymentType: 'equal-payment',
    });

    expect(estimate.schedule).toHaveLength(12);
    expect(estimate.monthlyPayment).toBeGreaterThan(88_000);
    expect(estimate.monthlyPayment).toBeLessThan(90_000);
    expect(estimate.schedule[0]!.remainingPrincipal).toBeLessThan(1_000_000);
    expect(estimate.schedule[11]?.remainingPrincipal).toBe(0);
    expect(estimate.totalInterest).toBeGreaterThan(0);
    expect(estimate.totalPayment).toBeGreaterThan(1_000_000);
  });

  test('matches displayed monthly payments to rounded schedule rows', () => {
    const input = {
      deposit: 1_001,
      loanRatio: 100,
      annualRate: 3.7,
      termMonths: 17,
      repaymentType: 'equal-payment' as const,
    };
    const estimate = calculateLeaseLoan(input);

    expect(estimate.monthlyPayment).toBe(60);
    expect(estimate.monthlyPayment).toBe(estimate.schedule[0]?.totalPayment);

    estimate.rateComparisons.forEach((comparison) => {
      const comparisonEstimate = calculateLeaseLoan({
        ...input,
        annualRate: comparison.annualRate,
      });

      expect(comparison.monthlyPayment).toBe(
        comparisonEstimate.schedule[0]?.totalPayment,
      );
    });
  });

  test('estimates a user-entered annual guarantee fee rate over the loan term', () => {
    const estimate = calculateLeaseLoan({
      deposit: 200_000_000,
      loanRatio: 80,
      annualRate: 3.5,
      termMonths: 24,
      repaymentType: 'interest-only',
      annualGuaranteeFeeRate: 0.5,
    });

    expect(estimate.annualGuaranteeFeeRate).toBe(0.5);
    expect(estimate.estimatedGuaranteeFee).toBe(1_600_000);
    expect(estimate.totalEstimatedOutflow).toBe(172_800_008);
  });

  test('compares the current rate with rates increased by 0.5 and 1.0 percentage points', () => {
    const estimate = calculateLeaseLoan({
      deposit: 200_000_000,
      loanRatio: 80,
      annualRate: 3.5,
      termMonths: 24,
      repaymentType: 'interest-only',
    });

    expect(estimate.rateComparisons).toEqual([
      {
        increasePercentagePoints: 0.5,
        annualRate: 4,
        monthlyPayment: 533333,
        totalInterest: 12_799_992,
        totalPayment: 172_799_992,
      },
      {
        increasePercentagePoints: 1,
        annualRate: 4.5,
        monthlyPayment: 600000,
        totalInterest: 14_400_000,
        totalPayment: 174_400_000,
      },
    ]);
  });

  test('keeps monthly interest separate from principal for a one-month interest-only loan', () => {
    const estimate = calculateLeaseLoan({
      deposit: 1_000_000,
      loanRatio: 100,
      annualRate: 12,
      termMonths: 1,
      repaymentType: 'interest-only',
    });

    expect(estimate.monthlyPayment).toBe(10_000);
    expect(estimate.schedule[0]?.interestPayment).toBe(10_000);
    expect(estimate.schedule[0]?.principalPayment).toBe(1_000_000);
    expect(estimate.schedule[0]?.totalPayment).toBe(1_010_000);
  });

  test('handles a zero-interest equal-payment loan', () => {
    const estimate = calculateLeaseLoan({
      deposit: 1_200,
      loanRatio: 100,
      annualRate: 0,
      termMonths: 12,
      repaymentType: 'equal-payment',
    });

    expect(estimate.monthlyPayment).toBe(100);
    expect(estimate.totalInterest).toBe(0);
    expect(estimate.totalPayment).toBe(1_200);
    expect(estimate.schedule[0]?.principalPayment).toBe(100);
    expect(estimate.schedule[11]?.remainingPrincipal).toBe(0);
  });

  test('does not allow the estimated loan ratio to exceed 100%', () => {
    const estimate = calculateLeaseLoan({
      deposit: 1_000,
      loanRatio: 120,
      annualRate: 5,
      termMonths: 12,
      repaymentType: 'interest-only',
    });

    expect(estimate.loanAmount).toBe(1_000);
    expect(estimate.ownFunds).toBe(0);
  });

  test('treats negative inputs as zero', () => {
    const estimate = calculateLeaseLoan({
      deposit: -1_000,
      loanRatio: -80,
      annualRate: -5,
      termMonths: -12,
      repaymentType: 'interest-only',
      annualGuaranteeFeeRate: -0.5,
    });

    expect(estimate.loanAmount).toBe(0);
    expect(estimate.ownFunds).toBe(0);
    expect(estimate.totalInterest).toBe(0);
    expect(estimate.estimatedGuaranteeFee).toBe(0);
    expect(estimate.schedule).toHaveLength(0);
  });

  test('caps the schedule at 600 months and the guarantee fee rate at 100%', () => {
    const estimate = calculateLeaseLoan({
      deposit: 1_000,
      loanRatio: 100,
      annualRate: 1,
      termMonths: 900,
      repaymentType: 'interest-only',
      annualGuaranteeFeeRate: 150,
    });

    expect(estimate.schedule).toHaveLength(600);
    expect(estimate.annualGuaranteeFeeRate).toBe(100);
  });

  test('keeps displayed schedule rows and aggregate totals consistent after rounding', () => {
    const estimate = calculateLeaseLoan({
      deposit: 200_000_000,
      loanRatio: 80,
      annualRate: 3.5,
      termMonths: 24,
      repaymentType: 'interest-only',
    });

    expect(estimate.totalInterest).toBe(
      estimate.schedule.reduce((sum, row) => sum + row.interestPayment, 0),
    );
    expect(estimate.totalPayment).toBe(
      estimate.schedule.reduce((sum, row) => sum + row.totalPayment, 0),
    );
    estimate.schedule.forEach((row) => {
      expect(row.totalPayment).toBe(row.principalPayment + row.interestPayment);
    });
  });

  test('returns zero totals and no schedule for a zero-month term', () => {
    const estimate = calculateLeaseLoan({
      deposit: 1_000_000,
      loanRatio: 80,
      annualRate: 5,
      termMonths: 0,
      repaymentType: 'equal-payment',
    });

    expect(estimate.schedule).toHaveLength(0);
    expect(estimate.monthlyPayment).toBe(0);
    expect(estimate.totalInterest).toBe(0);
    expect(estimate.totalPayment).toBe(0);
    expect(estimate.estimatedGuaranteeFee).toBe(0);
  });

  test('treats non-finite numeric inputs as zero', () => {
    const estimate = calculateLeaseLoan({
      deposit: Number.NaN,
      loanRatio: Number.POSITIVE_INFINITY,
      annualRate: Number.NaN,
      termMonths: Number.POSITIVE_INFINITY,
      repaymentType: 'interest-only',
      annualGuaranteeFeeRate: Number.NaN,
    });

    expect(estimate.loanAmount).toBe(0);
    expect(estimate.ownFunds).toBe(0);
    expect(estimate.annualInterest).toBe(0);
    expect(estimate.totalInterest).toBe(0);
    expect(estimate.estimatedGuaranteeFee).toBe(0);
    expect(estimate.schedule).toHaveLength(0);
  });
});
