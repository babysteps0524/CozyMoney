export interface WeeklyPayInput {
  hourlyWage: number;
  weeklyHours: number;
}

export interface WeeklyPayResult {
  /** 주 소정근로시간에 대한 기본 주급 */
  weeklyWage: number;
  /** 주휴수당 요건을 충족한다고 가정한 추정 주휴수당 */
  weeklyHolidayPay: number;
  /** 주급과 주휴수당을 합한 금액 */
  totalWeeklyPay: number;
}

export function calculateWeeklyPay(input: WeeklyPayInput): WeeklyPayResult {
  const weeklyWage = input.hourlyWage * input.weeklyHours;
  const holidayHours =
    input.weeklyHours >= 15 ? Math.min(8, input.weeklyHours) : 0;
  const weeklyHolidayPay = input.hourlyWage * holidayHours;

  return {
    weeklyWage,
    weeklyHolidayPay,
    totalWeeklyPay: weeklyWage + weeklyHolidayPay,
  };
}
