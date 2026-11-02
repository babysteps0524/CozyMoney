import { describe, expect, test } from 'bun:test';
import { definition } from '../../src/features/calculators/severance';

describe('severance calculator feature entry', () => {
  test('exports complete page metadata from its feature folder', () => {
    expect(definition.title.length).toBeGreaterThan(0);
    expect(definition.description.length).toBeGreaterThan(0);
    expect(definition.canonical).toContain('/calculators/');
  });
});
