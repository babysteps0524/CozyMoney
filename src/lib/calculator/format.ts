export function formatCalculatorNumber(
  value: number,
  maximumFractionDigits = 0,
): string {
  return Number.isFinite(value)
    ? value.toLocaleString('ko-KR', { maximumFractionDigits })
    : '-';
}

export function formatCalculatorWon(
  value: number,
  maximumFractionDigits = 0,
): string {
  return formatCalculatorNumber(value, maximumFractionDigits) + '원';
}
