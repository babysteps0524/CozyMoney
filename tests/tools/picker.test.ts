import { describe, expect, test } from 'bun:test';
import { pickRandomItem } from '../../src/features/tools/picker/picker';

describe('picker tool', () => {
  test('selects an item using the supplied random index', () => {
    expect(pickRandomItem(['a', 'b', 'c'], () => 1)).toBe('b');
    expect(pickRandomItem([], () => 0)).toBeNull();
  });
});
