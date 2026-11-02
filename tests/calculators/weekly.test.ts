import { describe, expect, test } from 'bun:test';
import { calculateWeeklyPay } from '../../src/features/calculators/weekly/weekly';

describe('weekly calculator', () => {
  test('returns weekly wage, holiday pay, and combined amount separately', () => {
    expect(calculateWeeklyPay({ hourlyWage: 100, weeklyHours: 20 })).toEqual({
      weeklyWage: 2000,
      weeklyHolidayPay: 800,
      totalWeeklyPay: 2800,
    });
  });

  test('does not add weekly holiday pay below 15 weekly hours', () => {
    expect(calculateWeeklyPay({ hourlyWage: 100, weeklyHours: 14 })).toEqual({
      weeklyWage: 1400,
      weeklyHolidayPay: 0,
      totalWeeklyPay: 1400,
    });
  });
});
