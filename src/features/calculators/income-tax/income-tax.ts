export interface IncomeTaxInput {
  businessIncome: number;
  wageIncome: number;
  pensionIncome: number;
  interestIncome: number;
  dividendIncome: number;
  otherIncome: number;
  otherIncomeExpense: number;
  dependents: number;
  seniorDependents: number;
  disabledDependents: number;
  femaleAdditionalDeduction: number;
  singleParentDeduction: number;
  pensionInsurance: number;
  specialIncomeDeduction: number;
  otherIncomeDeduction: number;
  children: number;
  birthFirst: number;
  birthSecond: number;
  birthThirdPlus: number;
  pensionAccount: number;
  insurance: number;
  disabledInsurance: number;
  medicalSelfEtc: number;
  infertilityMedical: number;
  prematureMedical: number;
  otherMedical: number;
  actualReimbursement: number;
  educationSelf: number;
  educationDisabled: number;
  educationPreschool: number;
  educationSchool: number;
  educationUniversity: number;
  rentPayment: number;
  standardTaxCredit: number;
  otherTaxCredit: number;
  withholdingTax: number;
  prepaidTax: number;
  penaltyTax: number;
}

export interface IncomeTaxResult {
  businessIncome: number;
  earnedIncomeDeduction: number;
  earnedIncome: number;
  pensionIncomeDeduction: number;
  pensionIncome: number;
  otherIncome: number;
  totalIncome: number;
  basicDeduction: number;
  additionalDeduction: number;
  totalIncomeDeduction: number;
  taxableIncome: number;
  taxRate: number;
  progressiveDeduction: number;
  calculatedTax: number;
  earnedIncomeTaxCredit: number;
  childTaxCredit: number;
  pensionAccountTaxCredit: number;
  insuranceTaxCredit: number;
  medicalTaxCredit: number;
  educationTaxCredit: number;
  rentTaxCredit: number;
  standardOrSpecialTaxCredit: number;
  otherTaxCredit: number;
  totalTaxCredit: number;
  determinedTax: number;
  finalTax: number;
}

const clampNonNegative = (value: number) =>
  Number.isFinite(value) ? Math.max(0, value) : 0;

export function calculateEarnedIncomeDeduction(grossWage: number): number {
  const wage = clampNonNegative(grossWage);
  let deduction = 0;
  if (wage <= 5_000_000) deduction = wage * 0.7;
  else if (wage <= 15_000_000) deduction = 3_500_000 + (wage - 5_000_000) * 0.4;
  else if (wage <= 45_000_000)
    deduction = 7_500_000 + (wage - 15_000_000) * 0.15;
  else if (wage <= 100_000_000)
    deduction = 12_000_000 + (wage - 45_000_000) * 0.05;
  else deduction = 14_750_000 + (wage - 100_000_000) * 0.02;
  return Math.min(deduction, 20_000_000);
}

export function calculatePensionIncomeDeduction(totalPension: number): number {
  const pension = clampNonNegative(totalPension);
  let deduction = 0;
  if (pension <= 3_500_000) deduction = pension;
  else if (pension <= 7_000_000)
    deduction = 3_500_000 + (pension - 3_500_000) * 0.4;
  else if (pension <= 14_000_000)
    deduction = 4_900_000 + (pension - 7_000_000) * 0.2;
  else deduction = 6_300_000 + (pension - 14_000_000) * 0.1;
  return Math.min(deduction, 9_000_000);
}

export function getIncomeTaxRate(taxableIncome: number): {
  rate: number;
  progressiveDeduction: number;
} {
  const taxBase = clampNonNegative(taxableIncome);
  if (taxBase <= 14_000_000) return { rate: 0.06, progressiveDeduction: 0 };
  if (taxBase <= 50_000_000)
    return { rate: 0.15, progressiveDeduction: 1_260_000 };
  if (taxBase <= 88_000_000)
    return { rate: 0.24, progressiveDeduction: 5_760_000 };
  if (taxBase <= 150_000_000)
    return { rate: 0.35, progressiveDeduction: 15_440_000 };
  if (taxBase <= 300_000_000)
    return { rate: 0.38, progressiveDeduction: 19_940_000 };
  if (taxBase <= 500_000_000)
    return { rate: 0.4, progressiveDeduction: 25_940_000 };
  if (taxBase <= 1_000_000_000)
    return { rate: 0.42, progressiveDeduction: 35_940_000 };
  return { rate: 0.45, progressiveDeduction: 65_940_000 };
}

