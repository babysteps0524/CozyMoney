import type { CalculatorDefinition } from './types';
import { definition as dtiDefinition } from './dti/content';
import { definition as dsrDefinition } from './dsr/content';
import { definition as rentDefinition } from './rent/content';
import { definition as carTaxDefinition } from './car-tax/content';
import { definition as weeklyDefinition } from './weekly/content';
import { definition as compoundDefinition } from './compound/content';
import { definition as leaseLoanDefinition } from './lease-loan/content';
import { definition as hourlywageDefinition } from './hourly-wage/content';
import { definition as capitalGainDefinition } from './capital-gain/content';
import { definition as percentageDefinition } from './percentage/content';
import { definition as legalscrivenerDefinition } from './legal-scrivener/content';
import { definition as acquisitionDefinition } from './acquisition/content';
import { definition as brokerageDefinition } from './brokerage/content';
import { definition as incomeTaxDefinition } from './income-tax/content';
import { definition as loanDefinition } from './loan/content';
import { definition as monthlysalaryDefinition } from './monthly-salary/content';
import { definition as propertyDefinition } from './property/content';
import { definition as salaryDefinition } from './salary/content';
import { definition as savingsDefinition } from './savings/content';
import { definition as severanceDefinition } from './severance/content';
import { definition as unemploymentDefinition } from './unemployment/content';
import { definition as vacationDefinition } from './vacation/content';
import { definition as vatDefinition } from './vat/content';

export const calculatorDefinitions: Record<string, CalculatorDefinition> = {
  dti: dtiDefinition,
  dsr: dsrDefinition,
  rent: rentDefinition,
  carTax: carTaxDefinition,
  weekly: weeklyDefinition,
  compound: compoundDefinition,
  leaseLoan: leaseLoanDefinition,
  'hourly-wage': hourlywageDefinition,
  capitalGain: capitalGainDefinition,
  percentage: percentageDefinition,
  'legal-scrivener': legalscrivenerDefinition,
  acquisition: acquisitionDefinition,
  brokerage: brokerageDefinition,
  incomeTax: incomeTaxDefinition,
  loan: loanDefinition,
  'monthly-salary': monthlysalaryDefinition,
  property: propertyDefinition,
  salary: salaryDefinition,
  savings: savingsDefinition,
  severance: severanceDefinition,
  unemployment: unemploymentDefinition,
  vacation: vacationDefinition,
  vat: vatDefinition,
};
