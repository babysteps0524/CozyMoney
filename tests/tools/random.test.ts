import { describe, expect, test } from 'bun:test';
import { generateRandomNumber } from '../../src/features/tools/random/random';

describe('random number tool', () => {
  test('uses an inclusive integer range and rejects reversed bounds', () => {
    expect(generateRandomNumber(1, 10, (max) => max - 1)).toBe(10);
    expect(generateRandomNumber(10, 1, () => 0)).toBeNull();
  });
});
