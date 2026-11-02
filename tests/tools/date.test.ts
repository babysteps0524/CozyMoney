import { describe, expect, test } from 'bun:test';
import { calculateDateDifference } from '../../src/features/tools/date/date';

describe('date tool', () => {
  test('returns absolute day difference', () => {
    expect(
      calculateDateDifference(
        new Date('2026-01-01T00:00:00Z'),
        new Date('2026-01-11T00:00:00Z'),
      ),
    ).toBe(10);
  });

  test('returns the same difference when the dates are reversed', () => {
    expect(
      calculateDateDifference(
        new Date('2026-01-11T00:00:00Z'),
        new Date('2026-01-01T00:00:00Z'),
      ),
    ).toBe(10);
  });

  test('handles leap day as a calendar date', () => {
    expect(
      calculateDateDifference(
        new Date('2024-02-28T00:00:00Z'),
        new Date('2024-03-01T00:00:00Z'),
      ),
    ).toBe(2);
  });

  test('returns null for invalid dates', () => {
    expect(
      calculateDateDifference(
        new Date(Number.NaN),
        new Date('2026-01-01T00:00:00Z'),
      ),
    ).toBeNull();
  });
});
