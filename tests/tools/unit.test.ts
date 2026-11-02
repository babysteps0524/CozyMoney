import { describe, expect, test } from 'bun:test';
import { convertUnit } from '../../src/features/tools/unit/unit';

describe('unit tool', () => {
  test('converts supported units and rejects unknown direction', () => {
    expect(convertUnit('length', 1, 'm → km')).toBe(0.001);
    expect(convertUnit('missing', 1, 'unknown')).toBeNull();
  });

  test('rejects inherited object properties as categories', () => {
    expect(convertUnit('toString', 1, 'unknown')).toBeNull();
    expect(convertUnit('constructor', 1, 'unknown')).toBeNull();
  });

  test('rejects non-finite input values', () => {
    expect(
      convertUnit('length', Number.POSITIVE_INFINITY, 'm → km'),
    ).toBeNull();
    expect(convertUnit('length', Number.NaN, 'm → km')).toBeNull();
  });
});