export function calculateEarnedIncomeTaxCredit(
  calculatedTax: number,
  grossWage: number,
): number {
  const tax = clampNonNegative(calculatedTax);
  const wage = clampNonNegative(grossWage);
  if (wage <= 0 || tax <= 0) return 0;

  // 소득세법 제59조: 산출세액 130만원 이하 55%, 초과분 30%를 공제한다.
  const rawCredit =
    tax <= 1_300_000 ? tax * 0.55 : 715_000 + (tax - 1_300_000) * 0.3;

  // 총급여액에 따라 법정 세액공제 한도를 적용한다.
  let creditLimit = 740_000;
  if (wage > 33_000_000 && wage <= 70_000_000) {
    creditLimit = Math.max(660_000, 740_000 - (wage - 33_000_000) * 0.008);
  } else if (wage > 70_000_000 && wage <= 120_000_000) {
    creditLimit = Math.max(500_000, 660_000 - (wage - 70_000_000) * 0.5);
  } else if (wage > 120_000_000) {
    creditLimit = Math.max(200_000, 500_000 - (wage - 120_000_000) * 0.5);
  }

  return Math.min(rawCredit, creditLimit);
}

function calculateChildTaxCredit(children: number): number {
  const count = Math.floor(clampNonNegative(children));
  if (count <= 0) return 0;
  if (count === 1) return 250_000;
  if (count === 2) return 550_000;
  return 550_000 + (count - 2) * 400_000;
}

function calculatePensionAccountTaxCredit(
  pensionAccount: number,
  totalIncome: number,
): number {
  const contribution = clampNonNegative(pensionAccount);
  const limit = 9_000_000;
  const eligible = Math.min(contribution, limit);
  const rate = totalIncome <= 45_000_000 ? 0.15 : 0.12;
  return eligible * rate;
}

function calculateMedicalTaxCredit(
  totalWage: number,
  selfEtc: number,
  infertility: number,
  premature: number,
  other: number,
  reimbursement: number,
): number {
  const wage = clampNonNegative(totalWage);
  const general = Math.max(0, Math.min(clampNonNegative(other), 7_000_000));
  const special = Math.max(
    0,
    clampNonNegative(selfEtc) +
      clampNonNegative(infertility) +
      clampNonNegative(premature),
  );
  const reimbursed = clampNonNegative(reimbursement);
  if (general + special <= reimbursed) return 0;

  // 일반 의료비에만 총급여액의 3% 기준을 적용한다.
  // 본인·6세 이하·65세 이상·장애인 의료비와 난임·미숙아/선천성이상아
  // 관련 의료비는 3% 기준을 적용하지 않는다.
  const threshold = wage * 0.03;
  const generalEligible = Math.max(0, general - threshold);

  const self = clampNonNegative(selfEtc);
  const infertilityAmount = clampNonNegative(infertility);
  const prematureAmount = clampNonNegative(premature);

  return (
    generalEligible * 0.15 +
    self * 0.15 +
    infertilityAmount * 0.3 +
    prematureAmount * 0.2
  );
}

