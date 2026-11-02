import { describe, expect, test } from 'bun:test';
import {
  calculateEarnedIncomeDeduction,
  calculateEarnedIncomeTaxCredit,
  calculateIncomeTax,
  calculatePensionIncomeDeduction,
  getIncomeTaxRate,
} from '../../src/features/calculators/income-tax/income-tax';

describe('income tax calculator', () => {
  test('uses all eight 2023-and-later progressive tax brackets', () => {
    expect(getIncomeTaxRate(14_000_000)).toEqual({
      rate: 0.06,
      progressiveDeduction: 0,
    });
    expect(getIncomeTaxRate(50_000_001)).toEqual({
      rate: 0.24,
      progressiveDeduction: 5_760_000,
    });
    expect(getIncomeTaxRate(500_000_001)).toEqual({
      rate: 0.42,
      progressiveDeduction: 35_940_000,
    });
    expect(getIncomeTaxRate(1_000_000_001)).toEqual({
      rate: 0.45,
      progressiveDeduction: 65_940_000,
    });
  });

  test('calculates earned income tax credit under the statutory formula and cap', () => {
    expect(calculateEarnedIncomeTaxCredit(6_540_000, 50_000_000)).toBe(660_000);
    expect(calculateEarnedIncomeTaxCredit(1_000_000, 33_000_000)).toBe(550_000);
    expect(calculateEarnedIncomeTaxCredit(2_000_000, 40_000_000)).toBe(684_000);
  });

  test('calculates earned income and pension deductions', () => {
    expect(calculateEarnedIncomeDeduction(50_000_000)).toBe(12_250_000);
    expect(calculateEarnedIncomeDeduction(1_000_000_000)).toBe(20_000_000);
    expect(calculatePensionIncomeDeduction(10_000_000)).toBe(5_500_000);
    expect(calculatePensionIncomeDeduction(100_000_000)).toBe(9_000_000);
  });

  test('calculates income, deductions, credits and final payment', () => {
    const result = calculateIncomeTax({
      businessIncome: 10_000_000,
      wageIncome: 50_000_000,
      pensionIncome: 10_000_000,
      interestIncome: 2_000_000,
      dividendIncome: 1_000_000,
      otherIncome: 3_000_000,
      otherIncomeExpense: 1_000_000,
      dependents: 2,
      seniorDependents: 1,
      disabledDependents: 0,
      femaleAdditionalDeduction: 0,
      singleParentDeduction: 0,
      pensionInsurance: 1_000_000,
      specialIncomeDeduction: 500_000,
      otherIncomeDeduction: 500_000,
      children: 2,
      birthFirst: 1,
      birthSecond: 0,
      birthThirdPlus: 0,
      pensionAccount: 6_000_000,
      insurance: 1_000_000,
      disabledInsurance: 0,
      medicalSelfEtc: 2_000_000,
      infertilityMedical: 0,
      prematureMedical: 0,
      otherMedical: 1_000_000,
      actualReimbursement: 0,
      educationSelf: 1_000_000,
      educationDisabled: 0,
      educationPreschool: 0,
      educationSchool: 0,
      educationUniversity: 0,
      rentPayment: 6_000_000,
      standardTaxCredit: 0,
      otherTaxCredit: 0,
      withholdingTax: 1_000_000,
      prepaidTax: 500_000,
      penaltyTax: 0,
    });

    expect(result.totalIncome).toBe(57_250_000);
    expect(result.earnedIncomeDeduction).toBe(12_250_000);
    expect(result.pensionIncomeDeduction).toBe(5_500_000);
    expect(result.basicDeduction).toBe(3_000_000);
    expect(result.taxableIncome).toBe(51_250_000);
    expect(result.taxRate).toBe(0.24);
    expect(result.calculatedTax).toBe(6_540_000);
    expect(result.earnedIncomeTaxCredit).toBe(660_000);
    expect(result.childTaxCredit).toBe(850_000);
    expect(result.pensionAccountTaxCredit).toBe(720_000);
    expect(result.insuranceTaxCredit).toBe(120_000);
    expect(result.educationTaxCredit).toBe(150_000);
    expect(result.medicalTaxCredit).toBe(300_000);
    expect(result.rentTaxCredit).toBe(900_000);
    expect(result.determinedTax).toBe(2_840_000);
    expect(result.finalTax).toBe(result.determinedTax - 1_500_000);
    expect(result.finalTax).toBe(1_340_000);
  });

  test('applies the 3% threshold only to general medical expenses', () => {
    const result = calculateIncomeTax({
      businessIncome: 0,
      wageIncome: 50_000_000,
      pensionIncome: 0,
      interestIncome: 0,
      dividendIncome: 0,
      otherIncome: 0,
      otherIncomeExpense: 0,
      dependents: 1,
      seniorDependents: 0,
      disabledDependents: 0,
      femaleAdditionalDeduction: 0,
      singleParentDeduction: 0,
      pensionInsurance: 0,
      specialIncomeDeduction: 0,
      otherIncomeDeduction: 0,
      children: 0,
      birthFirst: 0,
      birthSecond: 0,
      birthThirdPlus: 0,
      pensionAccount: 0,
      insurance: 0,
      disabledInsurance: 0,
      medicalSelfEtc: 2_000_000,
      infertilityMedical: 0,
      prematureMedical: 0,
      otherMedical: 1_000_000,
      actualReimbursement: 0,
      educationSelf: 0,
      educationDisabled: 0,
      educationPreschool: 0,
      educationSchool: 0,
      educationUniversity: 0,
      rentPayment: 0,
      standardTaxCredit: 0,
      otherTaxCredit: 0,
      withholdingTax: 0,
      prepaidTax: 0,
      penaltyTax: 0,
    });

    expect(result.medicalTaxCredit).toBe(300_000);
  });

  test('caps pension account and insurance tax credits', () => {
    const result = calculateIncomeTax({
      businessIncome: 0,
      wageIncome: 40_000_000,
      pensionIncome: 0,
      interestIncome: 0,
      dividendIncome: 0,
      otherIncome: 0,
      otherIncomeExpense: 0,
      dependents: 1,
      seniorDependents: 0,
      disabledDependents: 0,
      femaleAdditionalDeduction: 0,
      singleParentDeduction: 0,
      pensionInsurance: 0,
      specialIncomeDeduction: 0,
      otherIncomeDeduction: 0,
      children: 0,
      birthFirst: 0,
      birthSecond: 0,
      birthThirdPlus: 0,
      pensionAccount: 20_000_000,
      insurance: 5_000_000,
      disabledInsurance: 5_000_000,
      medicalSelfEtc: 0,
      infertilityMedical: 0,
      prematureMedical: 0,
      otherMedical: 0,
      actualReimbursement: 0,
      educationSelf: 0,
      educationDisabled: 0,
      educationPreschool: 0,
      educationSchool: 0,
      educationUniversity: 0,
      rentPayment: 0,
      standardTaxCredit: 0,
      otherTaxCredit: 0,
      withholdingTax: 0,
      prepaidTax: 0,
      penaltyTax: 0,
    });

    expect(result.pensionAccountTaxCredit).toBe(1_350_000);
    expect(result.insuranceTaxCredit).toBe(270_000);
  });
});
