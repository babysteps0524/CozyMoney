export type SalaryType = 'annual' | 'monthly';
export type RetirementType = 'separate' | 'included';

export interface SalaryInput {
  salary: number;
  salaryType: SalaryType;
  retirementType: RetirementType;
  taxFreeMonthly: number;
  dependents: number;
  children8To20: number;
  age60OrOlder?: boolean;
}

export interface SalaryResult {
  annualSalary: number;
  monthlyGross: number;
  taxableMonthly: number;
  nationalPension: number;
  healthInsurance: number;
  longTermCare: number;
  employmentInsurance: number;
  incomeTax: number;
  localIncomeTax: number;
  totalDeductions: number;
  monthlyTakeHome: number;
  annualTakeHome: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function earnedIncomeDeduction(annualGross: number): number {
  const income = Math.max(0, annualGross);
  if (income <= 5_000_000) return income * 0.7;
  if (income <= 15_000_000) return 3_500_000 + (income - 5_000_000) * 0.4;
  if (income <= 45_000_000) return 7_500_000 + (income - 15_000_000) * 0.15;
  if (income <= 100_000_000) return 12_000_000 + (income - 45_000_000) * 0.05;
  return Math.min(20_000_000, 14_750_000 + (income - 100_000_000) * 0.02);
}

function progressiveIncomeTax(taxBase: number): number {
  const base = Math.max(0, taxBase);
  if (base <= 14_000_000) return base * 0.06;
  if (base <= 50_000_000) return base * 0.15 - 1_260_000;
  if (base <= 88_000_000) return base * 0.24 - 5_760_000;
  if (base <= 150_000_000) return base * 0.35 - 15_440_000;
  if (base <= 300_000_000) return base * 0.38 - 19_940_000;
  if (base <= 500_000_000) return base * 0.4 - 25_940_000;
  if (base <= 1_000_000_000) return base * 0.42 - 35_940_000;
  return base * 0.45 - 65_940_000;
}

/**
 * 연봉/월급을 2026년 근로자 부담률을 참고해 세전 급여와 공제액으로 단순 추정합니다.
 * 소득세는 국세청 근로소득 간이세액표와 동일한 결과를 보장하지 않습니다.
 */
export function calculateSalary(input: SalaryInput): SalaryResult {
  if (input.salary <= 0) throw new Error('연봉 또는 월급은 0보다 커야 합니다.');

  const salary = Math.max(0, input.salary);
  const annualSalary =
    input.salaryType === 'annual'
      ? salary
      : input.retirementType === 'included'
        ? salary * 13
        : salary * 12;

  const monthlyGross =
    input.salaryType === 'annual'
      ? annualSalary / (input.retirementType === 'included' ? 13 : 12)
      : salary;

  const taxFreeMonthly = clamp(
    Math.max(0, input.taxFreeMonthly),
    0,
    monthlyGross,
  );
  const taxableMonthly = Math.max(0, monthlyGross - taxFreeMonthly);

  // 2026년 기준 근로자 부담률을 적용한 참고용 추정.
  // 만 60세 이상은 국민연금 의무가입 대상이 아니라는 안내를 반영합니다.
  const pensionBase = clamp(taxableMonthly, 400_000, 6_370_000);
  const nationalPension = input.age60OrOlder ? 0 : pensionBase * 0.0475;
  const healthBase = Math.min(taxableMonthly, 127_725_730);
  const healthInsurance = healthBase * 0.03595;
  const longTermCare = healthInsurance * 0.1314;
  const employmentInsurance = taxableMonthly * 0.009;

  const dependents = Math.max(1, Math.floor(input.dependents));
  const children = clamp(Math.floor(input.children8To20), 0, dependents - 1);
  const annualTaxableSalary = taxableMonthly * 12;
  const earnedIncome = Math.max(
    0,
    annualTaxableSalary - earnedIncomeDeduction(annualTaxableSalary),
  );
  const personalDeduction = dependents * 1_500_000;
  const pensionDeduction = nationalPension * 12;
  const taxBase = Math.max(
    0,
    earnedIncome - personalDeduction - pensionDeduction,
  );
  const childCredit =
    children === 0
      ? 0
      : children === 1
        ? 150_000
        : children === 2
          ? 450_000
          : 450_000 + (children - 2) * 300_000;
  const annualIncomeTax = Math.max(
    0,
    progressiveIncomeTax(taxBase) - childCredit,
  );
  const incomeTax = annualIncomeTax / 12;
  const localIncomeTax = incomeTax * 0.1;

  const totalDeductions =
    nationalPension +
    healthInsurance +
    longTermCare +
    employmentInsurance +
    incomeTax +
    localIncomeTax;
  const monthlyTakeHome = Math.max(0, monthlyGross - totalDeductions);

  return {
    annualSalary,
    monthlyGross,
    taxableMonthly,
    nationalPension,
    healthInsurance,
    longTermCare,
    employmentInsurance,
    incomeTax,
    localIncomeTax,
    totalDeductions,
    monthlyTakeHome,
    annualTakeHome: monthlyTakeHome * 12,
  };
}

export function formatWon(value: number): string {
  return `${Math.round(value).toLocaleString('ko-KR')}원`;
}
