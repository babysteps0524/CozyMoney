export type ToolEventName = 'click' | 'change' | 'input';

export interface ToolHelpers {
  $: (id: string) => HTMLElement | null;
  value: (id: string) => string;
  number: (id: string) => number;
  format: (n: number, digits?: number) => string;
  copy: (text: string, triggerId?: string) => Promise<boolean>;
  secureRandom: (max: number) => number;
  listen: (id: string, event: ToolEventName, handler: EventListener) => void;
}

export function createToolHelpers(root: HTMLElement): ToolHelpers {
  const $ = (id: string) => root.querySelector<HTMLElement>('#' + id);
  const value = (id: string) =>
    (
      ($(id) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)
        ?.value ?? ''
    ).trim();
  const number = (id: string) => Number(value(id));
  const format = (n: number, digits = 0) =>
    Number.isFinite(n)
      ? n.toLocaleString('ko-KR', { maximumFractionDigits: digits })
      : '-';

  const copy = async (text: string, triggerId?: string): Promise<boolean> => {
    const button = triggerId ? $(triggerId) : null;
    const originalText = button?.textContent ?? '';
    let succeeded = false;

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API is unavailable');
      }
      await navigator.clipboard.writeText(text);
      succeeded = true;
    } catch {
      succeeded = false;
    }

    if (button) {
      button.textContent = succeeded
        ? '복사되었습니다.'
        : '복사에 실패했습니다.';
      button.setAttribute('aria-live', 'polite');
      button.setAttribute(
        'aria-label',
        succeeded ? '복사되었습니다.' : '복사에 실패했습니다.',
      );
      window.setTimeout(() => {
        button.textContent = originalText;
        button.removeAttribute('aria-label');
      }, 1600);
    }

    return succeeded;
  };

  const secureRandom = (max: number) => {
    if (!Number.isSafeInteger(max) || max <= 0 || max > 0x100000000) return 0;
    const cryptoObj = globalThis.crypto;
    if (!cryptoObj?.getRandomValues) return Math.floor(Math.random() * max);
    const buf = new Uint32Array(1);
    const limit = Math.floor(0x100000000 / max) * max;
    do {
      cryptoObj.getRandomValues(buf);
    } while (buf[0] >= limit);
    return buf[0] % max;
  };

  const listen = (id: string, event: ToolEventName, handler: EventListener) => {
    $(id)?.addEventListener(event, handler);
  };

  return { $, value, number, format, copy, secureRandom, listen };
}
