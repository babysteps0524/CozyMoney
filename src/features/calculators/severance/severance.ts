export interface SeveranceMonthInput {
  startDate: string;
  endDate: string;
  days: number;
  wage: number;
}

export interface SeveranceInput {
  startDate: string;
  retirementDate: string;
  monthlyWages: [number, number, number];
  annualBonus: number;
  annualLeaveAllowance: number;
  ordinaryDailyWage?: number;
  weeklyHours: number;
  excludedAverageWageDays?: number;
  excludedAverageWageAmount?: number;
}

export interface SeveranceResult {
  eligible: boolean;
  eligibilityReason: string;
  serviceDays: number;
  serviceYears: number;
  averageWagePeriodDays: number;
  averageWagePeriodStart: string;
  averageWagePeriodEnd: string;
  monthlyPeriods: SeveranceMonthInput[];
  threeMonthWages: number;
  bonusIncluded: number;
  leaveAllowanceIncluded: number;
  excludedDays: number;
  excludedAmount: number;
  averageWageAmount: number;
  averageDailyWage: number;
  ordinaryDailyWage: number | null;
  appliedDailyWage: number;
  appliedBasis: 'average' | 'ordinary';
  severancePay: number;
}

const DAY_MS = 86_400_000;

function utcDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDay = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return new Date(
    Date.UTC(
      result.getUTCFullYear(),
      result.getUTCMonth(),
      Math.min(date.getUTCDate(), lastDay),
    ),
  );
}

function daysBetween(start: Date, endExclusive: Date): number {
  return Math.max(
    0,
    Math.round((endExclusive.getTime() - start.getTime()) / DAY_MS),
  );
}

function daysInclusive(start: Date, end: Date): number {
  return daysBetween(start, new Date(end.getTime() + DAY_MS));
}

function monthSegments(
  start: Date,
  end: Date,
): Array<{ start: Date; end: Date; days: number }> {
  return [0, 1, 2].map((offset) => {
    const segmentStart = addMonths(start, offset);
    const nextStart = addMonths(start, offset + 1);
    const segmentEnd = new Date(
      Math.min(end.getTime(), nextStart.getTime() - DAY_MS),
    );
    return {
      start: segmentStart,
      end: segmentEnd,
      days: daysInclusive(segmentStart, segmentEnd),
    };
  });
}

export function getSeverancePeriod(retirementDate: string): {
  start: string;
  end: string;
  days: number;
  periods: Array<{ start: string; end: string; days: number }>;
} {
  const retirement = utcDate(retirementDate);
  const end = new Date(retirement.getTime() - DAY_MS);
  const start = addMonths(retirement, -3);
  const segments = monthSegments(start, end);

  return {
    start: formatDate(start),
    end: formatDate(end),
    days: daysInclusive(start, end),
    periods: segments.map((segment) => ({
      start: formatDate(segment.start),
      end: formatDate(segment.end),
      days: segment.days,
    })),
  };
}

export function calculateSeverance(input: SeveranceInput): SeveranceResult {
  const start = utcDate(input.startDate);
  const retirement = utcDate(input.retirementDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(retirement.getTime())) {
    throw new Error('입사일과 퇴직일을 올바르게 입력하세요.');
  }
  if (retirement <= start) {
    throw new Error('퇴직일은 입사일보다 늦어야 합니다.');
  }
  if (input.weeklyHours < 0) {
    throw new Error('주 소정근로시간은 0 이상이어야 합니다.');
  }

  const serviceDays = daysBetween(start, retirement);
  const period = getSeverancePeriod(input.retirementDate);
  const periodStart = utcDate(period.start);
  const periodEnd = utcDate(period.end);
  const segments = monthSegments(periodStart, periodEnd);

  const monthlyWages: [number, number, number] = [
    Math.max(0, input.monthlyWages[0]),
    Math.max(0, input.monthlyWages[1]),
    Math.max(0, input.monthlyWages[2]),
  ];
  const threeMonthWages = monthlyWages.reduce((sum, value) => sum + value, 0);
  const bonusIncluded = (Math.max(0, input.annualBonus) * 3) / 12;
  const leaveAllowanceIncluded =
    (Math.max(0, input.annualLeaveAllowance) * 3) / 12;
  const excludedDays = Math.min(
    period.days,
    Math.max(0, Math.floor(input.excludedAverageWageDays ?? 0)),
  );
  const excludedAmount = Math.max(0, input.excludedAverageWageAmount ?? 0);

  const averageWageAmount = Math.max(
    0,
    threeMonthWages + bonusIncluded + leaveAllowanceIncluded - excludedAmount,
  );
  const denominator = Math.max(1, period.days - excludedDays);
  const averageDailyWage = averageWageAmount / denominator;
  const ordinaryDailyWage =
    input.ordinaryDailyWage !== undefined && input.ordinaryDailyWage > 0
      ? input.ordinaryDailyWage
      : null;
  const useOrdinary =
    ordinaryDailyWage !== null && ordinaryDailyWage > averageDailyWage;
  const appliedDailyWage = useOrdinary ? ordinaryDailyWage : averageDailyWage;

  const eligible = serviceDays >= 365 && input.weeklyHours >= 15;
  const eligibilityReason =
    serviceDays < 365
      ? '계속근로기간이 1년 미만입니다.'
      : input.weeklyHours < 15
        ? '4주 평균 1주 소정근로시간이 15시간 미만으로 입력되었습니다.'
        : '계속근로기간 1년 이상이며 주 소정근로시간 15시간 이상입니다.';

  const severancePay = eligible
    ? appliedDailyWage * 30 * (serviceDays / 365)
    : 0;

  return {
    eligible,
    eligibilityReason,
    serviceDays,
    serviceYears: serviceDays / 365,
    averageWagePeriodDays: period.days,
    averageWagePeriodStart: period.start,
    averageWagePeriodEnd: period.end,
    monthlyPeriods: segments.map((segment, index) => ({
      startDate: formatDate(segment.start),
      endDate: formatDate(segment.end),
      days: segment.days,
      wage: monthlyWages[index] ?? 0,
    })),
    threeMonthWages,
    bonusIncluded,
    leaveAllowanceIncluded,
    excludedDays,
    excludedAmount,
    averageWageAmount,
    averageDailyWage,
    ordinaryDailyWage,
    appliedDailyWage,
    appliedBasis: useOrdinary ? 'ordinary' : 'average',
    severancePay,
  };
}
