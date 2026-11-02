export function pickRandomItem<T>(
  items: readonly T[],
  randomIndex: (max: number) => number,
): T | null {
  return items.length ? (items[randomIndex(items.length)] ?? null) : null;
}
