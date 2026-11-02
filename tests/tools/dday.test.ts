import { describe, expect, test } from 'bun:test';
import { calculateDday } from '../../src/features/tools/dday/dday';

describe('D-day tool', () => {
  test('calculates day offset from today', () => {
    expect(calculateDday(new Date(2026, 0, 11), new Date(2026, 0, 1))).toBe(10);
  });

  test('calculates past dates as negative offsets', () => {
    expect(calculateDday(new Date(2025, 11, 31), new Date(2026, 0, 1))).toBe(
      -1,
    );
  });

  test('uses calendar dates across daylight-saving boundaries', () => {
    expect(calculateDday(new Date(2024, 2, 11), new Date(2024, 2, 9))).toBe(2);
  });

  test('returns null for invalid dates', () => {
    expect(
      calculateDday(new Date(Number.NaN), new Date(2026, 0, 1)),
    ).toBeNull();
  });
});
