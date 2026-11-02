import type { ToolHelpers } from '../../../lib/tool/helpers';
import { countText } from './text-counter';

export function mountTextCounterTool(
  _root: HTMLElement,
  helpers: ToolHelpers,
): void {
  const { $, listen, copy } = helpers;
  const input = $('text-counter-input') as HTMLTextAreaElement | null;

  if (!input) return;

  const update = () => {
    const stats = countText(input.value);
    const values: Record<string, number> = {
      'text-counter-characters': stats.characters,
      'text-counter-no-space': stats.charactersWithoutWhitespace,
      'text-counter-words': stats.words,
      'text-counter-lines': stats.lines,
      'text-counter-paragraphs': stats.paragraphs,
      'text-counter-bytes': stats.utf8Bytes,
      'text-counter-korean': stats.koreanSyllables,
    };

    for (const [id, value] of Object.entries(values)) {
      const output = $(id);
      if (output) output.textContent = value.toLocaleString('ko-KR');
    }
  };

  listen('text-counter-input', 'input', update);
  listen('text-counter-clear', 'click', () => {
    input.value = '';
    update();
    input.focus();
  });
  listen('text-counter-copy', 'click', async () => {
    await copy(input.value, 'text-counter-copy');
  });

  update();
}
