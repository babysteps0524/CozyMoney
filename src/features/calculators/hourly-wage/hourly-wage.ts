export type HourlyPayType =
  'hourly' | 'daily' | 'weekly' | 'monthly' | 'annual';
export type HourlyTaxType = 'none' | 'insurance' | 'income';

export interface HourlyWageInput {
  payType: HourlyPayType;
  amount: number;
  dailyHours: number;
  weeklyDays: number;
  monthlyDays: number;
  weeklyOvertimeHours: number;
  monthlyOvertimeHours: number;
  weeklyHolidayIncluded: boolean;
  taxType: HourlyTaxType;
  probation: boolean;
}

export interface HourlyWageResult {
  hourlyWage: number;
  dailyWage: number;
  weeklyWage: number;
  monthlyBaseWage: number;
  annualBaseWage: number;
  weeklyHolidayPay: number;
  weeklyOvertimePay: number;
  monthlyOvertimePay: number;
  grossMonthlyWage: number;
  grossAnnualWage: number;
  tax: number;
  netMonthlyWage: number;
  netAnnualWage: number;
  monthlyWorkHours: number;
}

export const WEEKS_PER_MONTH = 4.34;
export const MINIMUM_WAGE_2026 = 10_320;
export const FOUR_INSURANCE_EMPLOYEE_RATE = 0.097174;
export const INCOME_TAX_RATE = 0.033;
export const PROBATION_RATE = 0.9;

const nonNegative = (value: number) =>
  Number.isFinite(value) ? Math.max(0, value) : 0;

export function calculateHourlyWage(input: HourlyWageInput): HourlyWageResult {
  const amount = nonNegative(input.amount);
  const dailyHours = Math.min(24, nonNegative(input.dailyHours));
  const weeklyDays = Math.min(7, nonNegative(input.weeklyDays));
  const monthlyDays = Math.min(31, nonNegative(input.monthlyDays));
  const weeklyOvertimeHours = nonNegative(input.weeklyOvertimeHours);
  const monthlyOvertimeHours = nonNegative(input.monthlyOvertimeHours);
  const weeklyHours = dailyHours * weeklyDays;
  const monthlyWorkHours = weeklyHours * WEEKS_PER_MONTH;

  let hourlyWage = 0;
  let dailyWage = 0;
  let weeklyWage = 0;
  let monthlyBaseWage = 0;

  switch (input.payType) {
    case 'hourly':
      hourlyWage = amount;
      dailyWage = hourlyWage * dailyHours;
      weeklyWage = dailyWage * weeklyDays;
      monthlyBaseWage = dailyWage * monthlyDays;
      break;
    case 'daily':
      dailyWage = amount;
      hourlyWage = dailyHours > 0 ? dailyWage / dailyHours : 0;
      weeklyWage = dailyWage * weeklyDays;
      monthlyBaseWage = dailyWage * monthlyDays;
      break;
    case 'weekly':
      weeklyWage = amount;
      hourlyWage = weeklyHours > 0 ? weeklyWage / weeklyHours : 0;
      dailyWage = hourlyWage * dailyHours;
      monthlyBaseWage = weeklyWage * WEEKS_PER_MONTH;
      break;
    case 'monthly':
      monthlyBaseWage = amount;
      hourlyWage =
        monthlyWorkHours > 0 ? monthlyBaseWage / monthlyWorkHours : 0;
      dailyWage = hourlyWage * dailyHours;
      weeklyWage = dailyWage * weeklyDays;
      break;
    case 'annual':
      monthlyBaseWage = amount / 12;
      hourlyWage =
        monthlyWorkHours > 0 ? monthlyBaseWage / monthlyWorkHours : 0;
      dailyWage = hourlyWage * dailyHours;
      weeklyWage = dailyWage * weeklyDays;
      break;
  }

  const weeklyHolidayHours =
    input.weeklyHolidayIncluded && weeklyHours >= 15
      ? (Math.min(weeklyHours, 40) / 40) * 8
      : 0;
  const weeklyHolidayPay = hourlyWage * weeklyHolidayHours * WEEKS_PER_MONTH;
  const weeklyOvertimePay =
    hourlyWage * weeklyOvertimeHours * 1.5 * WEEKS_PER_MONTH;
  const monthlyOvertimePay = hourlyWage * monthlyOvertimeHours * 1.5;

  let grossMonthlyWage =
    monthlyBaseWage + weeklyHolidayPay + weeklyOvertimePay + monthlyOvertimePay;

  if (input.probation) {
    grossMonthlyWage *= PROBATION_RATE;
  }

  const grossAnnualWage = grossMonthlyWage * 12;
  const taxRate =
    input.taxType === 'insurance'
      ? FOUR_INSURANCE_EMPLOYEE_RATE
      : input.taxType === 'income'
        ? INCOME_TAX_RATE
        : 0;
  const tax = grossMonthlyWage * taxRate;
  const netMonthlyWage = Math.max(0, grossMonthlyWage - tax);

  return {
    hourlyWage,
    dailyWage,
    weeklyWage,
    monthlyBaseWage,
    annualBaseWage: grossAnnualWage,
    weeklyHolidayPay,
    weeklyOvertimePay,
    monthlyOvertimePay,
    grossMonthlyWage,
    grossAnnualWage,
    tax,
    netMonthlyWage,
    netAnnualWage: netMonthlyWage * 12,
    monthlyWorkHours,
  };
}
