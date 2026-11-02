export type AnnualLeaveBasis = 'hire-date' | 'fiscal-year';

export interface AnnualLeaveInput {
  basis: AnnualLeaveBasis;
  startDate: string;
  calculationDate: string;
  usedDays: number;
  dailyHours: number;
  weeklyDays: number;
  weeklyHours?: number;
  monthlyBasePay: number;
  monthlyFixedAllowance: number;
  annualBonus: number;
}

export interface AnnualLeaveResult {
  leaveDays: number;
  usedDays: number;
  unusedDays: number;
  serviceDays: number;
  serviceYears: number;
  elapsedMonths: number;
  monthlyHours: number;
  weeklyHours: number;
  weeklyHolidayHours: number;
  monthlyOrdinaryWage: number;
  hourlyOrdinaryWage: number;
  dailyOrdinaryWage: number;
  allowance: number;
  proratedFirstYearDays: number;
  basisLabel: string;
  explanation: string;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseDate(value: string): Date {
  const date = new Date(value + 'T00:00:00');
  if (Number.isNaN(date.getTime())) throw new Error('날짜를 확인하세요.');
  return date;
}

function daysBetween(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY);
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const lastDay = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0,
  ).getDate();
  result.setDate(Math.min(date.getDate(), lastDay));
  return result;
}

function completedMonths(start: Date, end: Date): number {
  if (end < start) return 0;
  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  if (addMonths(start, months) > end) months -= 1;
  return Math.max(0, months);
}

function annualDaysForServiceYears(years: number): number {
  if (years < 1) return 0;
  return Math.min(25, 15 + Math.floor((years - 1) / 2));
}

function calculateHireDateLeave(
  start: Date,
  end: Date,
): { leaveDays: number; proratedFirstYearDays: number } {
  const months = completedMonths(start, end);
  if (daysBetween(start, end) < 365) {
    return { leaveDays: Math.min(11, months), proratedFirstYearDays: 0 };
  }

  const years = Math.floor(daysBetween(start, end) / 365);
  return {
    leaveDays: annualDaysForServiceYears(years),
    proratedFirstYearDays: 0,
  };
}

function calculateFiscalYearLeave(
  start: Date,
  end: Date,
): { leaveDays: number; proratedFirstYearDays: number } {
  if (end < start) return { leaveDays: 0, proratedFirstYearDays: 0 };

  const firstGrantDate = new Date(start.getFullYear() + 1, 0, 1);
  const firstElevenMonthDate = addMonths(start, 11);

  if (end < firstGrantDate) {
    return {
      leaveDays: Math.min(11, completedMonths(start, end)),
      proratedFirstYearDays: 0,
    };
  }

  const monthlyAccrualEnd =
    end < firstElevenMonthDate ? end : firstElevenMonthDate;
  const monthlyAccrualDays = Math.min(
    11,
    completedMonths(start, monthlyAccrualEnd),
  );
  const firstYearDays = daysBetween(start, firstGrantDate);
  const prorated = Math.min(15, (firstYearDays / 365) * 15);
  let total = monthlyAccrualDays;

  total += prorated;

  const firstGrantYear = start.getFullYear() + 1;
  for (let year = firstGrantYear; year <= end.getFullYear(); year += 1) {
    const grantDate = new Date(year, 0, 1);
    if (grantDate > end) break;
    const serviceDays = daysBetween(start, grantDate);
    const serviceYears = Math.floor(serviceDays / 365);
    total += annualDaysForServiceYears(Math.max(1, serviceYears));
  }

  return {
    leaveDays: Math.min(
      25 * Math.max(1, Math.ceil((daysBetween(start, end) + 1) / 365)),
      total,
    ),
    proratedFirstYearDays: prorated,
  };
}

export function calculateAnnualLeave(
  input: AnnualLeaveInput,
): AnnualLeaveResult {
  const start = parseDate(input.startDate);
  const end = parseDate(input.calculationDate);

  if (end < start) throw new Error('계산일자는 입사일 이후여야 합니다.');
  if (input.usedDays < 0) throw new Error('사용한 연차는 0 이상이어야 합니다.');
  if (input.dailyHours <= 0 || input.dailyHours > 24)
    throw new Error('1일 소정근로시간을 확인하세요.');
  if (input.weeklyDays <= 0 || input.weeklyDays > 7)
    throw new Error('1주 소정근로일수를 확인하세요.');
  if (input.weeklyHours !== undefined && input.weeklyHours <= 0)
    throw new Error('1주 총 소정근로시간을 확인하세요.');
  if (
    input.monthlyBasePay < 0 ||
    input.monthlyFixedAllowance < 0 ||
    input.annualBonus < 0
  ) {
    throw new Error('임금은 0 이상이어야 합니다.');
  }

  const weeklyHours = input.weeklyHours ?? input.dailyHours * input.weeklyDays;
  const weeklyHolidayHours = weeklyHours >= 15 ? Math.min(8, weeklyHours) : 0;
  const monthlyHours = (weeklyHours + weeklyHolidayHours) * (365 / 12 / 7);

  let leaveDays = 0;
  let proratedFirstYearDays = 0;

  if (weeklyHours >= 15) {
    const result =
      input.basis === 'fiscal-year'
        ? calculateFiscalYearLeave(start, end)
        : calculateHireDateLeave(start, end);
    leaveDays = result.leaveDays;
    proratedFirstYearDays = result.proratedFirstYearDays;
  }

  const usedDays = Math.max(0, input.usedDays);
  const unusedDays = Math.max(0, leaveDays - usedDays);
  const monthlyOrdinaryWage =
    input.monthlyBasePay + input.monthlyFixedAllowance + input.annualBonus / 12;
  const hourlyOrdinaryWage =
    monthlyHours > 0 ? monthlyOrdinaryWage / monthlyHours : 0;
  const dailyOrdinaryWage = hourlyOrdinaryWage * input.dailyHours;
  const allowance = dailyOrdinaryWage * unusedDays;

  const serviceDays = daysBetween(start, end);
  const serviceYears = serviceDays / 365;
  const elapsedMonths = completedMonths(start, end);

  return {
    leaveDays,
    usedDays,
    unusedDays,
    serviceDays,
    serviceYears,
    elapsedMonths,
    monthlyHours,
    weeklyHours,
    weeklyHolidayHours,
    monthlyOrdinaryWage,
    hourlyOrdinaryWage,
    dailyOrdinaryWage,
    allowance,
    proratedFirstYearDays,
    basisLabel: input.basis === 'hire-date' ? '입사일 기준' : '회계연도 기준',
    explanation:
      weeklyHours < 15
        ? '1주 소정근로시간이 15시간 미만인 경우 근로기준법상 연차유급휴가 적용 대상에서 제외될 수 있어 연차일수를 0일로 계산했습니다.'
        : input.basis === 'hire-date'
          ? '입사일을 기준으로 1년 미만 기간의 월 단위 연차와 1년 이상 근속자의 연차 가산 구조를 적용한 참고용 계산입니다.'
          : '회계연도(1월 1일)를 기준으로 첫해 비례 연차와 이후 연차를 계산한 참고용 값입니다.',
  };
}