export function calculateIncomeTax(input: IncomeTaxInput): IncomeTaxResult {
  const businessIncome = clampNonNegative(input.businessIncome);
  const wageGross = clampNonNegative(input.wageIncome);
  const pensionGross = clampNonNegative(input.pensionIncome);
  const interestIncome = clampNonNegative(input.interestIncome);
  const dividendIncome = clampNonNegative(input.dividendIncome);
  const otherIncome = Math.max(
    0,
    clampNonNegative(input.otherIncome) -
      clampNonNegative(input.otherIncomeExpense),
  );

  const earnedIncomeDeduction = calculateEarnedIncomeDeduction(wageGross);
  const earnedIncome = Math.max(0, wageGross - earnedIncomeDeduction);
  const pensionIncomeDeduction = calculatePensionIncomeDeduction(pensionGross);
  const pensionIncomeAmount = Math.max(
    0,
    pensionGross - pensionIncomeDeduction,
  );

  const totalIncome =
    businessIncome +
    earnedIncome +
    pensionIncomeAmount +
    interestIncome +
    dividendIncome +
    otherIncome;

  const basicDeduction =
    Math.max(1, Math.floor(clampNonNegative(input.dependents))) * 1_500_000;
  const additionalDeduction =
    Math.floor(clampNonNegative(input.seniorDependents)) * 1_000_000 +
    Math.floor(clampNonNegative(input.disabledDependents)) * 2_000_000 +
    clampNonNegative(input.femaleAdditionalDeduction) +
    clampNonNegative(input.singleParentDeduction);

  const totalIncomeDeduction =
    basicDeduction +
    additionalDeduction +
    clampNonNegative(input.pensionInsurance) +
    clampNonNegative(input.specialIncomeDeduction) +
    clampNonNegative(input.otherIncomeDeduction);

  const taxableIncome = Math.max(0, totalIncome - totalIncomeDeduction);
  const { rate, progressiveDeduction } = getIncomeTaxRate(taxableIncome);
  const calculatedTax = Math.max(
    0,
    taxableIncome * rate - progressiveDeduction,
  );

  const earnedIncomeTaxCredit = calculateEarnedIncomeTaxCredit(
    calculatedTax,
    wageGross,
  );
  const childTaxCredit =
    calculateChildTaxCredit(input.children) +
    Math.floor(clampNonNegative(input.birthFirst)) * 300_000 +
    Math.floor(clampNonNegative(input.birthSecond)) * 500_000 +
    Math.floor(clampNonNegative(input.birthThirdPlus)) * 700_000;

  const pensionAccountTaxCredit = calculatePensionAccountTaxCredit(
    input.pensionAccount,
    totalIncome,
  );
  const insuranceTaxCredit =
    Math.min(clampNonNegative(input.insurance), 1_000_000) * 0.12 +
    Math.min(clampNonNegative(input.disabledInsurance), 1_000_000) * 0.15;
  const medicalTaxCredit = calculateMedicalTaxCredit(
    wageGross,
    input.medicalSelfEtc,
    input.infertilityMedical,
    input.prematureMedical,
    input.otherMedical,
    input.actualReimbursement,
  );
  const educationEligible =
    clampNonNegative(input.educationSelf) +
    clampNonNegative(input.educationDisabled) +
    Math.min(clampNonNegative(input.educationPreschool), 3_000_000) +
    Math.min(clampNonNegative(input.educationSchool), 3_000_000) +
    Math.min(clampNonNegative(input.educationUniversity), 9_000_000);
  const educationTaxCredit = educationEligible * 0.15;

  const rent = clampNonNegative(input.rentPayment);
  let rentTaxCredit = 0;
  if (
    wageGross > 0 &&
    wageGross <= 80_000_000 &&
    totalIncome <= 70_000_000 &&
    rent > 0
  ) {
    const eligibleRent = Math.min(rent, 10_000_000);
    rentTaxCredit =
      eligibleRent *
      (wageGross <= 55_000_000 && totalIncome <= 45_000_000 ? 0.17 : 0.15);
  }

  const specialTaxCredit =
    insuranceTaxCredit + medicalTaxCredit + educationTaxCredit + rentTaxCredit;
  const standardTaxCredit = clampNonNegative(input.standardTaxCredit);
  const standardOrSpecialTaxCredit = Math.max(
    standardTaxCredit,
    specialTaxCredit,
  );

  const totalTaxCredit =
    earnedIncomeTaxCredit +
    childTaxCredit +
    pensionAccountTaxCredit +
    standardOrSpecialTaxCredit +
    clampNonNegative(input.otherTaxCredit);

  const determinedTax = Math.max(0, calculatedTax - totalTaxCredit);
  const finalTax =
    determinedTax +
    clampNonNegative(input.penaltyTax) -
    clampNonNegative(input.withholdingTax) -
    clampNonNegative(input.prepaidTax);

  return {
    businessIncome,
    earnedIncomeDeduction,
    earnedIncome,
    pensionIncomeDeduction,
    pensionIncome: pensionIncomeAmount,
    otherIncome,
    totalIncome,
    basicDeduction,
    additionalDeduction,
    totalIncomeDeduction,
    taxableIncome,
    taxRate: rate,
    progressiveDeduction,
    calculatedTax,
    earnedIncomeTaxCredit,
    childTaxCredit,
    pensionAccountTaxCredit,
    insuranceTaxCredit,
    medicalTaxCredit,
    educationTaxCredit,
    rentTaxCredit,
    standardOrSpecialTaxCredit,
    otherTaxCredit: clampNonNegative(input.otherTaxCredit),
    totalTaxCredit,
    determinedTax,
    finalTax,
  };
}
