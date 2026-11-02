export type LeaseLoanRepaymentType = 'interest-only' | 'equal-payment';

export interface LeaseLoanInput {
  deposit: number;
  loanRatio: number;
  annualRate: number;
  termMonths: number;
  repaymentType: LeaseLoanRepaymentType;
  annualGuaranteeFeeRate?: number;
}

export interface LeaseLoanScheduleRow {
  month: number;
  principalPayment: number;
  interestPayment: number;
  totalPayment: number;
  remainingPrincipal: number;
}

export interface LeaseLoanRateComparison {
  increasePercentagePoints: number;
  annualRate: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
}

export interface LeaseLoanEstimate {
  loanAmount: number;
  ownFunds: number;
  monthlyInterest: number;
  monthlyPayment: number;
  annualInterest: number;
  totalInterest: number;
  totalPayment: number;
  annualGuaranteeFeeRate: number;
  estimatedGuaranteeFee: number;
  totalEstimatedOutflow: number;
  rateComparisons: LeaseLoanRateComparison[];
  repaymentType: LeaseLoanRepaymentType;
  schedule: LeaseLoanScheduleRow[];
}

function safeNonNegative(value: number): number {
  return Math.max(0, Number.isFinite(value) ? value : 0);
}

function getMonthlyPayment(
  loanAmount: number,
  monthlyRate: number,
  termMonths: number,
  repaymentType: LeaseLoanRepaymentType,
): number {
  if (termMonths <= 0 || loanAmount <= 0) return 0;
  if (repaymentType === 'interest-only') {
    return Math.round(loanAmount * monthlyRate);
  }
  if (monthlyRate === 0) return Math.round(loanAmount / termMonths);
  return Math.round(
    (loanAmount * monthlyRate) / (1 - (1 + monthlyRate) ** -termMonths),
  );
}

function getRateComparison(
  loanAmount: number,
  annualRate: number,
  termMonths: number,
  repaymentType: LeaseLoanRepaymentType,
  increasePercentagePoints: number,
): LeaseLoanRateComparison {
  const comparisonRate = annualRate + increasePercentagePoints;
  const monthlyRate = comparisonRate / 100 / 12;
  const formulaMonthlyPayment = getMonthlyPayment(
    loanAmount,
    monthlyRate,
    termMonths,
    repaymentType,
  );
  const schedule: Array<{ interestPayment: number; totalPayment: number }> = [];
  let remainingPrincipal = loanAmount;

  if (termMonths > 0 && loanAmount > 0) {
    const equalPayment =
      repaymentType === 'equal-payment'
        ? monthlyRate === 0
          ? loanAmount / termMonths
          : (loanAmount * monthlyRate) / (1 - (1 + monthlyRate) ** -termMonths)
        : 0;

    for (let month = 1; month <= termMonths; month += 1) {
      const interestPayment = remainingPrincipal * monthlyRate;
      const principalPayment =
        repaymentType === 'interest-only'
          ? month === termMonths
            ? remainingPrincipal
            : 0
          : month === termMonths
            ? remainingPrincipal
            : Math.min(remainingPrincipal, equalPayment - interestPayment);

      remainingPrincipal = Math.max(0, remainingPrincipal - principalPayment);
      const roundedPrincipalPayment = Math.round(principalPayment);
      const roundedInterestPayment = Math.round(interestPayment);
      schedule.push({
        interestPayment: roundedInterestPayment,
        totalPayment: roundedPrincipalPayment + roundedInterestPayment,
      });
    }
  }

  const totalInterest = schedule.reduce(
    (sum, item) => sum + item.interestPayment,
    0,
  );
  const totalPayment = schedule.reduce(
    (sum, item) => sum + item.totalPayment,
    0,
  );

  return {
    increasePercentagePoints,
    annualRate: comparisonRate,
    monthlyPayment:
      repaymentType === 'equal-payment'
        ? (schedule[0]?.totalPayment ?? formulaMonthlyPayment)
        : formulaMonthlyPayment,
    totalInterest,
    totalPayment,
  };
}

export function calculateLeaseLoan(input: LeaseLoanInput): LeaseLoanEstimate {
  const deposit = safeNonNegative(input.deposit);
  const loanRatio = Math.min(100, safeNonNegative(input.loanRatio));
  const annualRate = safeNonNegative(input.annualRate);
  const annualGuaranteeFeeRate = Math.min(
    100,
    safeNonNegative(input.annualGuaranteeFeeRate ?? 0),
  );
  const termMonths = Math.min(
    600,
    Math.floor(safeNonNegative(input.termMonths)),
  );
  const repaymentType: LeaseLoanRepaymentType =
    input.repaymentType === 'equal-payment' ? 'equal-payment' : 'interest-only';

  const loanAmount = (deposit * loanRatio) / 100;
  const monthlyRate = annualRate / 100 / 12;
  const monthlyInterest = Math.round(loanAmount * monthlyRate);
  const annualInterest = Math.round(loanAmount * (annualRate / 100));
  const schedule: LeaseLoanScheduleRow[] = [];
  let remainingPrincipal = loanAmount;

  if (termMonths > 0 && loanAmount > 0) {
    const equalPayment =
      repaymentType === 'equal-payment'
        ? monthlyRate === 0
          ? loanAmount / termMonths
          : (loanAmount * monthlyRate) / (1 - (1 + monthlyRate) ** -termMonths)
        : 0;

    for (let month = 1; month <= termMonths; month += 1) {
      const interestPayment = remainingPrincipal * monthlyRate;
      const principalPayment =
        repaymentType === 'interest-only'
          ? month === termMonths
            ? remainingPrincipal
            : 0
          : month === termMonths
            ? remainingPrincipal
            : Math.min(remainingPrincipal, equalPayment - interestPayment);
      remainingPrincipal = Math.max(0, remainingPrincipal - principalPayment);
      const roundedPrincipalPayment = Math.round(principalPayment);
      const roundedInterestPayment = Math.round(interestPayment);

      schedule.push({
        month,
        principalPayment: roundedPrincipalPayment,
        interestPayment: roundedInterestPayment,
        totalPayment: roundedPrincipalPayment + roundedInterestPayment,
        remainingPrincipal: Math.round(remainingPrincipal),
      });
    }
  }

  const totalInterest = schedule.reduce(
    (sum, item) => sum + item.interestPayment,
    0,
  );
  const totalPayment = schedule.reduce(
    (sum, item) => sum + item.totalPayment,
    0,
  );
  const estimatedGuaranteeFee = Math.round(
    loanAmount * (annualGuaranteeFeeRate / 100) * (termMonths / 12),
  );

  return {
    loanAmount,
    ownFunds: deposit - loanAmount,
    monthlyInterest,
    monthlyPayment:
      repaymentType === 'equal-payment'
        ? (schedule[0]?.totalPayment ??
          getMonthlyPayment(loanAmount, monthlyRate, termMonths, repaymentType))
        : getMonthlyPayment(loanAmount, monthlyRate, termMonths, repaymentType),
    annualInterest,
    totalInterest,
    totalPayment,
    annualGuaranteeFeeRate,
    estimatedGuaranteeFee,
    totalEstimatedOutflow: totalPayment + estimatedGuaranteeFee,
    rateComparisons: [0.5, 1].map((increase) =>
      getRateComparison(
        loanAmount,
        annualRate,
        termMonths,
        repaymentType,
        increase,
      ),
    ),
    repaymentType,
    schedule,
  };
}
