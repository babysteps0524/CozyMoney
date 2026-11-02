export type LegalScrivenerProperty = 'house' | 'building';

export type LegalScrivenerFeeType =
  | 'ownership'
  | 'preservation'
  | 'collateral'
  | 'additionalCollateral'
  | 'change'
  | 'nameChange'
  | 'cancellation'
  | 'trust'
  | 'trustCancellation';

export interface LegalScrivenerFeeItem {
  id: string;
  type: LegalScrivenerFeeType;
  taxableBase: number;
}

export interface LegalScrivenerInput {
  property: LegalScrivenerProperty;
  fees: LegalScrivenerFeeItem[];
  statedAmount?: number;
  includePublicCosts?: boolean;
  includeVat?: boolean;
  vatRate?: number;
}

export interface LegalScrivenerFeeLine {
  id: string;
  type: LegalScrivenerFeeType;
  label: string;
  taxableBase: number;
  baseFee: number;
}

export interface LegalScrivenerResult {
  feeLines: LegalScrivenerFeeLine[];
  baseFee: number;
  vat: number;
  stampTax: number;
  registrationFee: number;
  publicCosts: number;
  total: number;
  explanation: string;
}

const roundWon = (value: number) => Math.round(value);

const progressiveFee = (
  amount: number,
  brackets: Array<{ limit: number; base: number; rate: number }>,
  lastRate: number,
) => {
  const value = Math.max(0, amount);

  for (let index = 0; index < brackets.length; index += 1) {
    const bracket = brackets[index];
    const previousLimit = index === 0 ? 0 : brackets[index - 1].limit;
    if (value <= bracket.limit) {
      return roundWon(
        bracket.base + Math.max(0, value - previousLimit) * bracket.rate,
      );
    }
  }

  const last = brackets[brackets.length - 1];
  return roundWon(last.base + (value - last.limit) * lastRate);
};

export function calculateRealEstateBasicFee(
  type: LegalScrivenerFeeType,
  taxableBase: number,
): number {
  const amount = Math.max(0, taxableBase);

  if (
    type === 'ownership' ||
    type === 'preservation' ||
    type === 'collateral'
  ) {
    return progressiveFee(
      amount,
      [
        { limit: 50_000_000, base: 210_000, rate: 0 },
        { limit: 100_000_000, base: 210_000, rate: 0.001 },
        { limit: 300_000_000, base: 260_000, rate: 0.0009 },
        { limit: 500_000_000, base: 440_000, rate: 0.0008 },
        { limit: 1_000_000_000, base: 600_000, rate: 0.0007 },
        { limit: 2_000_000_000, base: 950_000, rate: 0.0005 },
        { limit: 20_000_000_000, base: 1_450_000, rate: 0.0004 },
      ],
      0.0001,
    );
  }

  if (type === 'additionalCollateral') {
    return progressiveFee(
      amount,
      [
        { limit: 50_000_000, base: 105_000, rate: 0 },
        { limit: 200_000_000, base: 105_000, rate: 0.0005 },
        { limit: 1_000_000_000, base: 180_000, rate: 0.0002 },
        { limit: 10_000_000_000, base: 340_000, rate: 0.0001 },
      ],
      0.00005,
    );
  }

  const fixedFees: Record<LegalScrivenerFeeType, number> = {
    ownership: 0,
    preservation: 0,
    collateral: 0,
    additionalCollateral: 0,
    change: 120_000,
    nameChange: 40_000,
    cancellation: 80_000,
    trust: 150_000,
    trustCancellation: 50_000,
  };

  return fixedFees[type];
}

export function calculateStampTax(
  property: LegalScrivenerProperty,
  statedAmount: number,
): number {
  const amount = Math.max(0, statedAmount);

  if (property === 'house' && amount <= 100_000_000) return 0;
  if (amount <= 10_000_000) return 0;
  if (amount <= 30_000_000) return 20_000;
  if (amount <= 50_000_000) return 40_000;
  if (amount <= 100_000_000) return 70_000;
  if (amount <= 1_000_000_000) return 150_000;
  return 350_000;
}

export function getFeeLabel(type: LegalScrivenerFeeType): string {
  const labels: Record<LegalScrivenerFeeType, string> = {
    ownership: '소유권 이전등기',
    preservation: '소유권 보존등기',
    collateral: '담보권 설정등기',
    additionalCollateral: '담보권 추가 설정등기',
    change: '권리의 변경·경정·회복등기',
    nameChange: '부동산·등기명의인 표시 변경·경정',
    cancellation: '말소등기',
    trust: '신탁등기',
    trustCancellation: '신탁등기 말소',
  };

  return labels[type];
}

export function calculateLegalScrivenerFee(
  input: LegalScrivenerInput,
): LegalScrivenerResult {
  if (input.fees.length === 0) {
    throw new Error('보수 항목을 하나 이상 추가해주세요.');
  }

  const vatRate = Math.max(0, input.vatRate ?? 10);
  const feeLines = input.fees.map((fee) => ({
    id: fee.id,
    type: fee.type,
    label: getFeeLabel(fee.type),
    taxableBase: Math.max(0, fee.taxableBase),
    baseFee: calculateRealEstateBasicFee(fee.type, fee.taxableBase),
  }));

  const baseFee = feeLines.reduce((sum, line) => sum + line.baseFee, 0);
  const vat =
    input.includeVat === false ? 0 : roundWon(baseFee * (vatRate / 100));
  const stampTax =
    input.includePublicCosts === false
      ? 0
      : calculateStampTax(input.property, input.statedAmount ?? 0);

  const hasRegistration = feeLines.some(
    (line) => line.type !== 'trust' && line.type !== 'trustCancellation',
  );
  const registrationFee =
    input.includePublicCosts === false || !hasRegistration ? 0 : 18_000;
  const publicCosts = stampTax + registrationFee;

  return {
    feeLines,
    baseFee,
    vat,
    stampTax,
    registrationFee,
    publicCosts,
    total: baseFee + vat + publicCosts,
    explanation:
      '2024년 9월 12일 시행 법무사 보수기준의 부동산등기 기본보수 상한을 기준으로 계산했습니다. 실제 보수에는 사건의 난이도, 가산보수, 대행료, 교통비·일당 등 실비가 추가되거나 협의에 따라 달라질 수 있습니다.',
  };
}
