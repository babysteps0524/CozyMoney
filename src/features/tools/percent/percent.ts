export type PercentOperation = 'of' | 'change' | 'discount' | 'increase';

export function calculatePercent(
  amount: number,
  comparison: number,
  operation: PercentOperation,
): number | null {
  if (!Number.isFinite(amount) || !Number.isFinite(comparison)) return null;
  switch (operation) {
    case 'of':
      return (amount * comparison) / 100;
    case 'change':
      return amount === 0 ? null : ((comparison - amount) / amount) * 100;
    case 'discount':
      return amount * (1 - comparison / 100);
    case 'increase':
      return amount * (1 + comparison / 100);
  }
}
