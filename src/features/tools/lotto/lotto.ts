export function generateLottoNumbers(
  randomIndex: (max: number) => number,
): number[] {
  const numbers: number[] = [];
  while (numbers.length < 6) {
    const number = randomIndex(45) + 1;
    if (!numbers.includes(number)) numbers.push(number);
  }
  return numbers.sort((a, b) => a - b);
}
