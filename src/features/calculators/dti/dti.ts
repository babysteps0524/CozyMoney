export type DtiRepaymentMethod = 'equalPayment' | 'equalPrincipal' | 'maturity';

export interface DtiInput {
  annualIncome: number;
  mortgageAmount: number;
  mortgageRate: number;
  mortgageYears: number;
  mortgageMethod: DtiRepaymentMethod;
  otherDebtAmount: number;
  otherDebtRate: number;
  targetDti: number;
}

export interface DtiResult {
  annualMortgagePayment: number;
  annualOtherInterest: number;
  annualDebtService: number;
  dti: number;
  targetAnnualDebtService: number;
  headroom: number;
  withinTarget: boolean;
}

export function calculateDti(input: DtiInput): DtiResult {
  const income = Math.max(0, input.annualIncome);
  const principal = Math.max(0, input.mortgageAmount);
  const annualRate = Math.max(0, input.mortgageRate) / 100;
  const months = Math.max(1, Math.round(Math.max(0, input.mortgageYears) * 12));
  const monthlyRate = annualRate / 12;
  const monthsToCount = Math.min(12, months);

  let annualMortgagePayment = 0;

  if (principal > 0) {
    if (input.mortgageMethod === 'equalPayment') {
      const monthlyPayment =
        monthlyRate === 0
          ? principal / months
          : (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -months);
      annualMortgagePayment = monthlyPayment * monthsToCount;
    } else if (input.mortgageMethod === 'equalPrincipal') {
      const monthlyPrincipal = principal / months;
      for (let month = 0; month < monthsToCount; month += 1) {
        const remaining = principal - monthlyPrincipal * month;
        annualMortgagePayment += monthlyPrincipal + remaining * monthlyRate;
      }
    } else {
      annualMortgagePayment = principal * monthlyRate * monthsToCount;
    }
  }

  const annualOtherInterest =
    Math.max(0, input.otherDebtAmount) *
    (Math.max(0, input.otherDebtRate) / 100);
  const annualDebtService = annualMortgagePayment + annualOtherInterest;
  const dti = income > 0 ? (annualDebtService / income) * 100 : 0;
  const targetAnnualDebtService = (income * Math.max(0, input.targetDti)) / 100;
  const headroom = targetAnnualDebtService - annualDebtService;

  return {
    annualMortgagePayment,
    annualOtherInterest,
    annualDebtService,
    dti,
    targetAnnualDebtService,
    headroom,
    withinTarget: dti <= Math.max(0, input.targetDti),
  };
}
