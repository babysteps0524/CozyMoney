import type { ToolHelpers } from '../../../lib/tool/helpers';
import { generateLottoNumbers } from './lotto';

export function mountLottoTool(root: HTMLElement, helpers: ToolHelpers): void {
  const { $, value, copy, secureRandom, listen } = helpers;

  const render = () => {
    const count = Number(value('lotto-count')) || 1;
    const target = $('lotto-results');
    if (!target) return;

    target.innerHTML = Array.from({ length: count }, (_, index) => {
      const numbers = generateLottoNumbers(secureRandom);
      const oddCount = numbers.filter((number) => number % 2).length;
      const sum = numbers.reduce((total, number) => total + number, 0);

      return (
        '<div class="cm-result"><div flex="~" items-center justify-between gap="2">' +
        '<span text="xs text-subtle dark:dark-text-subtle" font="700">' +
        (index + 1) +
        '게임</span><span text="xs text-muted dark:dark-text-muted">홀 ' +
        oddCount +
        ' · 짝 ' +
        (6 - oddCount) +
        ' · 합 ' +
        sum +
        '</span></div><div flex="~ wrap" gap="2" mt="3">' +
        numbers
          .map((number) => '<span class="cm-number-ball">' + number + '</span>')
          .join('') +
        '</div></div>'
      );
    }).join('');
  };

  listen('lotto-generate', 'click', render);
  listen('lotto-count', 'change', render);
  listen('lotto-copy', 'click', () => {
    const cards = Array.from(root.querySelectorAll('.cm-result'));
    void copy(
      cards
        .map(
          (card, index) =>
            index +
            1 +
            '게임: ' +
            Array.from(card.querySelectorAll('.cm-number-ball'))
              .map((ball) => ball.textContent)
              .join(', '),
        )
        .join('\n'),
      'lotto-copy',
    );
  });

  render();
}
