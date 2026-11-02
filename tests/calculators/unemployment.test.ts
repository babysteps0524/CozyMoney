import { describe, expect, test } from 'bun:test';
import {
  calculateAgeAtSeparation,
  calculateEstimatedDailyAverageWage,
  calculateUnemployment,
  getAgeGroupAtSeparation,
  getBenefitDays,
} from '../../src/features/calculators/unemployment/unemployment';

describe('unemployment calculator', () => {
  test('calculates age at separation from birth date', () => {
    expect(calculateAgeAtSeparation('1975-10-07', '2026-10-06')).toBe(50);
    expect(calculateAgeAtSeparation('1976-10-07', '2026-10-06')).toBe(49);
    expect(calculateAgeAtSeparation('1975-10-06', '2026-10-06')).toBe(51);
  });

  test('automatically selects the 50+ benefit group at the separation date', () => {
    expect(getAgeGroupAtSeparation('1975-10-07', '2026-10-06')).toBe(
      'over50OrDisabled',
    );
    expect(getAgeGroupAtSeparation('1976-10-07', '2026-10-06')).toBe('under50');
  });

  test('disabled users use the 50+ or disabled benefit group regardless of age', () => {
    expect(getAgeGroupAtSeparation('1990-01-01', '2026-10-06', true)).toBe(
      'over50OrDisabled',
    );
  });

  test('calculates daily average wage from three-month wages', () => {
    const result = calculateEstimatedDailyAverageWage(9_000_000, '2026-10-06');

    expect(result.periodDays).toBe(92);
    expect(result.dailyAverageWage).toBe(97_826);
  });

  test('handles a three-month period crossing a shorter month', () => {
    const result = calculateEstimatedDailyAverageWage(9_000_000, '2026-05-31');

    expect(result.periodDays).toBe(92);
    expect(result.dailyAverageWage).toBe(97_826);
  });

  test('applies 2026 lower limit and 50세 미만 1~3년 지급일수', () => {
    const result = calculateUnemployment({
      dailyAverageWage: 100_000,
      dailyWorkingHours: 8,
      ageGroup: 'under50',
      insurancePeriod: '1to3',
    });

    expect(result.baseBenefit).toBe(60_000);
    expect(result.lowerLimit).toBe(66_048);
    expect(result.upperLimit).toBe(68_100);
    expect(result.dailyBenefit).toBe(66_048);
    expect(result.benefitDays).toBe(150);
    expect(result.totalBenefit).toBe(9_907_200);
    expect(result.lowerLimitApplied).toBe(true);
    expect(result.upperLimitApplied).toBe(false);
  });

  test('applies upper limit when 60 percent exceeds 2026 maximum', () => {
    const result = calculateUnemployment({
      dailyAverageWage: 150_000,
      dailyWorkingHours: 8,
      ageGroup: 'under50',
      insurancePeriod: '3to5',
    });

    expect(result.baseBenefit).toBe(90_000);
    expect(result.dailyBenefit).toBe(68_100);
    expect(result.upperLimitApplied).toBe(true);
    expect(result.totalBenefit).toBe(12_258_000);
  });

  test('uses longer benefit days for age 50+ or disabled', () => {
    expect(getBenefitDays('over50OrDisabled', '1to3')).toBe(180);
    expect(getBenefitDays('over50OrDisabled', '10plus')).toBe(270);
  });

  test('scales lower limit by daily working hours', () => {
    const result = calculateUnemployment({
      dailyAverageWage: 80_000,
      dailyWorkingHours: 4,
      ageGroup: 'under50',
      insurancePeriod: 'under1',
    });

    expect(result.lowerLimit).toBe(33_024);
    expect(result.dailyBenefit).toBe(48_000);
  });
});
