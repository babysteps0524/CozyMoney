export interface RentCostInput {
  deposit: number;
  depositRate: number;
  monthlyRent: number;
}

export interface RentCostResult {
  annualizedMonthlyRent: number;
  annualDepositReturn: number;
  monthlyDepositReturn: number;
  monthlyEquivalentCost: number;
  annualCost: number;
}

export interface JeonseToWolseInput {
  jeonseDeposit: number;
  monthlyDeposit: number;
  conversionRate: number;
}

export interface WolseToJeonseInput {
  deposit: number;
  monthlyRent: number;
  conversionRate: number;
}

/**
 * 보증금의 연 환산 비용과 월세를 같은 기간 기준으로 비교한다.
 * depositRate는 연 단위 백분율(예: 5.5는 연 5.5%)이다.
 */
export function calculateRentCost(input: RentCostInput): RentCostResult {
  const annualizedMonthlyRent = input.monthlyRent * 12;
  const annualDepositReturn = (input.deposit * input.depositRate) / 100;
  const monthlyDepositReturn = annualDepositReturn / 12;
  const annualCost = annualizedMonthlyRent + annualDepositReturn;

  return {
    annualizedMonthlyRent,
    annualDepositReturn,
    monthlyDepositReturn,
    monthlyEquivalentCost: annualCost / 12,
    annualCost,
  };
}

/**
 * 전세 보증금 일부를 월세로 전환한다.
 * 전환율은 연 단위 백분율이며, 잘못된 금액 관계이면 null을 반환한다.
 */
export function calculateJeonseToWolse(
  input: JeonseToWolseInput,
): number | null {
  const { jeonseDeposit, monthlyDeposit, conversionRate } = input;

  if (
    jeonseDeposit < 0 ||
    monthlyDeposit < 0 ||
    monthlyDeposit > jeonseDeposit ||
    conversionRate < 0
  ) {
    return null;
  }

  return ((jeonseDeposit - monthlyDeposit) * conversionRate) / 1200;
}

/**
 * 현재 월세를 보증금으로 전환한 예상 전세 보증금을 계산한다.
 * 전환율은 연 단위 백분율이며, 0%로는 역산할 수 없다.
 */
export function calculateWolseToJeonse(
  input: WolseToJeonseInput,
): number | null {
  const { deposit, monthlyRent, conversionRate } = input;

  if (deposit < 0 || monthlyRent < 0 || conversionRate <= 0) {
    return null;
  }

  return deposit + (monthlyRent * 1200) / conversionRate;
}
