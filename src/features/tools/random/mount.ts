import type { ToolHelpers } from '../../../lib/tool/helpers';
import { generateRandomNumber } from './random';

export function mountRandomNumberTool(
  _root: HTMLElement,
  helpers: ToolHelpers,
): void {
  const { $, number, secureRandom, listen } = helpers;

  const render = () => {
    const min = number('random-min');
    const max = number('random-max');
    const out = $('random-result');

    if (!out) return;
    const generated = generateRandomNumber(min, max, secureRandom);
    if (generated === null) {
      out.textContent = '최솟값과 최댓값을 확인하세요.';
      return;
    }

    out.textContent = String(generated);
  };

  listen('random-generate', 'click', render);
  render();
}
