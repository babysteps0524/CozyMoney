import { describe, expect, test } from 'bun:test';
import { calculateAge } from '../../src/features/tools/age/age';

describe('age tool', () => {
  test('calculates years, months, and days', () => {
    expect(calculateAge(new Date(2000, 0, 15), new Date(2025, 2, 20))).toEqual({
      years: 25,
      months: 2,
      days: 5,
    });
  });
});
