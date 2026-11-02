import { describe, expect, test } from 'bun:test';
import { generatePassword } from '../../src/features/tools/password/password';

describe('password tool', () => {
  test('includes a character from each enabled set', () => {
    const password = generatePassword(12, ['upper', 'number'], () => 0);
    expect(password).toHaveLength(12);
    expect(password).toMatch(/[A-Z]/);
    expect(password).toMatch(/[0-9]/);
  });
});
