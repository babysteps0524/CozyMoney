export type VatMode = 'supply' | 'total' | 'tax' | 'payable';

export interface VatInput {
  mode: VatMode;
  amount: number;
  ratePercent: number;
  inputTax?: number;
}

export interface VatResult {
  supply: number;
  tax: number;
  total: number;
  payable: number;
}

export function calculateVat(input: VatInput): VatResult {
  const rate = input.ratePercent / 100;
  let supply = 0;
  let tax = 0;
  let total = 0;
  let payable = 0;

  if (input.mode === 'supply' || input.mode === 'payable') {
    supply = input.amount;
    tax = supply * rate;
    total = supply + tax;
    if (input.mode === 'payable') payable = tax - (input.inputTax ?? 0);
  } else if (input.mode === 'total') {
    total = input.amount;
    supply = total / (1 + rate);
    tax = total - supply;
  } else {
    tax = input.amount;
    supply = rate === 0 ? Number.NaN : tax / rate;
    total = supply + tax;
  }

  return { supply, tax, total, payable };
}
