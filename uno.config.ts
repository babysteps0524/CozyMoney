import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWind4,
} from 'unocss';

import transformerAttributifyJsx from '@unocss/transformer-attributify-jsx';

// ─────────────────────────────────────────────
// 1. Colors: 기본 테마
// ─────────────────────────────────────────────

const lightColors = {
  // Brand
  primary: 'oklch(56% 0.19 250)',
  'primary-hover': 'oklch(50% 0.19 250)',
  'primary-active': 'oklch(45% 0.19 250)',

  // Surface
  surface: 'oklch(100% 0 0)',
  'surface-muted': 'oklch(97% 0.01 250)',
  'surface-subtle': 'oklch(94% 0.015 250)',

  // Text
  text: 'oklch(22% 0.02 250)',
  'text-muted': 'oklch(50% 0.025 250)',
  'text-subtle': 'oklch(62% 0.02 250)',

  // Border
  border: 'oklch(89% 0.02 250)',
  'border-strong': 'oklch(80% 0.025 250)',
  'border-active': 'oklch(56% 0.19 250)',

  // Feedback
  danger: 'oklch(56% 0.16 25)',
  'danger-surface': 'oklch(96% 0.025 25)',
  'danger-text': 'oklch(48% 0.16 25)',

  success: 'oklch(56% 0.14 160)',
  'success-surface': 'oklch(96% 0.03 160)',
  'success-text': 'oklch(40% 0.14 160)',
} as const;

// ─────────────────────────────────────────────
// 2. Colors: 다크 테마
// ─────────────────────────────────────────────

const darkColors = {
  // Brand
  'primary-surface': 'oklch(25% 0.04 250)',

  // Surface
  surface: 'oklch(18% 0.02 250)',
  'surface-muted': 'oklch(22% 0.025 250)',
  'surface-subtle': 'oklch(27% 0.025 250)',

  // Text
  text: 'oklch(96% 0.015 250)',
  'text-muted': 'oklch(74% 0.02 250)',
  'text-subtle': 'oklch(62% 0.02 250)',

  // Border
  border: 'oklch(31% 0.025 250)',
  'border-strong': 'oklch(40% 0.03 250)',
  'border-active': 'oklch(56% 0.19 250)',

  // Feedback
  danger: 'oklch(56% 0.16 25)',
  'danger-surface': 'oklch(25% 0.04 25)',
  'danger-text': 'oklch(78% 0.12 25)',

  success: 'oklch(56% 0.14 160)',
  'success-surface': 'oklch(22% 0.04 160)',
  'success-text': 'oklch(70% 0.12 160)',
} as const;

// ─────────────────────────────────────────────
// 3. Theme: UnoCSS 색상 토큰 연결
// ─────────────────────────────────────────────

const colors = {
  ...lightColors,

  ...Object.fromEntries(
    Object.entries(darkColors).map(([name, value]) => [`dark-${name}`, value]),
  ),
};

// ─────────────────────────────────────────────
// 4. Shortcuts: Layout
// ─────────────────────────────────────────────

const layoutShortcuts = {
  'cm-container': 'mx-auto min-w-0 w-full max-w-6xl px-4 md:px-6 lg:px-8',

  'cm-page':
    'min-h-screen bg-surface text-text dark:bg-dark-surface dark:text-dark-text',

  'cm-field': 'flex flex-col',

  'cm-divider': 'h-px w-full bg-border dark:bg-dark-border',
};

// ─────────────────────────────────────────────
// 5. Shortcuts: Card & Section
// ─────────────────────────────────────────────

const cardShortcuts = {
  'cm-card':
    'rounded-2xl border border-border bg-surface dark:border-dark-border dark:bg-dark-surface-muted',

  'cm-card-interactive':
    'cm-card cursor-pointer transition duration-50 ease-out hover:border-border-strong active:border-border-active dark:hover:border-dark-border-strong dark:active:border-dark-border-active',

  'cm-result':
    'rounded-xl border border-border bg-surface p-4 dark:border-dark-border dark:bg-dark-surface',

  'cm-result-primary':
    'rounded-xl border border-primary/25 bg-primary/5 p-4 dark:border-dark-border-active dark:bg-dark-primary-surface',

  'cm-result-row':
    'flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0 dark:border-dark-border',

  'cm-section-title':
    'm-0 text-xl font-bold tracking-tight text-text md:text-2xl dark:text-dark-text',
};

// ─────────────────────────────────────────────
// 6. Shortcuts: Button
// ─────────────────────────────────────────────

const buttonShortcuts = {
  'cm-button':
    'inline-flex cursor-pointer items-center justify-center rounded-xl font-semibold outline-none transition duration-50 ease-out focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-surface disabled:cursor-not-allowed disabled:opacity-50',

  'cm-button-primary':
    'cm-button bg-primary text-white hover:bg-primary-hover active:bg-primary-active',

  'cm-button-secondary':
    'cm-button border border-border bg-surface text-text-muted hover:border-border-strong active:border-border-active dark:border-dark-border dark:bg-dark-surface-muted dark:text-dark-text-muted dark:hover:border-dark-border-strong dark:hover:text-dark-text dark:active:bg-dark-surface-subtle',

  'cm-step-button':
    'cm-button h-11 w-11 shrink-0 border border-border bg-surface text-xl font-700 text-text-muted hover:border-border-strong hover:text-text active:bg-surface-subtle sm:h-12 sm:w-12 md:h-11 md:w-11 lg:h-12 lg:w-12 dark:border-dark-border dark:bg-dark-surface-muted dark:text-dark-text-muted dark:hover:border-dark-border-strong dark:hover:text-dark-text dark:active:bg-dark-surface-subtle',
};

// ─────────────────────────────────────────────
// 7. Shortcuts: Form & Feedback
// ─────────────────────────────────────────────

const formShortcuts = {
  'cm-input':
    'w-full rounded-xl border border-border cursor-pointer bg-surface px-4 py-3 text-base text-text outline-none transition duration-50 placeholder:text-text-subtle focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-text-subtle dark:focus:border-primary',

  'cm-label': 'mb-2 block text-sm font-semibold text-text dark:text-dark-text',

  'cm-help-text':
    'm-0 text-sm leading-6 text-text-muted dark:text-dark-text-muted',

  'cm-error':
    'm-0 text-sm leading-6 text-danger-text dark:text-dark-danger-text',

  'cm-number-ball':
    'inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-subtle text-sm font-800 text-text dark:bg-dark-surface-subtle dark:text-dark-text',
};

// ─────────────────────────────────────────────
// 8. Final UnoCSS Configuration
// ─────────────────────────────────────────────

export default defineConfig({
  presets: [
    presetWind4({ dark: 'media' }),
    presetAttributify(),
    presetIcons(),
    presetTypography(),
  ],

  transformers: [transformerAttributifyJsx()],

  theme: {
    fontFamily: {
      sans: '"Pretendard Variable", Pretendard, system-ui, sans-serif',
    },
    colors,
  },

  shortcuts: {
    ...layoutShortcuts,
    ...cardShortcuts,
    ...buttonShortcuts,
    ...formShortcuts,
  },
});
