export interface DsrInput {
  annualIncome: number;
  existingAnnualDebt: number;
  newAnnualDebt: number;
}

export interface DsrResult {
  currentDsr: number;
  totalDsr: number;
}

export function calculateDsr(input: DsrInput): DsrResult {
  if (input.annualIncome === 0) {
    return { currentDsr: Number.NaN, totalDsr: Number.NaN };
  }
  return {
    currentDsr: (input.existingAnnualDebt / input.annualIncome) * 100,
    totalDsr:
      ((input.existingAnnualDebt + input.newAnnualDebt) / input.annualIncome) *
      100,
  };
}
