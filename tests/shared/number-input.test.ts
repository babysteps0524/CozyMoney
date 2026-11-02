import { describe, expect, test } from 'bun:test';
import {
  formatNumberInputValue,
  parseNumber,
  stepNumberInput,
} from '../../src/lib/calculator/number-input';

describe('number input utilities', () => {
  test('parseNumber handles formatted and incomplete values', () => {
    expect(parseNumber('1,234,567')).toBe(1_234_567);
    expect(parseNumber('')).toBe(0);
    expect(parseNumber('-')).toBe(0);
    expect(parseNumber('.')).toBe(0);
    expect(parseNumber('-.')).toBe(0);
  });

  test('formatNumberInputValue formats integer values', () => {
    expect(formatNumberInputValue('1234567')).toBe('1,234,567');
    expect(formatNumberInputValue('12a34')).toBe('1,234');
    expect(formatNumberInputValue('')).toBe('');
  });

  test('formatNumberInputValue preserves decimal input', () => {
    expect(formatNumberInputValue('1234.50', true)).toBe('1,234.50');
    expect(formatNumberInputValue('1234.5.6', true)).toBe('1,234.56');
  });

  test('stepNumberInput clamps values to min and max', () => {
    const input = createNumberInput();
    input.value = '100';
    input.dataset.step = '50';
    input.dataset.min = '100';
    input.dataset.max = '200';

    stepNumberInput(input, -1);
    expect(input.value).toBe('100');

    stepNumberInput(input, 1);
    expect(input.value).toBe('150');

    stepNumberInput(input, 1);
    expect(input.value).toBe('200');

    stepNumberInput(input, 1);
    expect(input.value).toBe('200');
  });

  test('stepNumberInput falls back from invalid step settings', () => {
    const input = createNumberInput();
    input.value = '100';
    input.dataset.step = 'invalid';
    input.dataset.min = '0';
    input.dataset.max = '200';

    stepNumberInput(input, 1);
    expect(input.value).toBe('101');
  });

  function createNumberInput() {
    const input = {
      value: '',
      dataset: {} as Record<string, string>,
      dispatchEvent: () => true,
    } as unknown as HTMLInputElement;
    return input;
  }
});
