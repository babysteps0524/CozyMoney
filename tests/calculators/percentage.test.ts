import { describe, expect, test } from 'bun:test';
import {
  calculatePercentChange,
  calculatePercentageOf,
} from '../../src/features/calculators/percentage/percentage';

describe('percentage calculator', () => {
  test('calculates a part and percentage change', () => {
    expect(calculatePercentageOf(200, 15)).toBe(30);
    expect(calculatePercentChange(100, 120)).toBe(20);
  });
});
