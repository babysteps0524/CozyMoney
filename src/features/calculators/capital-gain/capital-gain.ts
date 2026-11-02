import { getCapitalGainRules } from './rules';

export interface CapitalGainInput {
  salePrice: number;
  purchasePrice: number;
  costs: number;
  acquisitionDate?: string;
  saleDate?: string;
  residenceYears?: number;
  householdHomeCount?: number;
  isDomesticHome?: boolean;
  isRegulatedArea?: boolean;
  acquiredInRegulatedAreaAfter2017?: boolean;
  isSingleHouseholdHome?: boolean;
  hasSpecialExemption?: boolean;
  /** 이전 UI와의 호환용. 새 UI에서는 날짜·법령 기준으로 자동 판정합니다. */
  taxRate?: number;
}

export interface CapitalGainEstimate {
  ruleVersion: string;
  holdingYears: number;
  gain: number;
  exemptAsSingleHome: boolean;
  highValueHomeApportionment: number;
  taxableGainBeforeDeduction: number;
  longTermDeductionRate: number;
  longTermDeduction: number;
  taxableIncome: number;
  appliedRate: number;
  rateLabel: string;
  capitalGainsTax: number;
  localIncomeTax: number;
  totalEstimatedTax: number;
  /** 이전 UI 호환 alias */
  estimatedTax: number;
  multiHomeSurchargeApplied: boolean;
  warnings: string[];
}

const nonNegative = (value: number) =>
  Number.isFinite(value) ? Math.max(0, value) : 0;

function validDate(value: string, label: string): Date {
  const date = new Date(`${value}T00:00:00Z`);
  if (
    !value ||
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new RangeError(`${label}을(를) 올바르게 입력해 주세요.`);
  }
  return date;
}

function elapsedYears(from: string, to: string): number {
  const start = validDate(from, '취득일');
  const end = validDate(to, '양도일');
  if (end < start)
    throw new RangeError('양도일은 취득일보다 빠를 수 없습니다.');
  let years = end.getUTCFullYear() - start.getUTCFullYear();
  const anniversary = new Date(
    Date.UTC(
      start.getUTCFullYear() + years,
      start.getUTCMonth(),
      start.getUTCDate(),
    ),
  );
  if (anniversary > end) years -= 1;
  return Math.max(0, years);
}

function ordinaryTax(
  taxableIncome: number,
  rules: ReturnType<typeof getCapitalGainRules>,
): number {
  const bracket =
    rules.ordinaryBrackets.find((item) => taxableIncome <= item.limit) ??
    rules.ordinaryBrackets[rules.ordinaryBrackets.length - 1];
  return Math.max(
    0,
    taxableIncome * bracket.rate - bracket.progressiveDeduction,
  );
}

function ordinaryRate(
  taxableIncome: number,
  rules: ReturnType<typeof getCapitalGainRules>,
): number {
  return (
    rules.ordinaryBrackets.find((item) => taxableIncome <= item.limit) ??
    rules.ordinaryBrackets[rules.ordinaryBrackets.length - 1]
  ).rate;
}

