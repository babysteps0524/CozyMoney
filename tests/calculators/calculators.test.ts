import { describe, expect, test } from 'bun:test';
import { calculateLoan } from '../../src/features/calculators/loan/loan';
import { calculateSavings } from '../../src/features/calculators/savings/savings';
import { calculateSalary } from '../../src/features/calculators/salary/salary';
import { calculatePropertyTax } from '../../src/features/calculators/property/property';
import { calculateDti } from '../../src/features/calculators/dti/dti';
import { calculateHourlyWage } from '../../src/features/calculators/hourly-wage/hourly-wage';
import { calculateAnnualLeave } from '../../src/features/calculators/vacation/vacation';
import {
  calculateSeverance,
  getSeverancePeriod,
} from '../../src/features/calculators/severance/severance';
import {
  calculateBrokerage,
  getHousingRate,
  getMonthlyLeaseAmount,
} from '../../src/features/calculators/brokerage/brokerage';

describe('calculator calculations', () => {
  test('loan calculates equal principal and interest payments', () => {
    const result = calculateLoan({
      principal: 10_000_000,
      annualRate: 4.5,
      months: 36,
    });

    expect(result.monthlyPayment).toBeGreaterThan(0);
    expect(result.totalPayment).toBeGreaterThan(10_000_000);
    expect(result.totalInterest).toBeGreaterThan(0);
  });

  test('loan supports equal principal repayment', () => {
    const result = calculateLoan({
      principal: 12_000_000,
      annualRate: 6,
      months: 12,
      repaymentType: 'equalPrincipal',
    });

    expect(result.schedule).toHaveLength(12);
    expect(result.schedule[0].payment).toBeGreaterThan(
      result.schedule[11].payment,
    );
    expect(result.totalInterest).toBeGreaterThan(0);
  });

  test('loan supports maturity repayment and prepayment fee', () => {
    const result = calculateLoan({
      principal: 10_000_000,
      annualRate: 6,
      months: 12,
      repaymentType: 'maturity',
      prepaymentMonth: 6,
      prepaymentAmount: 2_000_000,
      prepaymentFeeRate: 1,
    });

    expect(result.schedule).toHaveLength(12);
    expect(result.totalPrepayment).toBe(2_000_000);
    expect(result.totalPrepaymentFee).toBe(20_000);
    expect(result.schedule[11].remainingPrincipal).toBe(0);
  });

  test('loan supports a grace period before repayment', () => {
    const result = calculateLoan({
      principal: 10_000_000,
      annualRate: 6,
      months: 12,
      repaymentType: 'equalPrincipalInterest',
      graceMonths: 3,
    });

    expect(result.schedule[0].principalPayment).toBe(0);
    expect(result.schedule[2].principalPayment).toBe(0);
    expect(result.schedule[3].principalPayment).toBeGreaterThan(0);
  });

  test('zero-rate loan divides principal evenly', () => {
    const result = calculateLoan({
      principal: 12_000_000,
      annualRate: 0,
      months: 12,
    });

    expect(result.monthlyPayment).toBe(1_000_000);
    expect(result.totalInterest).toBe(0);
  });

  test('deposit returns principal plus after-tax interest', () => {
    const result = calculateSavings({
      type: 'deposit',
      principal: 10_000_000,
      monthlyDeposit: 0,
      annualRate: 3.5,
      months: 12,
      method: 'compound',
    });

    expect(result.principal).toBe(10_000_000);
    expect(result.interestBeforeTax).toBeGreaterThan(0);
    expect(result.tax).toBeGreaterThan(0);
    expect(result.maturityAmount).toBeGreaterThan(10_000_000);
  });

  test('installment savings uses monthly deposits', () => {
    const result = calculateSavings({
      type: 'installment',
      principal: 0,
      monthlyDeposit: 300_000,
      annualRate: 3.5,
      months: 12,
    });

    expect(result.principal).toBe(3_600_000);
    expect(result.maturityAmount).toBeGreaterThan(3_600_000);
  });

  test('salary converts annual salary and estimates take-home pay', () => {
    const result = calculateSalary({
      salary: 40_000_000,
      salaryType: 'annual',
      retirementType: 'separate',
      taxFreeMonthly: 200_000,
      dependents: 1,
      children8To20: 0,
    });

    expect(result.monthlyGross).toBeCloseTo(3_333_333.33, 2);
    expect(result.monthlyTakeHome).toBeGreaterThan(2_000_000);
    expect(result.monthlyTakeHome).toBeLessThan(result.monthlyGross);
    expect(result.totalDeductions).toBeGreaterThan(0);
  });

  test('monthly salary excludes national pension for workers aged 60 or older', () => {
    const under60 = calculateSalary({
      salary: 3_333_333,
      salaryType: 'monthly',
      retirementType: 'separate',
      taxFreeMonthly: 200_000,
      dependents: 1,
      children8To20: 0,
      age60OrOlder: false,
    });
    const age60Plus = calculateSalary({
      salary: 3_333_333,
      salaryType: 'monthly',
      retirementType: 'separate',
      taxFreeMonthly: 200_000,
      dependents: 1,
      children8To20: 0,
      age60OrOlder: true,
    });

    expect(under60.nationalPension).toBeGreaterThan(0);
    expect(age60Plus.nationalPension).toBe(0);
    expect(age60Plus.monthlyTakeHome).toBeGreaterThan(under60.monthlyTakeHome);
  });

  test('salary supports monthly input, retirement inclusion, tax-free pay and dependents', () => {
    const result = calculateSalary({
      salary: 3_333_333,
      salaryType: 'monthly',
      retirementType: 'included',
      taxFreeMonthly: 200_000,
      dependents: 4,
      children8To20: 2,
    });

    expect(result.monthlyGross).toBe(3_333_333);
    expect(result.annualSalary).toBe(43_333_329);
    expect(result.taxableMonthly).toBe(3_133_333);
    expect(result.monthlyTakeHome).toBeGreaterThan(2_000_000);
    expect(result.incomeTax).toBeGreaterThanOrEqual(0);
    expect(result.localIncomeTax).toBeCloseTo(result.incomeTax * 0.1, 6);
  });

  test('property tax applies 2026 one-household-one-home rules', () => {
    const result = calculatePropertyTax({
      year: 2026,
      oneHouseholdOneHome: true,
      taxBurdenCap: false,
      assets: [
        {
          id: '1',
          assessedValue: 500_000_000,
          ownershipShare: 100,
          urbanArea: true,
          previousPropertyTax: 0,
          previousUrbanAreaTax: 0,
        },
      ],
    });

    expect(result.assets[0].taxableBase).toBe(220_000_000);
    expect(result.assets[0].propertyTax).toBe(260_000);
    expect(result.assets[0].urbanAreaTax).toBe(308_000);
    expect(result.assets[0].localEducationTax).toBe(52_000);
    expect(result.total).toBe(620_000);
  });

  test('property tax supports multiple homes and ownership share', () => {
    const result = calculatePropertyTax({
      year: 2026,
      oneHouseholdOneHome: false,
      taxBurdenCap: false,
      assets: [
        {
          id: '1',
          assessedValue: 300_000_000,
          ownershipShare: 100,
          urbanArea: false,
          previousPropertyTax: 0,
          previousUrbanAreaTax: 0,
        },
        {
          id: '2',
          assessedValue: 400_000_000,
          ownershipShare: 50,
          urbanArea: false,
          previousPropertyTax: 0,
          previousUrbanAreaTax: 0,
        },
      ],
    });

    expect(result.assets).toHaveLength(2);
    expect(result.assets[1].taxableBase).toBe(120_000_000);
    expect(result.propertyTax).toBeGreaterThan(0);
  });

  test('DTI calculates annual mortgage payment and target headroom', () => {
    const result = calculateDti({
      annualIncome: 50_000_000,
      mortgageAmount: 300_000_000,
      mortgageRate: 4,
      mortgageYears: 30,
      mortgageMethod: 'equalPayment',
      otherDebtAmount: 50_000_000,
      otherDebtRate: 5,
      targetDti: 40,
    });

    expect(result.annualMortgagePayment).toBeGreaterThan(17_000_000);
    expect(result.annualOtherInterest).toBe(2_500_000);
    expect(result.dti).toBeGreaterThan(35);
    expect(result.dti).toBeLessThan(40);
    expect(result.withinTarget).toBe(true);
    expect(result.headroom).toBeGreaterThan(0);
  });

  test('DTI supports equal-principal and maturity repayment methods', () => {
    const equalPrincipal = calculateDti({
      annualIncome: 60_000_000,
      mortgageAmount: 240_000_000,
      mortgageRate: 6,
      mortgageYears: 20,
      mortgageMethod: 'equalPrincipal',
      otherDebtAmount: 0,
      otherDebtRate: 0,
      targetDti: 40,
    });
    const maturity = calculateDti({
      annualIncome: 60_000_000,
      mortgageAmount: 240_000_000,
      mortgageRate: 6,
      mortgageYears: 20,
      mortgageMethod: 'maturity',
      otherDebtAmount: 0,
      otherDebtRate: 0,
      targetDti: 40,
    });

    expect(equalPrincipal.annualMortgagePayment).toBeGreaterThan(
      maturity.annualMortgagePayment,
    );
    expect(maturity.annualMortgagePayment).toBe(14_400_000);
  });

  test('brokerage uses housing sale rate and statutory cap', () => {
    expect(getHousingRate('sale', 40_000_000)).toEqual({
      rate: 0.6,
      cap: 250_000,
    });

    const result = calculateBrokerage({
      transaction: 'sale',
      property: 'house',
      amount: 40_000_000,
      vatRate: 10,
    });

    expect(result.transactionAmount).toBe(40_000_000);
    expect(result.brokerageFee).toBe(240_000);
    expect(result.vat).toBe(24_000);
    expect(result.total).toBe(264_000);
    expect(result.capped).toBe(false);
  });

  test('brokerage applies the 800000 won cap for the 50m to 200m sale range', () => {
    const result = calculateBrokerage({
      transaction: 'sale',
      property: 'house',
      amount: 150_000_000,
      vatRate: 10,
    });

    expect(result.brokerageFee).toBe(750_000);
    expect(result.capped).toBe(false);
  });

  test('brokerage converts monthly rent transaction amount', () => {
    expect(getMonthlyLeaseAmount(10_000_000, 300_000)).toBe(31_000_000);
    expect(getMonthlyLeaseAmount(30_000_000, 300_000)).toBe(60_000_000);

    const result = calculateBrokerage({
      transaction: 'monthly',
      property: 'house',
      amount: 31_000_000,
      vatRate: 10,
    });

    expect(result.rate).toBe(0.5);
    expect(result.brokerageFee).toBe(155_000);
  });

  test('brokerage supports officetel and presale rules', () => {
    const officetel = calculateBrokerage({
      transaction: 'sale',
      property: 'officetel',
      amount: 300_000_000,
      officetelEligible: true,
      vatRate: 0,
    });

    const presale = calculateBrokerage({
      transaction: 'sale',
      property: 'presale',
      amount: 0,
      paidAmount: 200_000_000,
      premium: 30_000_000,
      vatRate: 0,
    });

    expect(officetel.rate).toBe(0.5);
    expect(officetel.brokerageFee).toBe(1_500_000);
    expect(presale.transactionAmount).toBe(230_000_000);
    expect(presale.rate).toBe(0.4);
    expect(presale.brokerageFee).toBe(920_000);
  });

  test('severance calculates the statutory formula from the previous three months', () => {
    const period = getSeverancePeriod('2026-10-01');

    expect(period.start).toBe('2026-07-01');
    expect(period.end).toBe('2026-09-30');
    expect(period.days).toBe(92);

    const result = calculateSeverance({
      startDate: '2021-10-01',
      retirementDate: '2026-10-01',
      monthlyWages: [3_000_000, 3_000_000, 3_000_000],
      annualBonus: 1_200_000,
      annualLeaveAllowance: 400_000,
      weeklyHours: 40,
    });

    expect(result.serviceDays).toBe(1826);
    expect(result.threeMonthWages).toBe(9_000_000);
    expect(result.bonusIncluded).toBe(300_000);
    expect(result.leaveAllowanceIncluded).toBe(100_000);
    expect(result.averageWageAmount).toBe(9_400_000);
    expect(result.averageDailyWage).toBeCloseTo(102_173.913, 3);
    expect(result.appliedBasis).toBe('average');
    expect(result.severancePay).toBeCloseTo(15_334_484.81, 2);
    expect(result.eligible).toBe(true);
  });

  test('severance uses ordinary daily wage when it is higher', () => {
    const result = calculateSeverance({
      startDate: '2024-01-01',
      retirementDate: '2026-10-01',
      monthlyWages: [2_000_000, 2_000_000, 2_000_000],
      annualBonus: 0,
      annualLeaveAllowance: 0,
      ordinaryDailyWage: 100_000,
      weeklyHours: 40,
    });

    expect(result.averageDailyWage).toBeCloseTo(65_217.391, 3);
    expect(result.appliedDailyWage).toBe(100_000);
    expect(result.appliedBasis).toBe('ordinary');
    expect(result.severancePay).toBeCloseTo(8_252_054.795, 3);
  });

  test('severance checks one-year and weekly-hours eligibility', () => {
    const shortService = calculateSeverance({
      startDate: '2026-01-01',
      retirementDate: '2026-12-31',
      monthlyWages: [2_000_000, 2_000_000, 2_000_000],
      annualBonus: 0,
      annualLeaveAllowance: 0,
      weeklyHours: 40,
    });
    const shortHours = calculateSeverance({
      startDate: '2024-01-01',
      retirementDate: '2026-10-01',
      monthlyWages: [2_000_000, 2_000_000, 2_000_000],
      annualBonus: 0,
      annualLeaveAllowance: 0,
      weeklyHours: 14,
    });

    expect(shortService.eligible).toBe(false);
    expect(shortService.severancePay).toBe(0);
    expect(shortHours.eligible).toBe(false);
    expect(shortHours.severancePay).toBe(0);
  });

  test('severance excludes configured average-wage days and wages', () => {
    const result = calculateSeverance({
      startDate: '2024-01-01',
      retirementDate: '2026-10-01',
      monthlyWages: [3_000_000, 3_000_000, 3_000_000],
      annualBonus: 0,
      annualLeaveAllowance: 0,
      weeklyHours: 40,
      excludedAverageWageDays: 10,
      excludedAverageWageAmount: 300_000,
    });

    expect(result.averageWagePeriodDays).toBe(92);
    expect(result.averageWageAmount).toBe(8_700_000);
    expect(result.averageDailyWage).toBeCloseTo(106_097.5609, 3);
  });

  test('hourly wage supports weekly holiday, overtime, tax and probation', () => {
    const result = calculateHourlyWage({
      payType: 'hourly',
      amount: 12_000,
      dailyHours: 8,
      weeklyDays: 5,
      monthlyDays: 22,
      weeklyOvertimeHours: 2,
      monthlyOvertimeHours: 4,
      weeklyHolidayIncluded: true,
      taxType: 'insurance',
      probation: false,
    });

    expect(result.hourlyWage).toBe(12_000);
    expect(result.dailyWage).toBe(96_000);
    expect(result.weeklyWage).toBe(480_000);
    expect(result.weeklyHolidayPay).toBeGreaterThan(0);
    expect(result.weeklyOvertimePay).toBeGreaterThan(0);
    expect(result.monthlyOvertimePay).toBe(72_000);
    expect(result.grossMonthlyWage).toBeGreaterThan(result.monthlyBaseWage);
    expect(result.tax).toBeCloseTo(result.grossMonthlyWage * 0.097174, 6);
    expect(result.netMonthlyWage).toBeLessThan(result.grossMonthlyWage);
  });

  test('hourly wage supports daily, weekly, monthly and annual pay inputs', () => {
    const daily = calculateHourlyWage({
      payType: 'daily',
      amount: 100_000,
      dailyHours: 8,
      weeklyDays: 5,
      monthlyDays: 22,
      weeklyOvertimeHours: 0,
      monthlyOvertimeHours: 0,
      weeklyHolidayIncluded: false,
      taxType: 'none',
      probation: false,
    });
    const weekly = calculateHourlyWage({
      ...dailyInput(),
      payType: 'weekly',
      amount: 500_000,
    });
    const monthly = calculateHourlyWage({
      ...dailyInput(),
      payType: 'monthly',
      amount: 2_000_000,
    });
    const annual = calculateHourlyWage({
      ...dailyInput(),
      payType: 'annual',
      amount: 24_000_000,
    });

    expect(daily.hourlyWage).toBe(12_500);
    expect(weekly.hourlyWage).toBe(12_500);
    expect(monthly.monthlyBaseWage).toBe(2_000_000);
    expect(annual.monthlyBaseWage).toBe(2_000_000);
  });

  function dailyInput() {
    return {
      payType: 'hourly' as const,
      amount: 12_000,
      dailyHours: 8,
      weeklyDays: 5,
      monthlyDays: 22,
      weeklyOvertimeHours: 0,
      monthlyOvertimeHours: 0,
      weeklyHolidayIncluded: false,
      taxType: 'none' as const,
      probation: false,
    };
  }

  test('annual leave allowance calculates unused leave and ordinary wage', () => {
    const result = calculateAnnualLeave({
      basis: 'hire-date',
      startDate: '2022-10-01',
      calculationDate: '2026-10-05',
      usedDays: 5,
      dailyHours: 8,
      weeklyDays: 5,
      weeklyHours: 40,
      monthlyBasePay: 3_000_000,
      monthlyFixedAllowance: 200_000,
      annualBonus: 1_200_000,
    });

    expect(result.leaveDays).toBe(16);
    expect(result.unusedDays).toBe(11);
    expect(result.monthlyHours).toBeCloseTo(208.5714, 2);
    expect(result.monthlyOrdinaryWage).toBe(3_300_000);
    expect(result.hourlyOrdinaryWage).toBeCloseTo(15_821.9178, 2);
    expect(result.dailyOrdinaryWage).toBeCloseTo(126_575.3425, 2);
    expect(result.allowance).toBeCloseTo(1_392_328.7671, 2);
  });

  test('annual leave allowance supports fiscal-year first-year prorating', () => {
    const result = calculateAnnualLeave({
      basis: 'fiscal-year',
      startDate: '2025-10-01',
      calculationDate: '2026-10-05',
      usedDays: 0,
      dailyHours: 8,
      weeklyDays: 5,
      weeklyHours: 40,
      monthlyBasePay: 3_000_000,
      monthlyFixedAllowance: 0,
      annualBonus: 0,
    });

    expect(result.proratedFirstYearDays).toBeCloseTo(3.7808, 3);
    expect(result.leaveDays).toBeCloseTo(29.7808, 3);
  });

  test('annual leave allowance excludes weekly hours below 15', () => {
    const result = calculateAnnualLeave({
      basis: 'hire-date',
      startDate: '2025-01-01',
      calculationDate: '2026-01-01',
      usedDays: 0,
      dailyHours: 4,
      weeklyDays: 3,
      weeklyHours: 12,
      monthlyBasePay: 1_000_000,
      monthlyFixedAllowance: 0,
      annualBonus: 0,
    });

    expect(result.leaveDays).toBe(0);
    expect(result.unusedDays).toBe(0);
    expect(result.allowance).toBe(0);
  });
});
