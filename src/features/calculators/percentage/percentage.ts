export function calculatePercentageOf(value: number, rate: number): number {
  return (value * rate) / 100;
}

export function calculatePercentShare(part: number, whole: number): number {
  return whole === 0 ? Number.NaN : (part / whole) * 100;
}

export function calculatePercentChange(
  previous: number,
  current: number,
): number {
  return previous === 0 ? Number.NaN : ((current - previous) / previous) * 100;
}

export function adjustByPercent(
  value: number,
  rate: number,
  direction: 'increase' | 'decrease',
): number {
  return value * (direction === 'increase' ? 1 + rate / 100 : 1 - rate / 100);
}

export function calculateOriginalValue(part: number, rate: number): number {
  return rate === 0 ? Number.NaN : (part * 100) / rate;
}

export function calculatePercentagePointDifference(
  previous: number,
  current: number,
): number {
  return current - previous;
}
