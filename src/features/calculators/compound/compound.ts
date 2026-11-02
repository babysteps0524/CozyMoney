export interface CompoundInput {
  principal: number;
  annualRate: number;
  years: number;
  annualContribution: number;
}

export function calculateCompound(input: CompoundInput): number {
  const rate = input.annualRate / 100;
  return rate === 0
    ? input.principal + input.annualContribution * input.years
    : input.principal * (1 + rate) ** input.years +
        (input.annualContribution * ((1 + rate) ** input.years - 1)) / rate;
}
