export type LoanRepaymentType =
  'equalPrincipalInterest' | 'equalPrincipal' | 'maturity';

export interface LoanInput {
  principal: number;
  annualRate: number;
  months: number;
  repaymentType?: LoanRepaymentType;
  graceMonths?: number;
  prepaymentMonth?: number;
  prepaymentAmount?: number;
  prepaymentFeeRate?: number;
}

export interface LoanScheduleItem {
  month: number;
  payment: number;
  principalPayment: number;
  interestPayment: number;
  prepayment: number;
  prepaymentFee: number;
  remainingPrincipal: number;
}

export interface LoanResult {
  monthlyPayment: number;
  lastPayment: number;
  totalPayment: number;
  totalInterest: number;
  totalPrepayment: number;
  totalPrepaymentFee: number;
  schedule: LoanScheduleItem[];
}

function regularPayment(
  principal: number,
  monthlyRate: number,
  months: number,
): number {
  if (months <= 0 || principal <= 0) return 0;
  if (monthlyRate === 0) return principal / months;

  const factor = (1 + monthlyRate) ** months;
  return (principal * monthlyRate * factor) / (factor - 1);
}

export function calculateLoan({
  principal,
  annualRate,
  months,
  repaymentType = 'equalPrincipalInterest',
  graceMonths = 0,
  prepaymentMonth = 0,
  prepaymentAmount = 0,
  prepaymentFeeRate = 0,
}: LoanInput): LoanResult {
  if (principal <= 0) {
    throw new Error('대출금액은 0보다 커야 합니다.');
  }

  if (annualRate < 0) {
    throw new Error('금리는 0 이상이어야 합니다.');
  }

  if (months <= 0) {
    throw new Error('대출기간은 1개월 이상이어야 합니다.');
  }

  if (graceMonths < 0 || graceMonths >= months) {
    throw new Error(
      '거치기간은 0개월 이상이며 전체 대출기간보다 짧아야 합니다.',
    );
  }

  if (prepaymentMonth < 0 || prepaymentMonth > months) {
    throw new Error('중도상환 시점은 0개월부터 대출기간 이내여야 합니다.');
  }

  if (prepaymentAmount < 0) {
    throw new Error('중도상환금액은 0 이상이어야 합니다.');
  }

  if (prepaymentFeeRate < 0) {
    throw new Error('중도상환수수료율은 0 이상이어야 합니다.');
  }

  if (prepaymentAmount > 0 && prepaymentMonth === 0) {
    throw new Error('중도상환금액을 입력하면 중도상환 시점을 선택해야 합니다.');
  }

  const monthlyRate = annualRate / 100 / 12;
  const repaymentMonths = months - graceMonths;
  const schedule: LoanScheduleItem[] = [];
  let balance = principal;
  let totalInterest = 0;
  let totalPayment = 0;
  let totalPrepayment = 0;
  let totalPrepaymentFee = 0;
  let firstPayment = 0;
  let lastPayment = 0;

  for (let month = 1; month <= months; month += 1) {
    const interestPayment = balance * monthlyRate;
    let principalPayment = 0;
    let payment = interestPayment;

    if (month > graceMonths) {
      const remainingMonths = months - month + 1;

      if (repaymentType === 'equalPrincipalInterest') {
        payment = regularPayment(balance, monthlyRate, remainingMonths);
        principalPayment = Math.min(balance, payment - interestPayment);
      } else if (repaymentType === 'equalPrincipal') {
        principalPayment = Math.min(balance, principal / repaymentMonths);
        payment = principalPayment + interestPayment;
      } else {
        principalPayment = month === months ? balance : 0;
        payment = interestPayment + principalPayment;
      }
    }

    let prepayment = 0;
    let prepaymentFee = 0;
    if (prepaymentAmount > 0 && month === prepaymentMonth && balance > 0) {
      prepayment = Math.min(
        prepaymentAmount,
        Math.max(0, balance - principalPayment),
      );
      prepaymentFee = prepayment * (prepaymentFeeRate / 100);
    }

    balance = Math.max(0, balance - principalPayment - prepayment);

    totalInterest += interestPayment;
    totalPayment += payment + prepayment + prepaymentFee;
    totalPrepayment += prepayment;
    totalPrepaymentFee += prepaymentFee;

    const item = {
      month,
      payment,
      principalPayment,
      interestPayment,
      prepayment,
      prepaymentFee,
      remainingPrincipal: balance,
    };

    schedule.push(item);

    if (month === 1 || (month > graceMonths && firstPayment === 0)) {
      firstPayment = payment + prepayment + prepaymentFee;
    }
    lastPayment = payment + prepayment + prepaymentFee;
  }

  return {
    monthlyPayment: firstPayment,
    lastPayment,
    totalPayment,
    totalInterest,
    totalPrepayment,
    totalPrepaymentFee,
    schedule,
  };
}

export function formatWon(value: number): string {
  return `${Math.round(value).toLocaleString('ko-KR')}원`;
}
