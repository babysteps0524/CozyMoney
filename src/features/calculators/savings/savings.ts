export type SavingsType = 'deposit' | 'installment';
export type InterestMethod = 'simple' | 'compound';

export interface SavingsInput {
  type: SavingsType;
  principal: number;
  monthlyDeposit: number;
  annualRate: number;
  months: number;
  method?: InterestMethod;
}

export interface SavingsResult {
  principal: number;
  interestBeforeTax: number;
  tax: number;
  maturityAmount: number;
}

export function calculateSavings({
  type,
  principal,
  monthlyDeposit,
  annualRate,
  months,
  method = 'compound',
}: SavingsInput): SavingsResult {
  if (months <= 0) {
    throw new Error('저축기간은 1개월 이상이어야 합니다.');
  }

  if (annualRate < 0) {
    throw new Error('금리는 0 이상이어야 합니다.');
  }

  if (type === 'deposit' && principal <= 0) {
    throw new Error('예치금액은 0보다 커야 합니다.');
  }

  if (type === 'installment' && monthlyDeposit <= 0) {
    throw new Error('월 납입금액은 0보다 커야 합니다.');
  }

  const monthlyRate = annualRate / 100 / 12;

  let maturityBeforeTax: number;

  if (method === 'simple') {
    const simpleInterest =
      type === 'deposit'
        ? principal * (annualRate / 100) * (months / 12)
        : (monthlyDeposit * (annualRate / 100 / 12) * (months * (months + 1))) /
          2;

    const paidPrincipal =
      type === 'deposit' ? principal : monthlyDeposit * months;
    maturityBeforeTax = paidPrincipal + simpleInterest;
  } else if (type === 'deposit') {
    maturityBeforeTax =
      monthlyRate === 0 ? principal : principal * (1 + monthlyRate) ** months;
  } else {
    maturityBeforeTax =
      monthlyRate === 0
        ? monthlyDeposit * months
        : monthlyDeposit * (((1 + monthlyRate) ** months - 1) / monthlyRate);
  }

  const paidPrincipal =
    type === 'deposit' ? principal : monthlyDeposit * months;

  const interestBeforeTax = Math.max(0, maturityBeforeTax - paidPrincipal);
  const tax = interestBeforeTax * 0.154;

  return {
    principal: paidPrincipal,
    interestBeforeTax,
    tax,
    maturityAmount: maturityBeforeTax - tax,
  };
}

export function formatWon(value: number): string {
  return `${Math.round(value).toLocaleString('ko-KR')}원`;
}
