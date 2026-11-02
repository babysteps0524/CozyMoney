import type { ToolHelpers } from '../../../lib/tool/helpers';
import { getUnitDefinition, convertUnit } from './unit';

export function mountUnitConverterTool(
  _root: HTMLElement,
  helpers: ToolHelpers,
): void {
  const { $, value, number, format, listen } = helpers;

  const calculate = () => {
    const category = value('unit-type');
    const definition = getUnitDefinition(category);
    const output = $('unit-result');

    if (!definition || !output) {
      if (output) output.textContent = '변환 종류를 확인하세요.';
      return;
    }

    const inputValue = number('unit-value');
    const direction = value('unit-direction');

    if (
      !Number.isFinite(inputValue) ||
      !definition.labels.includes(direction)
    ) {
      output.textContent = '값과 변환 방향을 확인하세요.';
      return;
    }

    const converted = convertUnit(category, inputValue, direction);
    output.textContent =
      converted === null ? '변환할 수 없는 값입니다.' : format(converted, 6);
  };

  const updateDirections = () => {
    const definition = getUnitDefinition(value('unit-type'));
    const directionSelect = $('unit-direction') as HTMLSelectElement | null;

    if (!definition || !directionSelect) {
      calculate();
      return;
    }

    directionSelect.replaceChildren(
      ...definition.labels.map((label) => {
        const option = document.createElement('option');
        option.value = label;
        option.textContent = label;
        return option;
      }),
    );

    calculate();
  };

  listen('unit-type', 'change', updateDirections);
  listen('unit-direction', 'change', calculate);
  listen('unit-value', 'input', calculate);

  updateDirections();
}
