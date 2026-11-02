export function generateRandomNumber(
  minimum: number,
  maximum: number,
  randomIndex: (max: number) => number,
): number | null {
  const min = Math.ceil(minimum);
  const max = Math.floor(maximum);
  if (
    !Number.isSafeInteger(min) ||
    !Number.isSafeInteger(max) ||
    min > max ||
    max - min + 1 > 0x100000000
  )
    return null;
  return min + randomIndex(max - min + 1);
}
