export interface UnitDefinition {
  labels: string[];
  convert: (value: number, direction: string) => number;
}

export const UNITS: Record<string, UnitDefinition> = {
  length: {
    labels: ['m → km', 'km → m', 'cm → m', 'm → cm'],
    convert: (value, direction) =>
      direction === 'm → km'
        ? value / 1000
        : direction === 'km → m'
          ? value * 1000
          : direction === 'cm → m'
            ? value / 100
            : value * 100,
  },
  weight: {
    labels: ['kg → g', 'g → kg', 'kg → lb', 'lb → kg'],
    convert: (value, direction) =>
      direction === 'kg → g'
        ? value * 1000
        : direction === 'g → kg'
          ? value / 1000
          : direction === 'kg → lb'
            ? value * 2.2046226218
            : value / 2.2046226218,
  },
  temperature: {
    labels: ['℃ → ℉', '℉ → ℃'],
    convert: (value, direction) =>
      direction === '℃ → ℉' ? (value * 9) / 5 + 32 : ((value - 32) * 5) / 9,
  },
  area: {
    labels: ['㎡ → 평', '평 → ㎡'],
    convert: (value, direction) =>
      direction === '㎡ → 평' ? value / 3.305785 : value * 3.305785,
  },
  data: {
    labels: ['MB → GB', 'GB → MB', 'GB → TB', 'TB → GB'],
    convert: (value, direction) =>
      direction === 'MB → GB'
        ? value / 1024
        : direction === 'GB → MB'
          ? value * 1024
          : direction === 'GB → TB'
            ? value / 1024
            : value * 1024,
  },
};

export function getUnitDefinition(category: string): UnitDefinition | null {
  if (!Object.prototype.hasOwnProperty.call(UNITS, category)) return null;
  return UNITS[category] ?? null;
}

export function convertUnit(
  category: string,
  value: number,
  direction: string,
): number | null {
  const definition = getUnitDefinition(category);
  if (
    !definition ||
    !Number.isFinite(value) ||
    !definition.labels.includes(direction)
  )
    return null;
  return definition.convert(value, direction);
}
