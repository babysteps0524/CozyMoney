export type CarTaxFuel = 'combustion' | 'electric';
export type CarTaxUse = 'private' | 'business';

export interface CarTaxInput {
  displacementCc: number;
  firstRegistrationYear: number | null;
  taxYear: number;
  fuel: CarTaxFuel;
  use: CarTaxUse;
}

export interface CarTaxResult {
  vehicleTax: number;
  ageReductionRate: number;
  ageReductionAmount: number;
  vehicleTaxAfterReduction: number;
  educationTax: number;
  annualTotal: number;
  firstHalfTotal: number;
  secondHalfTotal: number;
  ratePerCc: number | null;
  vehicleAge: number | null;
}

function getRatePerCc(displacementCc: number, use: CarTaxUse): number {
  if (use === 'business') {
    if (displacementCc <= 1600) return 18;
    if (displacementCc <= 2500) return 19;
    return 24;
  }

  if (displacementCc <= 1000) return 80;
  if (displacementCc <= 1600) return 140;
  return 200;
}

export function calculateCarTax(input: CarTaxInput): CarTaxResult {
  const { displacementCc, firstRegistrationYear, taxYear, fuel, use } = input;

  if (!Number.isFinite(taxYear) || taxYear < 1900) {
    throw new RangeError('과세연도를 확인해 주세요.');
  }
  if (
    fuel === 'combustion' &&
    (!Number.isFinite(displacementCc) || displacementCc <= 0)
  ) {
    throw new RangeError('배기량은 1cc 이상 입력해 주세요.');
  }
  if (
    firstRegistrationYear !== null &&
    (!Number.isInteger(firstRegistrationYear) ||
      firstRegistrationYear < 1900 ||
      firstRegistrationYear > taxYear)
  ) {
    throw new RangeError('최초 등록연도는 과세연도보다 클 수 없습니다.');
  }

  const vehicleAge =
    firstRegistrationYear === null ? null : taxYear - firstRegistrationYear + 1;
  const ageReductionRate =
    fuel === 'combustion' && use === 'private' && vehicleAge !== null
      ? Math.min(50, Math.max(0, vehicleAge - 2) * 5)
      : 0;

  const ratePerCc =
    fuel === 'electric' ? null : getRatePerCc(displacementCc, use);
  const vehicleTax =
    fuel === 'electric'
      ? use === 'private'
        ? 100_000
        : 20_000
      : displacementCc * (ratePerCc ?? 0);

  const ageReductionAmount = Math.floor((vehicleTax * ageReductionRate) / 100);
  const vehicleTaxAfterReduction = vehicleTax - ageReductionAmount;
  const educationTax =
    use === 'private' ? Math.floor(vehicleTaxAfterReduction * 0.3) : 0;
  const annualTotal = vehicleTaxAfterReduction + educationTax;
  const firstHalfTotal = Math.floor(annualTotal / 2);

  return {
    vehicleTax,
    ageReductionRate,
    ageReductionAmount,
    vehicleTaxAfterReduction,
    educationTax,
    annualTotal,
    firstHalfTotal,
    secondHalfTotal: annualTotal - firstHalfTotal,
    ratePerCc,
    vehicleAge,
  };
}
