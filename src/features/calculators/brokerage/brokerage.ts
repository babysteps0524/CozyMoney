export type BrokerageTransaction = 'sale' | 'jeonse' | 'monthly';
export type BrokerageProperty = 'house' | 'officetel' | 'presale' | 'other';

export interface BrokerageInput {
  transaction: BrokerageTransaction;
  property: BrokerageProperty;
  amount: number;
  paidAmount?: number;
  premium?: number;
  officetelEligible?: boolean;
  customRate?: number;
  vatRate?: number;
}

export interface BrokerageResult {
  transactionAmount: number;
  brokerageFee: number;
  rate: number;
  statutoryCap: number | null;
  vat: number;
  total: number;
  capped: boolean;
  explanation: string;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function getHousingRate(
  transaction: BrokerageTransaction,
  amount: number,
): { rate: number; cap: number | null } {
  if (transaction === 'sale') {
    if (amount < 50_000_000) return { rate: 0.6, cap: 250_000 };
    if (amount < 200_000_000) return { rate: 0.5, cap: 800_000 };
    if (amount < 900_000_000) return { rate: 0.4, cap: null };
    if (amount < 1_200_000_000) return { rate: 0.5, cap: null };
    if (amount < 1_500_000_000) return { rate: 0.6, cap: null };
    return { rate: 0.7, cap: null };
  }

  if (amount < 50_000_000) return { rate: 0.5, cap: 200_000 };
  if (amount < 100_000_000) return { rate: 0.4, cap: 300_000 };
  if (amount < 600_000_000) return { rate: 0.3, cap: null };
  if (amount < 1_200_000_000) return { rate: 0.4, cap: null };
  if (amount < 1_500_000_000) return { rate: 0.5, cap: null };
  return { rate: 0.6, cap: null };
}

export function calculateBrokerage(input: BrokerageInput): BrokerageResult {
  if (input.amount < 0) throw new Error('거래금액은 0 이상이어야 합니다.');

  const vatRate = clamp(input.vatRate ?? 10, 0, 100);
  let base = input.amount;
  let rate = 0;
  let statutoryCap: number | null = null;
  let explanation = '';

  if (input.property === 'house') {
    const housing = getHousingRate(input.transaction, input.amount);
    rate = housing.rate;
    statutoryCap = housing.cap;
    explanation =
      '주택 중개보수 상한요율을 적용했습니다. 실제 중개보수는 상한 범위에서 협의할 수 있습니다.';
  } else if (input.property === 'officetel') {
    rate = input.officetelEligible
      ? input.transaction === 'sale'
        ? 0.5
        : 0.4
      : 0.9;
    explanation = input.officetelEligible
      ? '전용면적 85㎡ 이하이고 시행규칙상 시설요건을 갖춘 오피스텔의 상한요율을 적용했습니다.'
      : '해당 요건을 충족하지 않는 오피스텔은 주택 외 중개대상물 기준인 0.9% 이내를 적용했습니다.';
  } else if (input.property === 'presale') {
    base = Math.max(0, (input.paidAmount ?? 0) + (input.premium ?? 0));
    const housing = getHousingRate(input.transaction, base);
    rate = housing.rate;
    statutoryCap = housing.cap;
    explanation =
      '분양권은 거래 당시까지 불입한 금액(융자 포함)과 프리미엄을 합산한 금액을 거래금액으로 사용했습니다.';
  } else {
    rate = clamp(input.customRate ?? 0.9, 0, 0.9);
    explanation =
      '주택 외 중개대상물은 거래금액의 0.9% 이내에서 협의할 수 있어 입력한 요율을 적용했습니다.';
  }

  if (input.customRate !== undefined) {
    rate = clamp(input.customRate, 0, 0.9);
    statutoryCap = null;
  }

  const rawFee = base * (rate / 100);
  const brokerageFee = Math.max(
    0,
    Math.round(statutoryCap === null ? rawFee : Math.min(rawFee, statutoryCap)),
  );
  const vat = Math.round(brokerageFee * (vatRate / 100));

  return {
    transactionAmount: base,
    brokerageFee,
    rate,
    statutoryCap,
    vat,
    total: brokerageFee + vat,
    capped: statutoryCap !== null && rawFee > statutoryCap,
    explanation,
  };
}

export function getMonthlyLeaseAmount(
  deposit: number,
  monthlyRent: number,
): number {
  const converted = deposit + monthlyRent * 100;
  return converted < 50_000_000 ? deposit + monthlyRent * 70 : converted;
}
