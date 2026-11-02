import type { ToolHelpers } from '../../../lib/tool/helpers';
import { pickRandomItem } from './picker';

export function mountRandomPickerTool(
  _root: HTMLElement,
  helpers: ToolHelpers,
): void {
  const { $, value, copy, secureRandom, listen } = helpers;

  listen('picker-draw', 'click', () => {
    const items = value('picker-items')
      .split(/\n/)
      .map((item) => item.trim())
      .filter(Boolean);
    const output = $('picker-result');

    if (!output) return;

    output.textContent = items.length
      ? (pickRandomItem(items, secureRandom) ?? '')
      : '추첨할 항목을 입력하세요.';
  });

  listen('picker-copy', 'click', () => {
    void copy(value('picker-result'), 'picker-copy');
  });
}
