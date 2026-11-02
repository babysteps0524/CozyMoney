import { bindNumberControls } from './number-input';

export interface CalculatorInputOptions {
  change?: boolean;
  numberControls?: boolean;
}

const calculatorInputBindings = new WeakMap<
  ParentNode,
  { cleanup: () => void }
>();

export function bindCalculatorInputs(
  root: ParentNode,
  calculate: () => void,
  options: CalculatorInputOptions = {},
): () => void {
  const existing = calculatorInputBindings.get(root);
  if (existing) return existing.cleanup;

  let observer: MutationObserver | undefined;

  if (options.numberControls !== false) {
    bindNumberControls(root);

    if (root instanceof Element) {
      observer = new MutationObserver(() => bindNumberControls(root));
      observer.observe(root, { childList: true, subtree: true });
    }
  }

  const onInput = () => calculate();
  const onChange = () => calculate();

  root.addEventListener('input', onInput);
  if (options.change) {
    root.addEventListener('change', onChange);
  }

  let active = true;

  const cleanup = () => {
    if (!active) return;

    active = false;
    observer?.disconnect();
    root.removeEventListener('input', onInput);

    if (options.change) {
      root.removeEventListener('change', onChange);
    }

    calculatorInputBindings.delete(root);
  };

  calculatorInputBindings.set(root, { cleanup });
  return cleanup;
}
