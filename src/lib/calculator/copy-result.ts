export function bindCalculatorResultCopy(root: ParentNode): void {
  root
    .querySelectorAll<HTMLButtonElement>('[data-calculator-copy]')
    .forEach((button) => {
      if (button.dataset.copyBound === 'true') return;

      button.dataset.copyBound = 'true';
      const defaultLabel = button.textContent?.trim() || '결과 복사';
      let resetTimer: number | undefined;

      button.addEventListener('click', async () => {
        const selectors = button.dataset.copyTargets
          ?.split(',')
          .map((selector) => selector.trim())
          .filter(Boolean);
        const text = (selectors ?? [])
          .flatMap((selector) =>
            [...root.querySelectorAll<HTMLElement>(selector)].map((target) => {
              const clone = target.cloneNode(true) as HTMLElement;
              clone
                .querySelectorAll('[data-calculator-copy]')
                .forEach((item) => item.remove());
              return clone.innerText.trim();
            }),
          )
          .filter(Boolean)
          .join('\n');

        if (!text) {
          button.textContent = '결과가 없습니다.';
          return;
        }

        button.disabled = true;

        try {
          if (!navigator.clipboard?.writeText) {
            throw new Error('Clipboard API is unavailable.');
          }

          await navigator.clipboard.writeText(text);

          button.textContent = '복사되었습니다.';
        } catch {
          button.textContent = '복사에 실패했습니다.';
        } finally {
          button.disabled = false;
          if (resetTimer !== undefined) window.clearTimeout(resetTimer);
          resetTimer = window.setTimeout(() => {
            button.textContent = defaultLabel;
          }, 1600);
        }
      });
    });
}
