import type { ToolHelpers } from '../../../lib/tool/helpers';
import { calculateDateDifference } from './date';

export function mountDateCalculatorTool(
  _root: HTMLElement,
  helpers: ToolHelpers,
): void {
  const { $, value, format, listen } = helpers;

  listen('date-calc', 'click', () => {
    const startValue = value('date-start');
    const endValue = value('date-end');
    const output = $('date-result');

    if (!output) return;

    if (!startValue || !endValue) {
      output.textContent = '두 날짜를 모두 선택하세요.';
      return;
    }

    const start = new Date(startValue + 'T00:00:00');
    const end = new Date(endValue + 'T00:00:00');

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      output.textContent = '올바른 날짜를 입력하세요.';
      return;
    }

    const days = calculateDateDifference(start, end);
    if (days === null) return;

    const summary = document.createElement('strong');
    summary.className = 'text-xl';
    summary.textContent = format(days) + '일';

    const note = document.createElement('p');
    note.className =
      'm-0 mt-2 text-sm text-text-muted dark:text-dark-text-muted';
    note.textContent =
      '시작일과 종료일을 모두 포함하면 ' + format(days + 1) + '일입니다.';

    output.replaceChildren(summary, note);
  });
}
