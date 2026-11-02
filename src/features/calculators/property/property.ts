export interface PropertyTaxAsset {
  id: string;
  assessedValue: number;
  ownershipShare: number;
  urbanArea: boolean;
  previousPropertyTax: number;
  previousUrbanAreaTax: number;
}

export interface PropertyTaxInput {
  year: number;
  oneHouseholdOneHome: boolean;
  taxBurdenCap: boolean;
  assets: PropertyTaxAsset[];
}

export interface PropertyTaxAssetResult {
  id: string;
  assessedValue: number;
  taxableBase: number;
  ownershipShare: number;
  propertyTaxBeforeCap: number;
  propertyTax: number;
  urbanAreaTax: number;
  localEducationTax: number;
  total: number;
  capApplied: boolean;
}

export interface PropertyTaxResult {
  taxableBase: number;
  propertyTax: number;
  urbanAreaTax: number;
  localEducationTax: number;
  total: number;
  assets: PropertyTaxAssetResult[];
  notes: string[];
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function getFairMarketRatio(
  assessedValue: number,
  oneHouseholdOneHome: boolean,
  year: number,
) {
  if (!oneHouseholdOneHome || year !== 2026) return 0.6;
  if (assessedValue <= 300_000_000) return 0.43;
  if (assessedValue <= 600_000_000) return 0.44;
  return 0.45;
}

function calculateHousingPropertyTax(
  taxableBase: number,
  specialRate: boolean,
) {
  if (specialRate) {
    if (taxableBase <= 60_000_000) return taxableBase * 0.0005;
    if (taxableBase <= 150_000_000)
      return 30_000 + (taxableBase - 60_000_000) * 0.001;
    if (taxableBase <= 300_000_000)
      return 120_000 + (taxableBase - 150_000_000) * 0.002;
    return 420_000 + (taxableBase - 300_000_000) * 0.0035;
  }

  if (taxableBase <= 60_000_000) return taxableBase * 0.001;
  if (taxableBase <= 150_000_000)
    return 60_000 + (taxableBase - 60_000_000) * 0.0015;
  if (taxableBase <= 300_000_000)
    return 195_000 + (taxableBase - 150_000_000) * 0.0025;
  return 570_000 + (taxableBase - 300_000_000) * 0.004;
}

function getCapRate(assessedValue: number) {
  if (assessedValue <= 300_000_000) return 1.05;
  if (assessedValue <= 600_000_000) return 1.1;
  return 1.3;
}

export function calculatePropertyTax(
  input: PropertyTaxInput,
): PropertyTaxResult {
  if (!Number.isInteger(input.year) || input.year < 2026) {
    throw new Error('현재 계산기는 2026년 기준으로 제공합니다.');
  }

  if (input.assets.length === 0) {
    throw new Error('재산세를 계산할 주택을 하나 이상 입력하세요.');
  }

  const assets = input.assets.map((asset) => {
    const assessedValue = Math.max(0, asset.assessedValue);
    const share = clamp(asset.ownershipShare || 100, 0, 100) / 100;
    const effectiveValue = assessedValue * share;
    const ratio = getFairMarketRatio(
      assessedValue,
      input.oneHouseholdOneHome,
      input.year,
    );
    const taxableBase = effectiveValue * ratio;
    const specialRate =
      input.oneHouseholdOneHome && assessedValue <= 900_000_000;
    const beforeCap = calculateHousingPropertyTax(taxableBase, specialRate);

    const previousTax = Math.max(0, asset.previousPropertyTax) * share;
    const capLimit =
      input.taxBurdenCap && previousTax > 0
        ? previousTax * getCapRate(assessedValue)
        : Number.POSITIVE_INFINITY;
    const propertyTax = input.taxBurdenCap
      ? Math.min(beforeCap, capLimit)
      : beforeCap;
    const capApplied = propertyTax < beforeCap;

    const urbanAreaTax = asset.urbanArea ? taxableBase * 0.0014 : 0;
    const localEducationTax = propertyTax * 0.2;

    return {
      id: asset.id,
      assessedValue,
      taxableBase,
      ownershipShare: share * 100,
      propertyTaxBeforeCap: beforeCap,
      propertyTax,
      urbanAreaTax,
      localEducationTax,
      total: propertyTax + urbanAreaTax + localEducationTax,
      capApplied,
    };
  });

  const result = {
    taxableBase: assets.reduce((sum, asset) => sum + asset.taxableBase, 0),
    propertyTax: assets.reduce((sum, asset) => sum + asset.propertyTax, 0),
    urbanAreaTax: assets.reduce((sum, asset) => sum + asset.urbanAreaTax, 0),
    localEducationTax: assets.reduce(
      (sum, asset) => sum + asset.localEducationTax,
      0,
    ),
    total: assets.reduce((sum, asset) => sum + asset.total, 0),
    assets,
    notes: [] as string[],
  };

  if (input.oneHouseholdOneHome) {
    result.notes.push(
      '1세대 1주택 특례의 공정시장가액비율과 세율을 적용했습니다.',
    );
  }
  if (input.taxBurdenCap && assets.some((asset) => asset.capApplied)) {
    result.notes.push(
      '입력한 전년도 재산세를 기준으로 세부담상한이 적용된 항목이 있습니다.',
    );
  }
  if (input.assets.some((asset) => asset.urbanArea)) {
    result.notes.push(
      '도시지역으로 선택한 주택에는 재산세 과세표준의 0.14% 도시지역분을 더했습니다.',
    );
  }
  result.notes.push('지방교육세는 재산세 납부세액의 20%로 계산했습니다.');
  result.notes.push(
    '현재 구현은 주택 재산세를 대상으로 하며, 실제 고지세액은 감면·조례·개별 조건에 따라 달라질 수 있습니다.',
  );

  return result;
}
