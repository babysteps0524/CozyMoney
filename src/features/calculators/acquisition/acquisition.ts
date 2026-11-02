export type AcquisitionCause = 'purchase' | 'gift' | 'inheritance' | 'original';
export type AcquisitionAsset = 'house' | 'officetel' | 'farmland' | 'other';

export interface AcquisitionTaxInput {
  price: number;
  cause: AcquisitionCause;
  asset: AcquisitionAsset;
  houseCount: 1 | 2 | 3 | 4;
  regulatedArea: boolean;
  areaOver85: boolean;
  corporation: boolean;
  firstHome: boolean;
  firstHomePopulationDecline: boolean;
}

export interface AcquisitionTaxResult {
  taxableBase: number;
  acquisitionRate: number;
  acquisitionTax: number;
  localEducationTax: number;
  ruralSpecialTax: number;
  totalTax: number;
  firstHomeReduction: number;
  explanation: string;
}

const nonNegative = (value: number) =>
  Math.max(0, Number.isFinite(value) ? value : 0);

function progressiveHouseRate(price: number): number {
  if (price <= 600_000_000) return 0.01;
  if (price > 900_000_000) return 0.03;
  const rate = (price * (2 / 300_000_000) - 3) / 100;
  return Math.round(rate * 10000) / 10000;
}

export function calculateAcquisitionTax(
  input: AcquisitionTaxInput,
): AcquisitionTaxResult {
  const price = nonNegative(input.price);
  const base = price;
  let rate = 0;
  let explanation = '';

  if (input.cause === 'purchase' && input.asset === 'house') {
    if (input.corporation) {
      rate = 0.12;
      explanation =
        '법인의 주택 유상취득에 대한 대표적인 중과세율을 적용했습니다.';
    } else if (input.houseCount >= 3 && input.regulatedArea) {
      rate = 0.12;
      explanation =
        '3주택 이상·조정대상지역 주택 취득의 대표 중과세율을 적용했습니다.';
    } else if (input.houseCount >= 4 && !input.regulatedArea) {
      rate = 0.12;
      explanation =
        '4주택 이상·비조정대상지역 주택 취득의 대표 중과세율을 적용했습니다.';
    } else if (input.houseCount === 2 && input.regulatedArea) {
      rate = 0.08;
      explanation =
        '2주택·조정대상지역 주택 취득의 대표 중과세율을 적용했습니다.';
    } else if (input.houseCount === 3 && !input.regulatedArea) {
      rate = 0.08;
      explanation =
        '3주택·비조정대상지역 주택 취득의 대표 중과세율을 적용했습니다.';
    } else {
      rate = progressiveHouseRate(price);
      explanation =
        '중과 제외 주택의 6억원·9억원 구간별 일반세율을 적용했습니다.';
    }
  } else if (input.asset === 'farmland') {
    rate = input.cause === 'inheritance' ? 0.023 : 0.03;
    explanation =
      input.cause === 'inheritance'
        ? '농지 상속취득의 기본세율을 적용했습니다.'
        : '농지 유상취득의 기본세율을 적용했습니다. 자경 등 감면요건은 별도입니다.';
  } else if (input.cause === 'inheritance') {
    rate = 0.028;
    explanation = '농지 외 상속취득의 기본세율을 적용했습니다.';
  } else if (input.cause === 'gift') {
    rate = 0.035;
    explanation =
      '무상취득(증여)의 일반세율을 적용했습니다. 주택 증여 중과 여부는 별도 요건 확인이 필요합니다.';
  } else if (
    input.cause === 'purchase' &&
    (input.asset === 'officetel' || input.asset === 'other')
  ) {
    rate = 0.04;
    explanation = '주택 외 부동산의 유상취득에 대한 기본세율을 적용했습니다.';
  } else {
    rate = 0.028;
    explanation = '원시취득의 기본세율을 적용했습니다.';
  }

  let acquisitionTax = Math.round(base * rate);
  let firstHomeReduction = 0;

  if (
    input.firstHome &&
    input.cause === 'purchase' &&
    input.asset === 'house' &&
    !input.corporation &&
    price <= 1_200_000_000
  ) {
    const limit = input.firstHomePopulationDecline ? 3_000_000 : 2_000_000;
    firstHomeReduction = Math.min(acquisitionTax, limit);
    acquisitionTax -= firstHomeReduction;
    explanation += ` 생애최초 감면 한도 ${(limit / 10_000).toLocaleString('ko-KR')}만원을 반영했습니다.`;
  }

  let localEducationTax = 0;
  let ruralSpecialTax = 0;

  if (input.asset === 'house' && input.cause === 'purchase') {
    if (rate >= 0.08) {
      localEducationTax = Math.round(base * 0.004);
      ruralSpecialTax = input.areaOver85
        ? Math.round(base * (rate >= 0.12 ? 0.01 : 0.006))
        : 0;
    } else {
      localEducationTax = Math.round(acquisitionTax * 0.1);
      ruralSpecialTax = input.areaOver85 ? Math.round(base * 0.002) : 0;
    }
  } else if (input.asset === 'farmland') {
    localEducationTax = Math.round(
      base * (input.cause === 'inheritance' ? 0.0006 : 0.002),
    );
    ruralSpecialTax = input.areaOver85 ? Math.round(base * 0.002) : 0;
  } else if (input.cause === 'gift') {
    localEducationTax = Math.round(base * 0.003);
    ruralSpecialTax = input.areaOver85 ? Math.round(base * 0.002) : 0;
  } else if (input.cause === 'inheritance') {
    localEducationTax = Math.round(base * 0.0016);
    ruralSpecialTax = input.areaOver85 ? Math.round(base * 0.002) : 0;
  } else {
    localEducationTax = Math.round(base * 0.004);
    ruralSpecialTax = input.areaOver85 ? Math.round(base * 0.002) : 0;
  }

  return {
    taxableBase: base,
    acquisitionRate: rate,
    acquisitionTax,
    localEducationTax,
    ruralSpecialTax,
    totalTax: acquisitionTax + localEducationTax + ruralSpecialTax,
    firstHomeReduction,
    explanation,
  };
}
