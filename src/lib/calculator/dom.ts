import { parseNumber } from './number-input';
export { formatCalculatorNumber, formatCalculatorWon } from './format';

export function resetCalculatorFields(fields: ParentNode): void {
  fields.querySelectorAll<HTMLInputElement>('input').forEach((input) => {
    const defaultValue = input.dataset.defaultValue;
    if (defaultValue !== undefined) {
      input.value = defaultValue;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  fields.querySelectorAll<HTMLSelectElement>('select').forEach((select) => {
    select.selectedIndex = 0;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

export function getCalculatorField(
  root: ParentNode,
  id: string,
): HTMLInputElement | HTMLSelectElement | null {
  return root.querySelector<HTMLInputElement | HTMLSelectElement>('#' + id);
}

export function readCalculatorNumber(root: ParentNode, id: string): number {
  const field = getCalculatorField(root, id);
  if (field instanceof HTMLInputElement) {
    return parseNumber(field.value);
  }
  if (field instanceof HTMLSelectElement) {
    return parseNumber(field.value);
  }
  return 0;
}
