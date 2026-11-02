/**
 * 양도소득세 법령 버전 데이터.
 *
 * 새 연도/개정은 이 파일에 적용 시작일이 있는 새 버전을 추가합니다.
 * 법령 해석이 필요한 특례(상생임대, 일시적 2주택, 상속·혼인·봉양, 농어촌주택 등)는
 * 자동으로 단정하지 않고 계산 결과에 확인 항목을 표시합니다.
 */
export interface CapitalGainRuleVersion {
  id: string;
  effectiveFrom: string;
  effectiveTo?: string;
  taxYear: number;
  highValueHomeThreshold: number;
  basicDeduction: number;
  generalLtcgStartYears: number;
  generalLtcgRatePerYear: number;
  generalLtcgMaxRate: number;
  homeLtcgOwnershipStartYears: number;
  homeLtcgOwnershipRatePerYear: number;
  homeLtcgOwnershipMaxRate: number;
  homeLtcgResidenceStartYears: number;
  homeLtcgResidenceRatePerYear: number;
  homeLtcgResidenceMaxRate: number;
  ordinaryBrackets: Array<{
    limit: number;
    rate: number;
    progressiveDeduction: number;
  }>;
  shortTermPropertyUnderOneYear: number;
  shortTermPropertyOneToTwoYears: number;
  multiHomeTwoExtraRate: number;
  multiHomeThreePlusExtraRate: number;
  multiHomeSurchargeFrom: string;
  multiHomeSurchargeUntil?: string;
  multiHomeSurchargeAppliesOnlyRegulatedArea: boolean;
}

/**
 * 2026년 규칙을 적용 시작일·종료일과 함께 데이터로 분리했습니다.
 * 새 연도 버전을 추가하기 전에는 해당 연도 양도일 계산을 허용하지 않습니다.
 */
export const CAPITAL_GAIN_RULE_VERSIONS: CapitalGainRuleVersion[] = [
  {
    id: 'kr-2026',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31',
    taxYear: 2026,
    highValueHomeThreshold: 1_200_000_000,
    basicDeduction: 2_500_000,
    generalLtcgStartYears: 3,
    generalLtcgRatePerYear: 0.02,
    generalLtcgMaxRate: 0.3,
    homeLtcgOwnershipStartYears: 3,
    homeLtcgOwnershipRatePerYear: 0.04,
    homeLtcgOwnershipMaxRate: 0.4,
    homeLtcgResidenceStartYears: 2,
    homeLtcgResidenceRatePerYear: 0.04,
    homeLtcgResidenceMaxRate: 0.4,
    ordinaryBrackets: [
      { limit: 14_000_000, rate: 0.06, progressiveDeduction: 0 },
      { limit: 50_000_000, rate: 0.15, progressiveDeduction: 1_260_000 },
      { limit: 88_000_000, rate: 0.24, progressiveDeduction: 5_760_000 },
      { limit: 150_000_000, rate: 0.35, progressiveDeduction: 15_440_000 },
      { limit: 300_000_000, rate: 0.38, progressiveDeduction: 19_940_000 },
      { limit: 500_000_000, rate: 0.4, progressiveDeduction: 25_940_000 },
      { limit: 1_000_000_000, rate: 0.42, progressiveDeduction: 35_940_000 },
      {
        limit: Number.POSITIVE_INFINITY,
        rate: 0.45,
        progressiveDeduction: 65_940_000,
      },
    ],
    shortTermPropertyUnderOneYear: 0.7,
    shortTermPropertyOneToTwoYears: 0.6,
    multiHomeTwoExtraRate: 0.2,
    multiHomeThreePlusExtraRate: 0.3,
    multiHomeSurchargeFrom: '2026-05-10',
    multiHomeSurchargeAppliesOnlyRegulatedArea: true,
  },
];

export function getCapitalGainRules(saleDate: string): CapitalGainRuleVersion {
  const valid = CAPITAL_GAIN_RULE_VERSIONS.filter(
    (rule) =>
      rule.effectiveFrom <= saleDate &&
      (!rule.effectiveTo || saleDate <= rule.effectiveTo),
  ).sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));
  if (!valid[0]) {
    throw new RangeError(
      `양도일 ${saleDate}에 적용할 양도소득세 규칙 버전이 없습니다.`,
    );
  }
  return valid[0];
}
