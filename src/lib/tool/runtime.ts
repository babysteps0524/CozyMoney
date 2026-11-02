import type { ToolHelpers } from './helpers';
import type { ToolKind } from './types';

type ToolLoader = (root: HTMLElement, helpers: ToolHelpers) => Promise<void>;

/**
 * Each loader imports only its own tool module when selected.
 * Record keeps the script registry exhaustive for every ToolKind.
 */
const toolLoaders: Record<ToolKind, ToolLoader> = {
  lotto: async (root, helpers) => {
    (await import('../../features/tools/lotto/mount')).mountLottoTool(
      root,
      helpers,
    );
  },
  random: async (root, helpers) => {
    (await import('../../features/tools/random/mount')).mountRandomNumberTool(
      root,
      helpers,
    );
  },
  picker: async (root, helpers) => {
    (await import('../../features/tools/picker/mount')).mountRandomPickerTool(
      root,
      helpers,
    );
  },
  password: async (root, helpers) => {
    (await import('../../features/tools/password/mount')).mountPasswordTool(
      root,
      helpers,
    );
  },
  date: async (root, helpers) => {
    (await import('../../features/tools/date/mount')).mountDateCalculatorTool(
      root,
      helpers,
    );
  },
  dday: async (root, helpers) => {
    (await import('../../features/tools/dday/mount')).mountDdayTool(
      root,
      helpers,
    );
  },
  age: async (root, helpers) => {
    (await import('../../features/tools/age/mount')).mountAgeCalculatorTool(
      root,
      helpers,
    );
  },
  unit: async (root, helpers) => {
    (await import('../../features/tools/unit/mount')).mountUnitConverterTool(
      root,
      helpers,
    );
  },
  percent: async (root, helpers) => {
    (
      await import('../../features/tools/percent/mount')
    ).mountPercentCalculatorTool(root, helpers);
  },
  'text-counter': async (root, helpers) => {
    (
      await import('../../features/tools/text-counter/mount')
    ).mountTextCounterTool(root, helpers);
  },
};

export async function mountTool(
  root: HTMLElement,
  helpers: ToolHelpers,
  kind: ToolKind,
): Promise<void> {
  await toolLoaders[kind](root, helpers);
}
