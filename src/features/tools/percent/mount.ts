import type { ToolHelpers } from '../../../lib/tool/helpers';
import { calculatePercent } from './percent';

type PercentOperation = 'of' | 'change' | 'discount' | 'increase';

export function mountPercentCalculatorTool(
  _root: HTMLElement,
  helpers: ToolHelpers,
): void {
  const { $, value, number, format, listen } = helpers;

  const calculate = () => {
    const amount = number('percent-a');
    const comparison = number('percent-b');
    const operation = value('percent-type') as PercentOperation;
    const output = $('percent-result');

    if (!output) return;

    if (!Number.isFinite(amount) || !Number.isFinite(comparison)) {
      output.textContent = '숫자를 입력하세요.';
      return;
    }

    let result: string;

    switch (operation) {
      case 'of':
        result = format(calculatePercent(amount, comparison, 'of') ?? 0, 2);
        break;
      case 'change':
        result =
          amount !== 0
            ? format(calculatePercent(amount, comparison, 'change') ?? 0, 2) +
              '% 변화'
            : '계산할 수 없습니다.';
        break;
      case 'discount':
        result = format(
          calculatePercent(amount, comparison, 'discount') ?? 0,
          2,
        );
        break;
      case 'increase':
        result = format(
          calculatePercent(amount, comparison, 'increase') ?? 0,
          2,
        );
        break;
      default:
        result = '계산 종류를 선택하세요.';
    }

    output.textContent = result;
  };

  listen('percent-calc', 'click', calculate);
  calculate();
}
