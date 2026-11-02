import { describe, expect, test } from 'bun:test';
import { generateLottoNumbers } from '../../src/features/tools/lotto/lotto';

describe('lotto tool', () => {
  test('returns six unique sorted numbers in range', () => {
    let next = 0;
    const numbers = generateLottoNumbers((max) => next++ % max);
    expect(numbers).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
