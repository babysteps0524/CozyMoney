const CHARACTER_SETS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  number: '0123456789',
  symbol: '!@#$%^&*()-_=+[]{}?',
} as const;

export type PasswordCharacterSet = keyof typeof CHARACTER_SETS;

export function generatePassword(
  length: number,
  enabledSets: readonly PasswordCharacterSet[],
  randomIndex: (max: number) => number,
): string | null {
  const safeLength = Math.min(128, Math.max(4, Math.floor(length) || 16));
  const selectedSets = enabledSets.map((set) => CHARACTER_SETS[set]);
  if (!selectedSets.length) return null;

  const allCharacters = selectedSets.join('');
  const characters = selectedSets.map((set) => set[randomIndex(set.length)]);
  while (characters.length < safeLength) {
    characters.push(allCharacters[randomIndex(allCharacters.length)]);
  }
  for (let index = characters.length - 1; index > 0; index--) {
    const swapIndex = randomIndex(index + 1);
    [characters[index], characters[swapIndex]] = [
      characters[swapIndex],
      characters[index],
    ];
  }
  return characters.join('');
}