export function calculateCapitalGain(
  input: CapitalGainInput,
): CapitalGainEstimate {
  const salePrice = nonNegative(input.salePrice);
  const purchasePrice = nonNegative(input.purchasePrice);
  const costs = nonNegative(input.costs);
  const residenceYears = nonNegative(input.residenceYears ?? 0);
  const householdHomeCount = Math.max(
    1,
    Math.floor(nonNegative(input.householdHomeCount ?? 1)),
  );
  const acquisitionDate = input.acquisitionDate || '2023-01-01';
  const saleDate = input.saleDate || '2026-10-16';
  const rules = getCapitalGainRules(saleDate);
  const holdingYears = elapsedYears(acquisitionDate, saleDate);
  const gain = salePrice - purchasePrice - costs;
  const warnings: string[] = [];

  if (gain <= 0 || salePrice <= 0) {
    return {
      ruleVersion: rules.id,
      holdingYears,
      gain,
      exemptAsSingleHome: false,
      highValueHomeApportionment: 0,
      taxableGainBeforeDeduction: 0,
      longTermDeductionRate: 0,
      longTermDeduction: 0,
      taxableIncome: 0,
      appliedRate: 0,
      rateLabel: '과세표준 없음',
      capitalGainsTax: 0,
      localIncomeTax: 0,
      totalEstimatedTax: 0,
      estimatedTax: 0,
      multiHomeSurchargeApplied: false,
      warnings: [
        '양도차익이 0원 이하이므로 예상 세액은 0원입니다. 손실의 통산·이월 가능 여부는 계산하지 않습니다.',
      ],
    };
  }

  const qualifiesAsSingleHome =
    input.isDomesticHome &&
    input.isSingleHouseholdHome &&
    householdHomeCount === 1 &&
    holdingYears >= 2 &&
    (!input.acquiredInRegulatedAreaAfter2017 || residenceYears >= 2);

  if (input.hasSpecialExemption) {
    warnings.push(
      '일시적 2주택·상속·혼인·봉양·농어촌주택·상생임대 등 특례는 개별 요건과 경과규정 확인이 필요합니다. 입력한 특례 선택만으로 비과세를 확정하지 않습니다.',
    );
  }

  const exemptAsSingleHome =
    qualifiesAsSingleHome &&
    !input.hasSpecialExemption &&
    salePrice <= rules.highValueHomeThreshold;
  if (exemptAsSingleHome) {
    return {
      ruleVersion: rules.id,
      holdingYears,
      gain,
      exemptAsSingleHome: true,
      highValueHomeApportionment: 0,
      taxableGainBeforeDeduction: 0,
      longTermDeductionRate: 0,
      longTermDeduction: 0,
      taxableIncome: 0,
      appliedRate: 0,
      rateLabel: '1세대 1주택 비과세(입력 조건 기준)',
      capitalGainsTax: 0,
      localIncomeTax: 0,
      totalEstimatedTax: 0,
      estimatedTax: 0,
      multiHomeSurchargeApplied: false,
      warnings: [
        '입력 조건상 1세대 1주택 비과세 요건을 충족하는 것으로 추정했습니다. 세대 구성·주택 보유 이력·예외 특례를 별도로 확인해야 합니다.',
      ],
    };
  }

  let taxableGainBeforeDeduction = gain;
  let highValueHomeApportionment = 1;
  if (qualifiesAsSingleHome && salePrice > rules.highValueHomeThreshold) {
    highValueHomeApportionment = Math.max(
      0,
      (salePrice - rules.highValueHomeThreshold) / salePrice,
    );
    taxableGainBeforeDeduction = gain * highValueHomeApportionment;
  }

  const multiHomeSurchargeApplied =
    input.isDomesticHome === true &&
    householdHomeCount >= 2 &&
    input.isRegulatedArea === true &&
    holdingYears >= 2 &&
    saleDate >= rules.multiHomeSurchargeFrom &&
    (!rules.multiHomeSurchargeUntil ||
      saleDate > rules.multiHomeSurchargeUntil);

  let longTermDeductionRate = 0;
  if (holdingYears >= rules.generalLtcgStartYears) {
    longTermDeductionRate = Math.min(
      rules.generalLtcgMaxRate,
      holdingYears * rules.generalLtcgRatePerYear,
    );
  }
  if (
    qualifiesAsSingleHome &&
    holdingYears >= rules.homeLtcgOwnershipStartYears &&
    residenceYears >= rules.homeLtcgResidenceStartYears
  ) {
    const ownershipRate = Math.min(
      rules.homeLtcgOwnershipMaxRate,
      holdingYears * rules.homeLtcgOwnershipRatePerYear,
    );
    const residenceRate = Math.min(
      rules.homeLtcgResidenceMaxRate,
      residenceYears * rules.homeLtcgResidenceRatePerYear,
    );
    longTermDeductionRate = Math.min(0.8, ownershipRate + residenceRate);
  }
  if (multiHomeSurchargeApplied) longTermDeductionRate = 0;

  const longTermDeduction = taxableGainBeforeDeduction * longTermDeductionRate;
  const taxableIncome = Math.max(
    0,
    taxableGainBeforeDeduction - longTermDeduction - rules.basicDeduction,
  );
  const normalRate = ordinaryRate(taxableIncome, rules);
  const normalTax = ordinaryTax(taxableIncome, rules);
  let capitalGainsTax = normalTax;
  let appliedRate = normalRate;
  let rateLabel = `기본 누진세율 ${Math.round(normalRate * 100)}%`;

  if (holdingYears < 1) {
    const shortTax = taxableIncome * rules.shortTermPropertyUnderOneYear;
    if (shortTax > capitalGainsTax) {
      capitalGainsTax = shortTax;
      appliedRate = rules.shortTermPropertyUnderOneYear;
      rateLabel = '1년 미만 단기보유 세율 70%';
    }
    warnings.push(
      '1년 미만 보유 부동산의 단기세율과 기본세율 비교를 단순화했습니다. 자산 종류별 세율을 확인하세요.',
    );
  } else if (holdingYears < 2) {
    const shortTax = taxableIncome * rules.shortTermPropertyOneToTwoYears;
    if (shortTax > capitalGainsTax) {
      capitalGainsTax = shortTax;
      appliedRate = rules.shortTermPropertyOneToTwoYears;
      rateLabel = '1년 이상 2년 미만 단기보유 세율 60%';
    }
    warnings.push(
      '1년 이상 2년 미만 보유 부동산의 단기세율과 기본세율 비교를 단순화했습니다.',
    );
  }

  if (multiHomeSurchargeApplied) {
    const surcharge =
      householdHomeCount >= 3
        ? rules.multiHomeThreePlusExtraRate
        : rules.multiHomeTwoExtraRate;
    const surchargeTax = normalTax + taxableIncome * surcharge;
    if (surchargeTax > capitalGainsTax) {
      capitalGainsTax = surchargeTax;
      appliedRate = Math.min(0.75, normalRate + surcharge);
      rateLabel = `다주택 중과: 기본세율+${Math.round(surcharge * 100)}%p`;
    }
    warnings.push(
      '조정대상지역·주택 수·양도일 기준의 일반적인 다주택 중과를 적용했습니다. 중과 배제 주택 및 계약·허가 관련 경과규정은 자동 판정하지 않습니다.',
    );
  }

  if (!qualifiesAsSingleHome) {
    warnings.push(
      '1세대 1주택 비과세·우대 장기보유특별공제의 세대 및 예외 요건을 완전히 판정하지 않습니다.',
    );
  }
  if (
    input.isDomesticHome &&
    salePrice > rules.highValueHomeThreshold &&
    qualifiesAsSingleHome
  ) {
    warnings.push(
      '고가 1세대 1주택은 12억 원 초과 비율로 양도차익을 안분했습니다. 세부 안분 산식·부대요건은 신고 전 확인하세요.',
    );
  }
  warnings.push(
    '2026년 7월 1일 시행 법령 데이터 기준의 참고용 추정입니다. 양도일별 부칙, 자산 유형별 예외, 감면·세액공제, 신고세액 계산은 모두 포괄하지 않습니다.',
  );

  const localIncomeTax = capitalGainsTax * 0.1;
  return {
    ruleVersion: rules.id,
    holdingYears,
    gain,
    exemptAsSingleHome: false,
    highValueHomeApportionment,
    taxableGainBeforeDeduction,
    longTermDeductionRate,
    longTermDeduction,
    taxableIncome,
    appliedRate,
    rateLabel,
    capitalGainsTax,
    localIncomeTax,
    totalEstimatedTax: capitalGainsTax + localIncomeTax,
    estimatedTax:
      input.taxRate !== undefined
        ? (taxableIncome * nonNegative(input.taxRate)) / 100
        : capitalGainsTax + localIncomeTax,
    multiHomeSurchargeApplied,
    warnings,
  };
}
