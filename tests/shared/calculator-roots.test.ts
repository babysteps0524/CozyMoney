import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';

const components: Array<{ file: string; rootAttribute: string }> = [
  {
    file: 'src/features/calculators/severance/SeveranceCalculator.astro',
    rootAttribute: 'data-severance-calculator',
  },
  {
    file: 'src/features/calculators/vacation/VacationCalculator.astro',
    rootAttribute: 'data-annual-leave-calculator',
  },
  {
    file: 'src/features/calculators/brokerage/BrokerageCalculator.astro',
    rootAttribute: 'data-brokerage',
  },
  {
    file: 'src/features/calculators/property/PropertyTaxCalculator.astro',
    rootAttribute: 'data-property-tax',
  },
];

describe('calculator component roots', () => {
  test.each(components)(
    '$file renders the root attribute its script queries',
    ({ file, rootAttribute }) => {
      const source = readFileSync(file, 'utf-8');
      expect(source).toContain(`[${rootAttribute}]`);
      expect(source).toContain(`<div ${rootAttribute}>`);
    },
  );
});
