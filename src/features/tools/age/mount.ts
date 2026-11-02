import type { ToolHelpers } from '../../../lib/tool/helpers';
import { calculateAge } from './age';

export function mountAgeCalculatorTool(
  _root: HTMLElement,
  helpers: ToolHelpers,
): void {
  const { $, value, listen } = helpers;
  const asOfInput = $('age-asof') as HTMLInputElement | null;

  if (asOfInput) {
    asOfInput.value = new Date(
      Date.now() - new Date().getTimezoneOffset() * 60000,
    )
      .toISOString()
      .slice(0, 10);
  }

  listen('age-calc', 'click', () => {
    const birthValue = value('age-birth');
    const asOfValue = value('age-asof');
    const output = $('age-result');

    if (!output) return;

    const birth = new Date(birthValue + 'T00:00:00');
    const asOf = new Date(asOfValue + 'T00:00:00');

    if (
      !birthValue ||
      !asOfValue ||
      Number.isNaN(birth.getTime()) ||
      Number.isNaN(asOf.getTime()) ||
      birth > asOf
    ) {
      output.textContent = '생년월일과 기준일을 확인하세요.';
      return;
    }

    const ageParts = calculateAge(birth, asOf);
    if (!ageParts) return;
    const { years, months, days } = ageParts;

    const age = document.createElement('div');
    age.className = 'text-2xl font-800';
    age.textContent = years + '세';

    const detail = document.createElement('p');
    detail.className =
      'm-0 mt-2 text-sm text-text-muted dark:text-dark-text-muted';
    detail.textContent =
      '만 ' + years + '년 ' + months + '개월 ' + days + '일입니다.';

    output.replaceChildren(age, detail);
  });
}
